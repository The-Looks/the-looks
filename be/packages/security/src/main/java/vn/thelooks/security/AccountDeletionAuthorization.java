package vn.thelooks.security;

import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

/** Limits the short-lived internal deletion token to its single target account. */
public final class AccountDeletionAuthorization {
    public boolean canDelete(Authentication authentication, UUID targetId) {
        if (authentication == null || targetId == null) return false;
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("PERMISSION_USER_DELETE")))
            return true;
        return authentication instanceof JwtAuthenticationToken jwt
                && authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("PERMISSION_INTERNAL_ACCOUNT_DELETE"))
                && targetId.toString().equals(jwt.getToken().getClaimAsString("deletion_target"));
    }
}
