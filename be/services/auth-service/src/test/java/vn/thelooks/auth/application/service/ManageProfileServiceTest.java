package vn.thelooks.auth.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import java.util.Base64;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import vn.thelooks.auth.application.port.out.UserProfileRepositoryPort;

class ManageProfileServiceTest {
    private final UserProfileRepositoryPort profiles = mock(UserProfileRepositoryPort.class);
    private final ManageProfileService service = new ManageProfileService(profiles);

    @Test
    void trimsNameAndCityBeforeSaving() {
        UUID userId = UUID.randomUUID();
        service.update(userId, "  Lan  ", "  Hà Nội  ");
        verify(profiles).update(userId, "Lan", "Hà Nội");
    }

    @Test
    void acceptsOnlyKnownMascots() {
        UUID userId = UUID.randomUUID();
        service.selectMascot(userId, "fox");
        verify(profiles).selectMascot(userId, "fox");
        service.selectMascot(userId, "panda");
        verify(profiles).selectMascot(userId, "panda");
        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> service.selectMascot(userId, "unknown")).getStatusCode().value());
    }

    @Test
    void rejectsOversizedOrUntrustedAvatar() {
        UUID userId = UUID.randomUUID();
        assertThrows(ResponseStatusException.class, () -> service.uploadAvatar(userId, new byte[2 * 1024 * 1024 + 1]));
        var error = assertThrows(ResponseStatusException.class,
                () -> service.uploadAvatar(userId, "<svg/>".getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        assertEquals(415, error.getStatusCode().value());
    }

    @Test
    void acceptsAValidPngAvatar() {
        UUID userId = UUID.randomUUID();
        byte[] image = Base64.getDecoder().decode(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lS8AAAAASUVORK5CYII=");
        service.uploadAvatar(userId, image);
        verify(profiles).saveAvatar(userId, image, "image/png");
    }
}
