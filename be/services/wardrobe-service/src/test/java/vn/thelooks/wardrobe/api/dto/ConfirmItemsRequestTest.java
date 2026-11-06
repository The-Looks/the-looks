package vn.thelooks.wardrobe.api.dto;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.Validation;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.thelooks.wardrobe.domain.model.Category;

class ConfirmItemsRequestTest {
    @Test
    void validatesBatchShapeAndNestedAttributes() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            var attrs = new AttributesRequest(Category.TOP, List.of("white"), null, Set.of(), Set.of());
            var valid = new ConfirmItemsRequest.Item(UUID.randomUUID(), attrs);
            assertThat(validator.validate(new ConfirmItemsRequest(List.of(valid)))).isEmpty();
            assertThat(validator.validate(new ConfirmItemsRequest(null))).isNotEmpty();
            assertThat(validator.validate(new ConfirmItemsRequest(List.of()))).isNotEmpty();
            assertThat(validator.validate(new ConfirmItemsRequest(Arrays.asList((ConfirmItemsRequest.Item) null)))).isNotEmpty();
            assertThat(validator.validate(new ConfirmItemsRequest(List.of(new ConfirmItemsRequest.Item(null, attrs))))).isNotEmpty();
            assertThat(validator.validate(new ConfirmItemsRequest(List.of(new ConfirmItemsRequest.Item(UUID.randomUUID(), null))))).isNotEmpty();
            var noCategory = new AttributesRequest(null, List.of(), null, Set.of(), Set.of());
            assertThat(validator.validate(new ConfirmItemsRequest(List.of(new ConfirmItemsRequest.Item(UUID.randomUUID(), noCategory))))).isNotEmpty();
        }
    }
}
