
-- Enable RLS for cbqln and cbkh tables if not already enabled
ALTER TABLE public.cbqln ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbkh ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access for these tables
-- Since these are staff reference tables, we'll allow public read/write access
CREATE POLICY "Allow public select on cbqln" ON public.cbqln FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert on cbqln" ON public.cbqln FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update on cbqln" ON public.cbqln FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete on cbqln" ON public.cbqln FOR DELETE TO public USING (true);

CREATE POLICY "Allow public select on cbkh" ON public.cbkh FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert on cbkh" ON public.cbkh FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update on cbkh" ON public.cbkh FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete on cbkh" ON public.cbkh FOR DELETE TO public USING (true);
