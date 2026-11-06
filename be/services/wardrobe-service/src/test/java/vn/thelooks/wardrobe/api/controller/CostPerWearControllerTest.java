package vn.thelooks.wardrobe.api.controller;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import java.math.BigDecimal;
import java.net.URI;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import vn.thelooks.wardrobe.application.port.out.*;
import vn.thelooks.wardrobe.application.usecase.GetCostPerWearQuery;
import vn.thelooks.wardrobe.domain.exception.ClothingItemNotFoundException;
import vn.thelooks.wardrobe.domain.exception.InvalidItemStateException;
import vn.thelooks.wardrobe.domain.model.*;

class CostPerWearControllerTest {
    @Test
    void returnsCurrentOwnersCalculationAndDisablesCaching() {
        UUID owner = UUID.randomUUID(), id = UUID.randomUUID();
        var query = mock(GetCostPerWearQuery.class); var images = mock(ImageStorage.class);
        var attrs = new ClothingAttributes(Category.TOP, List.of(), null, Set.of(), Set.of(), new BigDecimal("300000"), null, null);
        var item = new ClothingItem(id, owner, "image.jpg", ItemStatus.CONFIRMED, attrs, null, null, Instant.now());
        var entry = new GetCostPerWearQuery.Entry(item, CostPerWear.calculate(attrs.purchasePrice(), 10));
        when(query.item(owner, id)).thenReturn(entry);
        when(images.url(any(), any())).thenReturn(URI.create("https://images.example/item.jpg"));
        var jwt = Jwt.withTokenValue("token").header("alg", "RS256").subject(owner.toString()).build();
        var response = new CostPerWearController(query, images).item(jwt, id);
        assertThat(response.getHeaders().getCacheControl()).isEqualTo("no-store");
        assertThat(response.getBody().costPerWear()).isEqualByComparingTo("30000");
        assertThat(response.getBody().wearCount()).isEqualTo(10); verify(query).item(owner, id);
    }
    @Test
    void mapsFeatureOwnershipStateAndDependencyErrors() {
        var c = new CostPerWearController(mock(GetCostPerWearQuery.class), mock(ImageStorage.class));
        assertThat(c.denied(new CostPerWearAccessDeniedException()).getStatus()).isEqualTo(403);
        assertThat(c.missing(new ClothingItemNotFoundException("missing")).getStatus()).isEqualTo(404);
        assertThat(c.conflict(new InvalidItemStateException("pending")).getStatus()).isEqualTo(409);
        assertThat(c.unavailable(new WearHistoryUnavailableException(null)).getStatus()).isEqualTo(503);
    }
}
