package vn.thelooks.auth.application.port.in;

import java.util.List;
import vn.thelooks.auth.domain.model.AuditLog;

public interface GetAuditLogUseCase {
    List<AuditLog> audit(String search, String outcome, int limit);
}
