package vn.thelooks.wardrobe.api.dto;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.Validation;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class ConfirmItemsRequestTest {
    @Test
    void validatesBatchShapeAndNestedAttributes() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            var attrs = JsonMapper.builder().build().readValue("{\"category\":\"TOP\"}", AttributesRequest.class);
            var valid = new ConfirmItemsRequest.Item(UUID.randomUUID(), attrs);
            assertThat(validator.validate(new ConfirmItemsRequest(List.of(valid)))).isEmpty();
            assertThat(validator.validate(new ConfirmItemsRequest(null))).isNotEmpty();
            assertThat(validator.validate(new ConfirmItemsRequest(List.of()))).isNotEmpty();
            assertThat(validator.validate(new ConfirmItemsRequest(Arrays.asList((ConfirmItemsRequest.Item) null)))).isNotEmpty();
            assertThat(validator.validate(new ConfirmItemsRequest(List.of(new ConfirmItemsRequest.Item(null, attrs))))).isNotEmpty();
            assertThat(validator.validate(new ConfirmItemsRequest(List.of(new ConfirmItemsRequest.Item(UUID.randomUUID(), null))))).isNotEmpty();
            var noCategory = JsonMapper.builder().build().readValue("{}", AttributesRequest.class);
            assertThat(validator.validate(new ConfirmItemsRequest(List.of(new ConfirmItemsRequest.Item(UUID.randomUUID(), noCategory))))).isNotEmpty();
        }
    }
}
