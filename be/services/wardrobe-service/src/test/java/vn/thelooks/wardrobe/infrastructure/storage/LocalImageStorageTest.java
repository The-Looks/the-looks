package vn.thelooks.wardrobe.infrastructure.storage;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class LocalImageStorageTest {

    @TempDir
    Path dir;

    @Test
    void storesReadsAndDeletes() {
        var storage = new LocalImageStorage(dir.toString(), "http://localhost:5173/");
        String key = storage.store(UUID.randomUUID(), new byte[] {1, 2, 3}, "image/jpeg");
        assertThat(storage.read(key)).hasValueSatisfying(b -> assertThat(b).containsExactly(1, 2, 3));
        assertThat(storage.url(key, null).toString()).isEqualTo("http://localhost:5173/api/public/wardrobe/images/" + key);
        storage.delete(key);
        assertThat(storage.read(key)).isEmpty();
    }

    @Test
    void refusesPathsOutsideTheImageFolder() throws Exception {
        Files.writeString(dir.resolve("secret.txt"), "x");
        var storage = new LocalImageStorage(dir.resolve("images").toString(), "http://x");
        assertThat(storage.read("../secret.txt")).isEmpty();
        assertThat(storage.read(UUID.randomUUID() + "/../../secret.txt")).isEmpty();
    }
}
