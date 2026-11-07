CREATE TABLE voting_deleted_owner (owner_id UUID PRIMARY KEY, deleted_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE FUNCTION reject_deleted_poll_owner() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    PERFORM pg_advisory_xact_lock(hashtextextended(NEW.owner_id::text, 0));
    IF EXISTS (SELECT 1 FROM voting_deleted_owner WHERE owner_id = NEW.owner_id) THEN
        RAISE EXCEPTION 'Account is being deleted' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER polls_owner_guard BEFORE INSERT OR UPDATE ON polls
FOR EACH ROW EXECUTE FUNCTION reject_deleted_poll_owner();
