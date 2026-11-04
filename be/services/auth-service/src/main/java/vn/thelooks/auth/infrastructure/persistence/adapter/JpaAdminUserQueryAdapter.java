package vn.thelooks.auth.infrastructure.persistence.adapter;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import vn.thelooks.auth.application.port.out.AdminUserQueryPort;
import vn.thelooks.auth.infrastructure.persistence.entity.UserJpaEntity;
import vn.thelooks.auth.infrastructure.persistence.repository.UserRepository;

@Component
class JpaAdminUserQueryAdapter implements AdminUserQueryPort {
    private final UserRepository users;

    JpaAdminUserQueryAdapter(UserRepository users) { this.users = users; }

    @Override
    public PageResult list(int page, int size, String search) {
        var pageable = PageRequest.of(Math.max(0, page), Math.max(1, Math.min(100, size)), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserJpaEntity> result = search == null || search.isBlank()
                ? users.findAll(pageable)
                : users.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(search.trim(), search.trim(), pageable);
        return new PageResult(result.map(user -> new UserRow(user.getId(), user.getUsername(), user.getEmail(),
                user.getStatus().name(), user.isEmailVerified(), user.getCreatedAt())).getContent(),
                result.getTotalElements(), result.getNumber(), result.getSize());
    }
}
