
-- Tắt Row Level Security cho bảng staff để cho phép insert dữ liệu demo
ALTER TABLE public.staff DISABLE ROW LEVEL SECURITY;

-- Xóa dữ liệu cũ nếu có và insert lại dữ liệu staff demo
DELETE FROM public.staff;

-- Insert dữ liệu staff demo
INSERT INTO public.staff (
  username, 
  password, 
  staff_name, 
  role, 
  department, 
  account_status, 
  failed_login_attempts
) VALUES
('admin', '123456', 'Quản trị viên', 'admin', 'IT', 'active', 0),
('user1', '123456', 'Nguyễn Văn A', 'user', 'CMT8', 'active', 0),
('user2', '123456', 'Trần Thị B', 'user', 'QLN', 'active', 0),
('user3', '123456', 'Lê Văn C', 'user', 'NQ', 'active', 0);
