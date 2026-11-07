package vn.thelooks.outfit.application.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.thelooks.outfit.application.port.out.OutfitRepository;
import vn.thelooks.outfit.application.port.out.WearCalendarAccess;
import vn.thelooks.outfit.application.port.out.WearPlanRepository;
import vn.thelooks.outfit.application.usecase.WearCalendarUseCase;
import vn.thelooks.outfit.domain.exception.InvalidOutfitException;
import vn.thelooks.outfit.domain.exception.OutfitNotFoundException;

@Service
class WearCalendarService implements WearCalendarUseCase {

    private final WearPlanRepository plans;
    private final OutfitRepository outfits;
    private final WearCalendarAccess access;

    WearCalendarService(WearPlanRepository plans, OutfitRepository outfits, WearCalendarAccess access) {
        this.plans = plans;
        this.outfits = outfits;
        this.access = access;
    }

    @Override
    public List<Day> calendar(UUID ownerId, LocalDate from, LocalDate to) {
        if (to.isBefore(from) || ChronoUnit.DAYS.between(from, to) >= MAX_DAYS) {
            throw new InvalidOutfitException("Khoảng ngày không hợp lệ (tối đa " + MAX_DAYS + " ngày)");
        }
        access.requireWearCalendar();
        Map<LocalDate, UUID> planned = plans.plans(ownerId, from, to);
        Map<LocalDate, List<UUID>> worn = new TreeMap<>();
        for (var w : plans.worn(ownerId, from, to)) {
            worn.computeIfAbsent(w.date(), d -> new ArrayList<>()).add(w.outfitId());
        }
        var days = new TreeMap<LocalDate, Day>();
        planned.forEach((date, outfit) -> days.put(date, new Day(date, outfit, List.of())));
        worn.forEach((date, ids) -> days.put(date, new Day(date, planned.get(date), List.copyOf(ids))));
        return List.copyOf(days.values());
    }

    @Override
    public void plan(UUID ownerId, LocalDate date, UUID outfitId) {
        access.requireWearCalendar();
        outfits.findById(outfitId).filter(o -> o.ownerId().equals(ownerId))
                .orElseThrow(() -> new OutfitNotFoundException("Không tìm thấy outfit"));
        plans.plan(ownerId, date, outfitId);
    }

    @Override
    public void unplan(UUID ownerId, LocalDate date) {
        access.requireWearCalendar();
        plans.unplan(ownerId, date);
    }
}
