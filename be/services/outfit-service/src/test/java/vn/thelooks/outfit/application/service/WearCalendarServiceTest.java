package vn.thelooks.outfit.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.thelooks.outfit.application.port.out.OutfitRepository;
import vn.thelooks.outfit.application.port.out.WearCalendarAccess;
import vn.thelooks.outfit.application.port.out.WearCalendarLockedException;
import vn.thelooks.outfit.application.port.out.WearPlanRepository;
import vn.thelooks.outfit.application.usecase.WearCalendarUseCase.Day;
import vn.thelooks.outfit.domain.exception.InvalidOutfitException;
import vn.thelooks.outfit.domain.exception.OutfitNotFoundException;
import vn.thelooks.outfit.domain.model.Outfit;

class WearCalendarServiceTest {

    private static final UUID OWNER = UUID.randomUUID();
    private static final LocalDate D1 = LocalDate.of(2026, 11, 1);
    private static final LocalDate D2 = LocalDate.of(2026, 11, 2);
    private final WearPlanRepository plans = mock(WearPlanRepository.class);
    private final OutfitRepository outfits = mock(OutfitRepository.class);
    private final WearCalendarAccess access = mock(WearCalendarAccess.class);
    private final WearCalendarService service = new WearCalendarService(plans, outfits, access);

    @Test
    void mergesPlannedAndWornDays() {
        UUID planned = UUID.randomUUID();
        UUID worn = UUID.randomUUID();
        when(plans.plans(OWNER, D1, D2)).thenReturn(Map.of(D1, planned, D2, planned));
        when(plans.worn(OWNER, D1, D2)).thenReturn(List.of(new WearPlanRepository.Worn(D2, worn)));

        assertEquals(List.of(new Day(D1, planned, List.of()), new Day(D2, planned, List.of(worn))),
                service.calendar(OWNER, D1, D2));
    }

    @Test
    void rejectsBadRangesBeforeAskingBilling() {
        assertThrows(InvalidOutfitException.class, () -> service.calendar(OWNER, D2, D1));
        assertThrows(InvalidOutfitException.class, () -> service.calendar(OWNER, D1, D1.plusDays(62)));
        verify(access, never()).requireWearCalendar();
    }

    @Test
    void freePlanCannotPlan() {
        doThrow(new WearCalendarLockedException()).when(access).requireWearCalendar();

        assertThrows(WearCalendarLockedException.class, () -> service.plan(OWNER, D1, UUID.randomUUID()));
        verify(plans, never()).plan(any(), any(), any());
    }

    @Test
    void cannotPlanSomeoneElsesOutfit() {
        UUID outfitId = UUID.randomUUID();
        when(outfits.findById(outfitId)).thenReturn(Optional.of(
                new Outfit(outfitId, UUID.randomUUID(), List.of(), null, Instant.now())));

        assertThrows(OutfitNotFoundException.class, () -> service.plan(OWNER, D1, outfitId));
        verify(plans, never()).plan(any(), any(), any());
    }

    @Test
    void plansOwnOutfit() {
        UUID outfitId = UUID.randomUUID();
        when(outfits.findById(outfitId)).thenReturn(Optional.of(
                new Outfit(outfitId, OWNER, List.of(), null, Instant.now())));

        service.plan(OWNER, D1, outfitId);

        verify(plans).plan(OWNER, D1, outfitId);
    }
}
