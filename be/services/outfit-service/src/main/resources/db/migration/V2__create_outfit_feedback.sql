-- Thích / không thích một tổ hợp món. combo_key = id các món sắp xếp tăng dần, nối bằng dấu phẩy (tối đa 10 món).
create table outfit_feedback (
    owner_id   uuid         not null,
    combo_key  varchar(400) not null,
    vote       varchar(10)  not null check (vote in ('LIKE', 'DISLIKE')),
    updated_at timestamptz  not null,
    primary key (owner_id, combo_key)
);
