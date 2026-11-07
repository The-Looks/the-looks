package vn.thelooks.billing.application.service;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import vn.thelooks.billing.application.port.in.ManageBillingUserDataUseCase;
import vn.thelooks.billing.application.port.out.BillingUserDataRepositoryPort;
import vn.thelooks.billing.application.port.out.PaymentGateway;
import vn.thelooks.billing.domain.model.AdminBillingSummary;

@Service
class ManageBillingUserDataService implements ManageBillingUserDataUseCase {
    private final BillingUserDataRepositoryPort repository;
    private final PaymentGateway gateway;
    ManageBillingUserDataService(BillingUserDataRepositoryPort repository, PaymentGateway gateway) {
        this.repository = repository;
        this.gateway = gateway;
    }
    public AdminBillingSummary summary(UUID userId) { return repository.summary(userId); }
    public void delete(UUID userId) {
        for (long orderCode : repository.pendingOrderCodes(userId)) {
            if (!gateway.cancelUnpaid(orderCode))
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Đơn " + orderCode + " đã nhận tiền hoặc chưa hủy được; cần đối soát trước khi xóa");
            if (!repository.markCancelled(userId, orderCode))
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Trạng thái đơn " + orderCode + " đã đổi; cần đối soát trước khi xóa");
        }
        repository.delete(userId);
    }
}
