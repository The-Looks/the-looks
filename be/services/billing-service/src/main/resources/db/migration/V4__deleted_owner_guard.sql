CREATE TABLE billing_deleted_owner (owner_id UUID PRIMARY KEY, deleted_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE FUNCTION reject_deleted_billing_owner() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.owner_id IS NULL THEN RETURN NEW; END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended(NEW.owner_id::text, 0));
    IF EXISTS (SELECT 1 FROM billing_deleted_owner WHERE owner_id = NEW.owner_id) THEN
        RAISE EXCEPTION 'Account is being deleted' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER billing_order_owner_guard BEFORE INSERT OR UPDATE ON billing_order
FOR EACH ROW EXECUTE FUNCTION reject_deleted_billing_owner();
CREATE TRIGGER billing_subscription_owner_guard BEFORE INSERT OR UPDATE ON billing_subscription
FOR EACH ROW EXECUTE FUNCTION reject_deleted_billing_owner();
