ALTER TABLE polls ADD COLUMN hidden BOOLEAN NOT NULL DEFAULT FALSE;
CREATE TABLE poll_reports (
 id UUID PRIMARY KEY,
 poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
 reporter_key VARCHAR(64) NOT NULL,
 ip_key VARCHAR(64) NOT NULL,
 reason VARCHAR(300) NOT NULL,
 status VARCHAR(12) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','IGNORED','HIDDEN')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 reviewed_at TIMESTAMPTZ,
 reviewed_by UUID,
 UNIQUE (poll_id,reporter_key)
);
CREATE INDEX poll_reports_status_created_idx ON poll_reports (status,created_at DESC);
CREATE TABLE poll_moderation_audit (
 id UUID PRIMARY KEY,
 actor_id UUID NOT NULL,
 poll_code VARCHAR(32) NOT NULL,
 action VARCHAR(20) NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
