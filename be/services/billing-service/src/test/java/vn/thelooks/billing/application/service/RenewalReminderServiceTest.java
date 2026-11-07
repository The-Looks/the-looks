package vn.thelooks.billing.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.thelooks.billing.application.port.out.ContactEmailReader;
import vn.thelooks.billing.application.port.out.RenewalMailer;
import vn.thelooks.billing.application.port.out.RenewalReminderRepository;
import vn.thelooks.billing.application.port.out.RenewalReminderRepository.Due;
import vn.thelooks.billing.domain.model.BillingPeriod;
import vn.thelooks.billing.domain.model.Plan;

class RenewalReminderServiceTest {

    private static final Instant NOW = Instant.parse("2026-11-07T00:00:00Z");
    private final ContactEmailReader emails = mock(ContactEmailReader.class);
    private final RenewalReminderRepository reminders = mock(RenewalReminderRepository.class);
    private final RenewalMailer mailer = mock(RenewalMailer.class);
    private final RenewalReminderService service =
            new RenewalReminderService(emails, reminders, mailer, Clock.fixed(NOW, ZoneOffset.UTC));

    private static Due due(String email) {
        return new Due(UUID.randomUUID(), email, Plan.PLUS, BillingPeriod.MONTHLY, NOW.plusSeconds(86_400));
    }

    @Test
    void doesNothingWhenMailIsNotConfigured() {
        when(mailer.enabled()).thenReturn(false);

        assertEquals(0, service.remindDue());
        verify(reminders, never()).due(any());
    }

    @Test
    void marksOnlySentRemindersAndKeepsGoingAfterAFailure() {
        var broken = due("broken@example.com");
        var ok = due("ok@example.com");
        when(mailer.enabled()).thenReturn(true);
        when(reminders.due(NOW)).thenReturn(List.of(broken, ok));
        doThrow(new IllegalStateException("Brevo 500")).when(mailer).send(broken);

        assertEquals(1, service.remindDue());
        verify(reminders, never()).markReminded(broken.ownerId(), broken.expiresAt());
        verify(reminders).markReminded(ok.ownerId(), ok.expiresAt());
    }

    @Test
    void remembersTheEmailOfThePayingUserButNeverBreaksCheckout() {
        UUID owner = UUID.randomUUID();
        when(emails.currentUserEmail()).thenReturn(Optional.of("lan@example.com"));
        service.rememberContact(owner);
        verify(reminders).saveContact(owner, "lan@example.com");

        when(emails.currentUserEmail()).thenThrow(new IllegalStateException("auth down"));
        service.rememberContact(owner); // không ném lỗi
    }
}
