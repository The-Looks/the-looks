package vn.thelooks.wardrobe.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.transaction.annotation.AnnotationTransactionAttributeSource;
import org.springframework.transaction.interceptor.TransactionInterceptor;
import vn.thelooks.wardrobe.application.port.out.ClothingItemRepository;
import vn.thelooks.wardrobe.application.usecase.ReviewClothingItemUseCase;
import vn.thelooks.wardrobe.application.usecase.ReviewClothingItemUseCase.Confirmation;
import vn.thelooks.wardrobe.domain.model.Category;
import vn.thelooks.wardrobe.domain.model.ClothingAttributes;
import vn.thelooks.wardrobe.domain.model.ClothingItem;
import vn.thelooks.wardrobe.domain.model.ItemStatus;

/** Verify the service's transaction boundary using PostgreSQL and a failing persistence port. */
@EnabledIfEnvironmentVariable(named = "WARDROBE_TEST_DB_URL", matches = ".+")
class BatchConfirmationTransactionTest {
    @Test
    void rollsBackEarlierWritesWhenSavingALaterItemFails() {
        String url = System.getenv("WARDROBE_TEST_DB_URL");
        var source = new DriverManagerDataSource(url);
        var jdbc = JdbcClient.create(source);
        String table = "batch_test_" + UUID.randomUUID().toString().replace("-", "");
        jdbc.sql("create table " + table + " (id uuid primary key, status varchar(20) not null)").update();
        try {
            UUID owner = UUID.randomUUID(), first = UUID.randomUUID(), second = UUID.randomUUID();
            for (UUID id : List.of(first, second)) {
                jdbc.sql("insert into " + table + " values (:id, 'PENDING_REVIEW')").param("id", id).update();
            }
            var attrs = new ClothingAttributes(Category.TOP, List.of(), null, Set.of(), Set.of());
            var repo = mock(ClothingItemRepository.class);
            when(repo.findById(any())).thenAnswer(call -> Optional.of(new ClothingItem(call.getArgument(0), owner,
                    "item.jpg", ItemStatus.PENDING_REVIEW, attrs, null, null, Instant.now())));
            when(repo.save(any())).thenAnswer(call -> {
                ClothingItem item = call.getArgument(0);
                jdbc.sql("update " + table + " set status = :status where id = :id")
                        .param("status", item.status().name()).param("id", item.id()).update();
                if (item.id().equals(second)) throw new IllegalStateException("Simulated database failure");
                return item;
            });
            var target = new WardrobeService(repo, null, null, null, null, null, Runnable::run, Clock.systemUTC());
            var proxy = new ProxyFactory(target);
            proxy.addAdvice(new TransactionInterceptor(new DataSourceTransactionManager(source), new AnnotationTransactionAttributeSource()));
            var service = (ReviewClothingItemUseCase) proxy.getProxy();
            assertThatThrownBy(() -> service.confirmAll(owner, List.of(new Confirmation(first, attrs), new Confirmation(second, attrs))))
                    .isInstanceOf(IllegalStateException.class);
            assertThat(jdbc.sql("select status from " + table).query(String.class).list())
                    .containsExactly("PENDING_REVIEW", "PENDING_REVIEW");
        } finally {
            jdbc.sql("drop table " + table).update();
        }
    }
}
