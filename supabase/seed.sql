-- Seed Data for Supabase Ultimate Showcase

-- 1. Insert Roles
insert into public.roles (id, name, description) values
(1, 'admin', 'Administrator with full access'),
(2, 'moderator', 'Moderator who can manage content'),
(3, 'user', 'Standard user');

-- 3. Insert Products
insert into public.products (name, description, price, stock, attributes) values
('Laptop Pro', 'High performance laptop for developers', 1299.99, 50, '{"brand": "TechCorp", "color": "Silver", "specs": {"ram": "32GB", "storage": "1TB SSD"}}'),
('Wireless Mouse', 'Ergonomic wireless mouse', 49.99, 200, '{"brand": "ClickM", "color": "Black", "wireless": true}'),
('Mechanical Keyboard', 'RGB mechanical keyboard with blue switches', 89.99, 100, '{"brand": "KeyMaster", "color": "White", "switches": "Blue"}'),
('4K Monitor', '32-inch 4K UHD Monitor', 399.99, 30, '{"brand": "ViewSmart", "resolution": "4K", "size": "32inch"}'),
('Noise Cancelling Headphones', 'Over-ear headphones with ANC', 199.99, 80, '{"brand": "AudioTech", "color": "Black", "anc": true}');

-- Note: Users and Orders should be inserted dynamically or after Auth users are created.
-- In Supabase local development, it's easier to create users via the Auth UI or API,
-- which will trigger the public.profiles insertion.

-- Insert some dummy system metrics for chart demo
insert into public.system_metrics (cpu_usage, memory_usage, active_users, recorded_at) values
(12.5, 45.2, 100, now() - interval '5 hours'),
(15.2, 48.1, 120, now() - interval '4 hours'),
(22.8, 55.4, 250, now() - interval '3 hours'),
(45.6, 70.2, 400, now() - interval '2 hours'),
(30.1, 60.8, 310, now() - interval '1 hour'),
(18.4, 50.5, 180, now());

-- Mock analytics view refresh
-- select public.refresh_daily_sales_analytics();

-- ==============================================================================
-- DEMO ACCOUNTS CREATION (Admin + 3 Users)
-- ==============================================================================

-- Clear existing users (if any) to prevent duplication during reset
delete from auth.users where email in ('admin@example.com', 'user1@example.com', 'user2@example.com', 'user3@example.com');

-- Admin Account
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin@example.com', crypt('admin123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"System Admin"}', now(), now(), '', '', '', ''
);

-- User 1
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'user1@example.com', crypt('123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Demo User 1"}', now(), now(), '', '', '', ''
);

-- User 2
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'user2@example.com', crypt('123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Demo User 2"}', now(), now(), '', '', '', ''
);

-- User 3
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'user3@example.com', crypt('123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Demo User 3"}', now(), now(), '', '', '', ''
);

-- The trigger handle_new_user() will automatically insert them into public.profiles and public.user_roles as 'user' (role_id=3).
-- We need to update the admin's role to 1 (admin).
update public.user_roles 
set role_id = 1 
where user_id = '11111111-1111-1111-1111-111111111111';

-- Create some dummy direct messages between User 1 and User 2
insert into public.direct_messages (sender_id, receiver_id, content, created_at) values
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Hi User 2! How are you doing?', now() - interval '2 hours'),
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'I am doing great, testing the new realtime chat!', now() - interval '1.9 hours'),
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Awesome. It looks much better now.', now() - interval '1.8 hours');
