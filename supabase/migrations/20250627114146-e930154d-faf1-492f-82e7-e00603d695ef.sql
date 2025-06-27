
-- Temporarily disable the hash_password trigger
DROP TRIGGER IF EXISTS hash_password_trigger ON public.staff;

-- Insert test staff data with pre-hashed passwords using bcrypt
INSERT INTO public.staff (username, password, staff_name, role, department, account_status) 
VALUES 
  ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin', 'IT', 'active'),
  ('dongnv', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dong Nguyen Van', 'user', 'KT', 'active'),
  ('user1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test User 1', 'user', 'NQ', 'active')
ON CONFLICT (username) DO NOTHING;

-- Verify test data was inserted
SELECT username, staff_name, role, department, account_status FROM public.staff;
