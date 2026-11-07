CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    city VARCHAR(120),
    avatar_content_type VARCHAR(20),
    avatar_bytes BYTEA,
    avatar_updated_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_profiles_avatar_size CHECK (avatar_bytes IS NULL OR octet_length(avatar_bytes) <= 2097152)
);
