-- =====================================================================
-- RZ COFFE & EATERY — PostgreSQL schema (Railway)
-- Jalankan sekali: `npm run db:init`  (butuh DATABASE_URL di .env / .env.local)
-- atau tempel manual di Railway -> Postgres -> Query.
-- Idempotent: aman dijalankan ulang berkali-kali.
-- =====================================================================

-- ---------- USERS ----------
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  email text not null unique,
  password_hash text not null,
  role text not null default 'user',
  created_at timestamptz not null default now()
);
-- kolom baru (kalau tabel sudah ada dari versi lama)
alter table users add column if not exists role text not null default 'user';
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_role_check'
  ) then
    alter table users add constraint users_role_check
      check (role in ('user','admin'));
  end if;
end $$;

-- ---------- PRODUCTS ----------
create table if not exists products (
  id text primary key,
  name text not null,
  category text not null,
  price integer not null,
  image text,
  emoji text,
  description text,
  rating numeric(2,1) default 4.5,
  tag text,
  sort integer default 0,
  available boolean not null default true,
  created_at timestamptz not null default now()
);
alter table products add column if not exists available boolean not null default true;

insert into products (id, name, category, price, image, emoji, description, rating, tag, sort) values
('es-kopi-susu','Es Kopi Susu Gula Aren','Kopi',22000,'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&q=80','🧋','Espresso, susu segar, dan gula aren cair. Manis lembut, disajikan dingin.',4.8,'Favorit',1),
('cappuccino','Cappuccino Klasik','Kopi',26000,'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80','☕','Espresso dengan busa susu tebal dan taburan bubuk kakao.',4.7,null,2),
('americano','Americano Panas','Kopi',20000,'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80','☕','Espresso murni dengan air panas. Pahit bersih tanpa gula.',4.5,null,3),
('latte-caramel','Caramel Latte','Kopi',28000,'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&q=80','🥤','Latte lembut dengan saus karamel dan whipped cream.',4.6,'Baru',4),
('matcha-latte','Matcha Latte','Non-Kopi',27000,'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&q=80','🍵','Matcha Jepang premium dengan susu segar.',4.7,'Favorit',5),
('chocolate','Cokelat Panas','Non-Kopi',24000,'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&q=80','🍫','Cokelat pekat dengan susu, hangat dan menenangkan.',4.4,null,6),
('lemon-tea','Es Lemon Tea','Non-Kopi',18000,'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=800&q=80','🍋','Teh hitam dingin dengan perasan lemon segar.',4.3,null,7),
('orange-juice','Jus Jeruk Segar','Non-Kopi',21000,'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80','🍊','Jeruk peras murni tanpa gula tambahan.',4.6,null,8),
('croissant','Croissant Butter','Makanan',25000,'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80','🥐','Croissant panggang berlapis dengan butter premium.',4.8,'Favorit',9),
('club-sandwich','Club Sandwich','Makanan',38000,'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80','🥪','Roti panggang isi ayam, telur, selada, dan tomat.',4.7,null,10),
('beef-burger','Beef Burger','Makanan',45000,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80','🍔','Patty sapi, keju leleh, dan saus spesial dalam roti brioche.',4.9,'Favorit',11),
('pancake','Pancake Madu','Makanan',32000,'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=80','🥞','Tumpukan pancake lembut dengan madu dan mentega.',4.5,null,12),
('french-fries','French Fries','Snack',20000,'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80','🍟','Kentang goreng renyah dengan saus mayo.',4.4,null,13),
('donut','Donat Gula','Snack',15000,'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80','🍩','Donat lembut berlumur gula halus.',4.6,null,14),
('cookies','Cookies Cokelat','Snack',17000,'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80','🍪','Kue kering dengan potongan cokelat melimpah.',4.5,null,15),
('cheesecake','Cheesecake Slice','Snack',30000,'https://images.unsplash.com/photo-1533134242453-e9d9b9b3a5a1?w=800&q=80','🍰','Cheesecake panggang dengan saus berry.',4.7,'Baru',16)
on conflict (id) do update set
  name = excluded.name, category = excluded.category, price = excluded.price,
  image = excluded.image, emoji = excluded.emoji, description = excluded.description,
  rating = excluded.rating, tag = excluded.tag, sort = excluded.sort;

-- ---------- ORDERS ----------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','paid','expired','cancelled')),
  subtotal integer not null default 0,
  discount integer not null default 0,
  total integer not null default 0,
  payment_method text not null default 'QRIS',
  qris_payload text,
  qris_ref text,
  voucher_code text,
  customer_name text,
  note text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
alter table orders add column if not exists discount integer not null default 0;
alter table orders add column if not exists voucher_code text;

-- ---------- ORDER ITEMS ----------
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id text,
  name text not null,
  price integer not null,
  qty integer not null,
  line_total integer not null
);

-- ---------- VOUCHERS ----------
create table if not exists vouchers (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  type text not null check (type in ('percent','amount')),
  value integer not null,
  scope text not null default 'all' check (scope in ('all','category','product')),
  scope_value text,
  min_spend integer not null default 0,
  max_discount integer,
  active boolean not null default true,
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit integer,
  used_count integer not null default 0,
  created_at timestamptz not null default now()
);

insert into vouchers (code, description, type, value, scope, scope_value, min_spend, max_discount, active) values
('RZ20','Diskon 20% semua menu (maks Rp15.000)','percent',20,'all',null,50000,15000,true),
('KOPI5K','Potongan Rp5.000 khusus menu Kopi','amount',5000,'category','Kopi',0,null,true)
on conflict (code) do nothing;

create index if not exists orders_user_idx on orders (user_id, created_at desc);
create index if not exists order_items_order_idx on order_items (order_id);
create index if not exists products_sort_idx on products (sort);
