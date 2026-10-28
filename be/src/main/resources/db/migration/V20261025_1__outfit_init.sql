-- Module outfit. Không có khoá ngoại sang bảng của module khác (item_id thuộc wardrobe).

create table outfit_outfit (
    id         uuid primary key,
    owner_id   uuid        not null,
    occasion   varchar(20),
    created_at timestamptz not null
);
create index idx_outfit_outfit_owner on outfit_outfit (owner_id, created_at desc);

create table outfit_outfit_item (
    outfit_id  uuid not null references outfit_outfit (id) on delete cascade,
    item_order int  not null,
    item_id    uuid not null,
    primary key (outfit_id, item_order)
);

create table outfit_wear_log (
    id        uuid primary key,
    owner_id  uuid        not null,
    outfit_id uuid        not null references outfit_outfit (id) on delete cascade,
    worn_at   timestamptz not null
);
create index idx_outfit_wear_log_owner on outfit_wear_log (owner_id);

create table outfit_wear_log_item (
    wear_log_id uuid not null references outfit_wear_log (id) on delete cascade,
    item_id     uuid not null
);
create index idx_outfit_wear_log_item_log on outfit_wear_log_item (wear_log_id);
