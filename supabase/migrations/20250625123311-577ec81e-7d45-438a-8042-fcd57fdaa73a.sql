
-- Enable RLS and create admin policies for cbqln table
ALTER TABLE public.cbqln ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can do everything on cbqln" 
ON public.cbqln 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.username = current_setting('app.current_user', true) 
    AND staff.role = 'admin'
  )
);

-- Enable RLS and create admin policies for cbkh table
ALTER TABLE public.cbkh ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can do everything on cbkh" 
ON public.cbkh 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.username = current_setting('app.current_user', true) 
    AND staff.role = 'admin'
  )
);

-- Enable RLS and create admin policies for ldpcrc table
ALTER TABLE public.ldpcrc ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can do everything on ldpcrc" 
ON public.ldpcrc 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.username = current_setting('app.current_user', true) 
    AND staff.role = 'admin'
  )
);

-- Enable RLS and create admin policies for cbcrc table
ALTER TABLE public.cbcrc ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can do everything on cbcrc" 
ON public.cbcrc 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.username = current_setting('app.current_user', true) 
    AND staff.role = 'admin'
  )
);

-- Enable RLS and create admin policies for quycrc table
ALTER TABLE public.quycrc ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can do everything on quycrc" 
ON public.quycrc 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.username = current_setting('app.current_user', true) 
    AND staff.role = 'admin'
  )
);

-- Enable RLS and create admin policies for asset_reminders table
ALTER TABLE public.asset_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can do everything on asset_reminders" 
ON public.asset_reminders 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.username = current_setting('app.current_user', true) 
    AND staff.role = 'admin'
  )
);

-- Enable RLS and create admin policies for crc_reminders table
ALTER TABLE public.crc_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can do everything on crc_reminders" 
ON public.crc_reminders 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.username = current_setting('app.current_user', true) 
    AND staff.role = 'admin'
  )
);

-- Enable RLS and create admin policies for notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can do everything on notifications" 
ON public.notifications 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.username = current_setting('app.current_user', true) 
    AND staff.role = 'admin'
  )
);

-- Enable RLS and create admin policies for other_assets table
ALTER TABLE public.other_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can do everything on other_assets" 
ON public.other_assets 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.username = current_setting('app.current_user', true) 
    AND staff.role = 'admin'
  )
);

-- Enable RLS and create admin policies for staff table
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can do everything on staff" 
ON public.staff 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.username = current_setting('app.current_user', true) 
    AND staff.role = 'admin'
  )
);
