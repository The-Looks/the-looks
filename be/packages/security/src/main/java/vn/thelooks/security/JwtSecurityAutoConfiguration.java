package vn.thelooks.security;

import java.util.ArrayList;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;

/**
 * Mọi service đều là OAuth2 resource server, xác thực JWT do auth-service phát.
 * Chạy trước cấu hình bảo mật mặc định của Spring Boot để thay thế nó.
 *
 * <p>Quy ước đường dẫn: /api/public/** không cần đăng nhập, /api/admin/** cần quyền ADMIN_ACCESS.
 */
@AutoConfiguration(beforeName = {
        "org.springframework.boot.security.autoconfigure.web.servlet.ServletWebSecurityAutoConfiguration",
        "org.springframework.boot.security.autoconfigure.actuate.web.servlet.ManagementWebSecurityAutoConfiguration",
        "org.springframework.boot.security.oauth2.server.resource.autoconfigure.web.OAuth2ResourceServerWebSecurityAutoConfiguration"})
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@EnableWebSecurity
@EnableMethodSecurity
public class JwtSecurityAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean(SecurityFilterChain.class)
    SecurityFilterChain securityFilterChain(HttpSecurity http,
            @Value("${WEB_ORIGIN:http://localhost:5173}") String webOrigin) throws Exception {
        return http
                .csrf(csrf -> csrf.disable()) // CookieOriginFilter protects cookie-authenticated writes.
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(new CookieOriginFilter(webOrigin), BearerTokenAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health/**", "/api/public/**", "/.well-known/jwks.json").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/polls/users/*/data",
                                "/api/admin/wardrobe/users/*/data", "/api/admin/outfits/users/*/data",
                                "/api/admin/billing/users/*/data")
                        .hasAnyAuthority("PERMISSION_ADMIN_ACCESS", "PERMISSION_INTERNAL_ACCOUNT_DELETE")
                        .requestMatchers("/api/admin/**").hasAuthority("PERMISSION_ADMIN_ACCESS")
                        .requestMatchers("/api/app/me").hasAuthority("PERMISSION_ACCOUNT_READ_SELF")
                        .requestMatchers("/api/app/**").access((authentication, context) -> new AuthorizationDecision(
                                authentication.get().isAuthenticated() && authentication.get().getAuthorities().stream()
                                        .noneMatch(a -> a.getAuthority().equals("PERMISSION_INTERNAL_ACCOUNT_DELETE"))))
                        .anyRequest().authenticated())
                .oauth2ResourceServer(o -> o.bearerTokenResolver(new CookieBearerTokenResolver())
                        .jwt(Customizer.withDefaults()))
                .build();
    }

    @Bean
    @ConditionalOnMissingBean
    JwtDecoder jwtDecoder(
            @Value("${thelooks.security.jwk-set-uri}") String jwkSetUri,
            @Value("${thelooks.security.issuer}") String issuer,
            @Value("${thelooks.security.session-validation-uri:}") String sessionValidationUri) {
        var decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri)
                .jwsAlgorithm(SignatureAlgorithm.RS256)
                .build();
        decoder.setJwtValidator(sessionValidationUri.isBlank() ? JwtValidators.createDefaultWithIssuer(issuer)
                : new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefaultWithIssuer(issuer),
                        new SessionStatusValidator(sessionValidationUri)));
        return decoder;
    }

    /** Chuyển role và permission trong JWT thành authorities cho Spring Security. */
    @Bean
    @ConditionalOnMissingBean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        var roles = new JwtGrantedAuthoritiesConverter();
        roles.setAuthoritiesClaimName("roles");
        roles.setAuthorityPrefix("ROLE_");
        var permissions = new JwtGrantedAuthoritiesConverter();
        permissions.setAuthoritiesClaimName("permissions");
        permissions.setAuthorityPrefix("PERMISSION_");
        var converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            var granted = new ArrayList<>(roles.convert(jwt));
            granted.addAll(permissions.convert(jwt));
            return granted;
        });
        return converter;
    }

    @Bean
    BearerTokenForwardingInterceptor bearerTokenForwardingInterceptor() {
        return new BearerTokenForwardingInterceptor();
    }

    @Bean
    AccountDeletionAuthorization accountDeletionAuthorization() {
        return new AccountDeletionAuthorization();
    }
}
