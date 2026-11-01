-- Mỗi lần gọi AI: token và chi phí (USD) để giới hạn theo người dùng/ngày và theo ngân sách tháng.
create table outfit_ai_usage (
    id            bigint generated always as identity primary key,
    owner_id      uuid          not null,
    model         varchar(60)   not null,
    input_tokens  bigint        not null,
    output_tokens bigint        not null,
    cost_usd      numeric(12, 6) not null,
    created_at    timestamptz   not null
);
create index idx_outfit_ai_usage_owner on outfit_ai_usage (owner_id, created_at);
create index idx_outfit_ai_usage_created on outfit_ai_usage (created_at);
