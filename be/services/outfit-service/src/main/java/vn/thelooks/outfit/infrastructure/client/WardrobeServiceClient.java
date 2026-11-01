package vn.thelooks.outfit.infrastructure.client;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import vn.thelooks.outfit.application.port.out.WardrobeReader;
import vn.thelooks.outfit.application.port.out.WardrobeUnavailableException;
import vn.thelooks.outfit.domain.model.ClosetItem;

/** Gọi wardrobe-service với JWT của người dùng (RestClient đã gắn BearerTokenForwardingInterceptor). */
@Component
@ConditionalOnProperty(name = "thelooks.services.wardrobe-fake", havingValue = "false", matchIfMissing = true)
class WardrobeServiceClient implements WardrobeReader {

    private static final Logger log = LoggerFactory.getLogger(WardrobeServiceClient.class);

    private final RestClient wardrobe;

    WardrobeServiceClient(RestClient wardrobeRestClient) {
        this.wardrobe = wardrobeRestClient;
    }

    /** ownerId không cần gửi đi: wardrobe-service lấy userId từ JWT được chuyển tiếp. */
    @Override
    public List<ClosetItem> confirmedItems(UUID ownerId) {
        try {
            WardrobeItemResponse[] items = wardrobe.get()
                    .uri("/api/app/wardrobe/items?status=CONFIRMED")
                    .retrieve()
                    .body(WardrobeItemResponse[].class);
            return items == null ? List.of() : Arrays.stream(items).map(WardrobeItemResponse::toClosetItem).toList();
        } catch (RestClientException e) {
            log.warn("Gọi wardrobe-service thất bại: {}", e.getMessage());
            throw new WardrobeUnavailableException(e);
        }
    }
}
