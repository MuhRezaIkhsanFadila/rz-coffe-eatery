-- 002: siklus hidup pesanan lengkap
-- Sebelumnya status berhenti di 'paid', jadi pesanan tidak pernah bisa
-- ditandai diproses / siap / selesai. Migrasi ini hanya melonggarkan constraint.
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('pending','paid','processing','ready','completed','expired','cancelled'));

create index if not exists orders_status_created_idx on orders (status, created_at desc);
