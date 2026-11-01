package vn.thelooks.voting.infrastructure.external.outfit;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import vn.thelooks.voting.application.port.out.OutfitReader;
import vn.thelooks.voting.domain.exception.OutfitUnavailableException;
import vn.thelooks.voting.domain.model.PollOption;

@Component
class OutfitServiceClient implements OutfitReader {

    private static final Logger log = LoggerFactory.getLogger(OutfitServiceClient.class);

    private final RestClient outfit;

    OutfitServiceClient(RestClient outfitRestClient) {
        this.outfit = outfitRestClient;
    }

    @Override
    public Optional<PollOption> snapshot(UUID ownerId, UUID outfitId) {
        try {
            var detail = outfit.get().uri("/api/app/outfits/{id}", outfitId).retrieve().body(OutfitDetail.class);
            return detail == null ? Optional.empty() : Optional.of(new PollOption(detail.id(), detail.itemImageUrls()));
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        } catch (RestClientException e) {
            log.warn("Gọi outfit-service thất bại: {}", e.getMessage());
            throw new OutfitUnavailableException(e);
        }
    }

    private record OutfitDetail(UUID id, List<URI> itemImageUrls) {
    }
}
