package vn.thelooks.outfit.application.usecase;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Lịch mặc (Pro): lên lịch outfit theo ngày, xem ngày nào đã mặc gì. */
public interface WearCalendarUseCase {

    /** Khoảng xem tối đa: đủ một tháng cộng phần tuần đầu / cuối của lưới lịch. */
    int MAX_DAYS = 62;

    /** Chỉ trả những ngày có lịch hoặc đã mặc, sắp theo ngày. */
    List<Day> calendar(UUID ownerId, LocalDate from, LocalDate to);

    void plan(UUID ownerId, LocalDate date, UUID outfitId);

    void unplan(UUID ownerId, LocalDate date);

    record Day(LocalDate date, UUID plannedOutfitId, List<UUID> wornOutfitIds) {
    }
}
