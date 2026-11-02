-- Hồ sơ phong cách người dùng tự khai. Mọi cột đều không bắt buộc (null = không muốn nói / không giới hạn).
create table outfit_preferences (
    owner_id   uuid primary key,
    gender     varchar(10) check (gender in ('MALE', 'FEMALE', 'OTHER')),
    styles     varchar(200) not null default '', -- nhãn phong cách nối bằng dấu phẩy
    budget     varchar(10) check (budget in ('LOW', 'MID', 'HIGH')),
    updated_at timestamptz not null
);
