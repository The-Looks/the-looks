package vn.thelooks.wardrobe.application.port.out;

import java.util.Optional;
import java.util.UUID;
import vn.thelooks.wardrobe.domain.model.Scan;

public interface ScanRepository {

    Scan save(Scan scan);

    Optional<Scan> findById(UUID id);
}
