-- Create admin user
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin@example.com', crypt('12345678', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin User"}', now(), now(), '', '', '', ''
);

-- Create standard user
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'user@example.com', crypt('12345678', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Standard User"}', now(), now(), '', '', '', ''
);

-- The trigger handle_new_user() will automatically insert them into public.profiles and public.user_roles as 'user' (role_id=3).
-- We need to update the admin's role to 1 (admin).
update public.user_roles 
set role_id = 1 
where user_id = '11111111-1111-1111-1111-111111111111';

-- Create some dummy orders for the users so RLS demo is populated
insert into public.orders (id, user_id, total_amount, status) values 
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 1500.00, 'completed'),
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 250.00, 'pending'),
(uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 89.99, 'completed'),
(uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 199.99, 'pending');
