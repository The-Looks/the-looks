package vn.thelooks.wardrobe.application.port.out;

import java.util.Map;
import java.util.UUID;

public interface WearCountReader { Map<UUID, Long> wearCounts(UUID ownerId); }
