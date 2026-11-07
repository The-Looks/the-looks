CREATE TABLE wardrobe_deleted_owner (
 owner_id UUID PRIMARY KEY,
 deleted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
