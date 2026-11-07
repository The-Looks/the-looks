CREATE TABLE outfit_deleted_owner (owner_id UUID PRIMARY KEY, deleted_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE FUNCTION reject_deleted_outfit_owner() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    PERFORM pg_advisory_xact_lock(hashtextextended(NEW.owner_id::text, 0));
    IF EXISTS (SELECT 1 FROM outfit_deleted_owner WHERE owner_id = NEW.owner_id) THEN
        RAISE EXCEPTION 'Account is being deleted' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;
DO $$
DECLARE t text;
BEGIN
    FOREACH t IN ARRAY ARRAY['outfit_outfit','outfit_wear_log','outfit_feedback',
        'outfit_ai_usage','affiliate_click','outfit_preferences'] LOOP
        EXECUTE format('CREATE TRIGGER %I BEFORE INSERT OR UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION reject_deleted_outfit_owner()',
            t || '_owner_guard', t);
    END LOOP;
END;
$$;
