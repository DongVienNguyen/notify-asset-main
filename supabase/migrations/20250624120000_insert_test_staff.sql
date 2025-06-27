
-- Insert test staff data for demo purposes
INSERT INTO public.staff (username, password, staff_name, role, department, account_status, failed_login_attempts) VALUES
('admin', '123456', 'Quản trị viên', 'admin', 'IT', 'active', 0),
('user1', '123456', 'Nguyễn Văn A', 'user', 'CMT8', 'active', 0),
('user2', '123456', 'Trần Thị B', 'user', 'QLN', 'active', 0),
('user3', '123456', 'Lê Văn C', 'user', 'NQ', 'active', 0)
ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  staff_name = EXCLUDED.staff_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  account_status = EXCLUDED.account_status,
  failed_login_attempts = EXCLUDED.failed_login_attempts;
