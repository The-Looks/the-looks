CREATE TABLE google_oauth_flows (
    state_hash VARCHAR(64) PRIMARY KEY,
    nonce VARCHAR(64) NOT NULL,
    code_verifier VARCHAR(128) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX google_oauth_flows_expires_at_idx ON google_oauth_flows (expires_at);
