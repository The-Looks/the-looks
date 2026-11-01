CREATE TABLE polls (
    id UUID PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    owner_id UUID NOT NULL,
    question VARCHAR(140),
    outfit_a_id UUID NOT NULL,
    outfit_b_id UUID NOT NULL,
    option_a_images JSONB NOT NULL DEFAULT '[]'::jsonb,
    option_b_images JSONB NOT NULL DEFAULT '[]'::jsonb,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT polls_distinct_outfits_check CHECK (outfit_a_id <> outfit_b_id)
);

CREATE INDEX polls_owner_created_idx ON polls (owner_id, created_at DESC);

CREATE TABLE ballots (
    id UUID PRIMARY KEY,
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    voter_key CHAR(64) NOT NULL,
    choice CHAR(1) NOT NULL,
    cast_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ballots_choice_check CHECK (choice IN ('A', 'B')),
    CONSTRAINT ballots_poll_voter_uq UNIQUE (poll_id, voter_key)
);

CREATE INDEX ballots_poll_id_idx ON ballots (poll_id);
