package vn.thelooks.billing.application.usecase;

import java.util.UUID;
import vn.thelooks.billing.domain.model.Entitlements;

/** Gói và quyền lợi hiện tại. Service khác gọi qua GET /api/app/billing/me với JWT của người dùng. */
public interface GetEntitlementsQuery {

    Entitlements entitlements(UUID ownerId);
}
