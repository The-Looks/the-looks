package vn.thelooks.auth.infrastructure.persistence.adapter;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import vn.thelooks.auth.application.port.out.AccountDeletionCoordinatorPort;

@Component
class AccountDeletionRetryScheduler {
    private final AccountDeletionCoordinatorPort coordinator;
    AccountDeletionRetryScheduler(AccountDeletionCoordinatorPort coordinator) { this.coordinator = coordinator; }

    @Scheduled(fixedDelayString = "${ACCOUNT_DELETION_RETRY_DELAY_MS:300000}",
            initialDelayString = "${ACCOUNT_DELETION_RETRY_DELAY_MS:300000}")
    void retry() { coordinator.retryOutstanding(); }
}
