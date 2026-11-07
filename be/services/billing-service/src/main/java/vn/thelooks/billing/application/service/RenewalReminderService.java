package vn.thelooks.billing.application.service;

import java.time.Clock;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import vn.thelooks.billing.application.port.out.ContactEmailReader;
import vn.thelooks.billing.application.port.out.RenewalMailer;
import vn.thelooks.billing.application.port.out.RenewalReminderRepository;
import vn.thelooks.billing.application.usecase.RenewalReminderUseCase;

@Service
class RenewalReminderService implements RenewalReminderUseCase {

    private static final Logger log = LoggerFactory.getLogger(RenewalReminderService.class);

    private final ContactEmailReader emails;
    private final RenewalReminderRepository reminders;
    private final RenewalMailer mailer;
    private final Clock clock;

    RenewalReminderService(ContactEmailReader emails, RenewalReminderRepository reminders, RenewalMailer mailer,
            Clock clock) {
        this.emails = emails;
        this.reminders = reminders;
        this.mailer = mailer;
        this.clock = clock;
    }

    @Override
    public void rememberContact(UUID ownerId) {
        try {
            emails.currentUserEmail().ifPresent(email -> reminders.saveContact(ownerId, email));
        } catch (RuntimeException e) {
            log.warn("Không lưu được email nhắc gia hạn cho {}: {}", ownerId, e.getMessage());
        }
    }

    @Override
    public int remindDue() {
        if (!mailer.enabled()) {
            return 0;
        }
        int sent = 0;
        for (var due : reminders.due(clock.instant())) {
            try {
                mailer.send(due);
                reminders.markReminded(due.ownerId(), due.expiresAt());
                sent++;
            } catch (RuntimeException e) {
                log.warn("Gửi email nhắc gia hạn cho {} lỗi, lần sau thử lại: {}", due.ownerId(), e.getMessage());
            }
        }
        if (sent > 0) {
            log.info("Đã gửi {} email nhắc gia hạn", sent);
        }
        return sent;
    }
}
