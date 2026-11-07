package vn.thelooks.auth.domain.model;

import java.time.Instant;

public record UserProfile(String username, String city, boolean hasAvatar, Instant avatarUpdatedAt) {}
