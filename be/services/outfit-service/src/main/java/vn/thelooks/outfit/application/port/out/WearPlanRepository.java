package vn.thelooks.outfit.application.port.out;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Lịch mặc: outfit đã lên lịch theo ngày và các lần đã mặc (ngày theo giờ Việt Nam). */
public interface WearPlanRepository {

    /** Ghi đè outfit đã lên lịch của ngày đó. */
    void plan(UUID ownerId, LocalDate date, UUID outfitId);

    void unplan(UUID ownerId, LocalDate date);

    /** Ngày → outfit đã lên lịch, trong khoảng [from, to]. */
    Map<LocalDate, UUID> plans(UUID ownerId, LocalDate from, LocalDate to);

    /** Các lần mặc trong khoảng [from, to]. */
    List<Worn> worn(UUID ownerId, LocalDate from, LocalDate to);

    record Worn(LocalDate date, UUID outfitId) {
    }
}
