-- Chống spam: lưu hash HMAC của IP theo từng poll (không lưu IP gốc, không so được giữa các poll).
ALTER TABLE ballots ADD COLUMN ip_key VARCHAR(64) NOT NULL DEFAULT '';
CREATE INDEX ballots_poll_ip_idx ON ballots (poll_id, ip_key);
