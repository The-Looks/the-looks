package vn.thelooks.wardrobe.api.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import vn.thelooks.wardrobe.domain.model.ItemStatus;

/** status chỉ dùng khi đổi trạng thái; xoá nhiều món thì bỏ trống. */
public record BatchItemsRequest(@NotEmpty @Size(max = 100) List<@NotNull UUID> itemIds, ItemStatus status) {}
