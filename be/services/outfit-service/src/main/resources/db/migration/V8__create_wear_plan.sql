-- Lịch mặc (Pro): mỗi ngày tối đa một outfit đã lên lịch. Xoá outfit thì lịch của nó mất theo.
create table outfit_wear_plan (
    owner_id   uuid        not null,
    plan_date  date        not null,
    outfit_id  uuid        not null references outfit_outfit (id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (owner_id, plan_date)
);
create index idx_outfit_wear_plan_outfit on outfit_wear_plan (outfit_id);

create trigger outfit_wear_plan_owner_guard before insert or update on outfit_wear_plan
    for each row execute function reject_deleted_outfit_owner();
