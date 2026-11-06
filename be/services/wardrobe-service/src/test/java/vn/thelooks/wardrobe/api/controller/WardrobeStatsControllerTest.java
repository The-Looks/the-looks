package vn.thelooks.wardrobe.api.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import vn.thelooks.wardrobe.application.port.out.ImageStorage;
import vn.thelooks.wardrobe.application.port.out.StatsAccessUnavailableException;
import vn.thelooks.wardrobe.application.port.out.WardrobeStatsAccessDeniedException;
import vn.thelooks.wardrobe.application.usecase.GetWardrobeStatsQuery;

class WardrobeStatsControllerTest {
    @Test
    void usesJwtOwnerAndDisablesCachingOfProtectedStatistics() {
        UUID owner = UUID.randomUUID();
        var query = mock(GetWardrobeStatsQuery.class);
        when(query.stats(owner)).thenReturn(new GetWardrobeStatsQuery.Stats(0, 0, 0, 0, List.of(), List.of(), 0, 30, List.of(), Instant.now()));
        var controller = new WardrobeStatsController(query, mock(ImageStorage.class));
        var jwt = Jwt.withTokenValue("token").header("alg", "RS256").subject(owner.toString()).build();
        var response = controller.stats(jwt);
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getHeaders().getCacheControl()).isEqualTo("no-store");
        assertThat(response.getBody().totalItems()).isZero(); verify(query).stats(owner);
    }
    @Test
    void mapsMissingFeatureTo403AndDependencyFailuresTo503() {
        var controller = new WardrobeStatsController(mock(GetWardrobeStatsQuery.class), mock(ImageStorage.class));
        assertThat(controller.denied(new WardrobeStatsAccessDeniedException()).getStatus()).isEqualTo(403);
        assertThat(controller.unavailable(new StatsAccessUnavailableException(null)).getStatus()).isEqualTo(503);
    }
}
