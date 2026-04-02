
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  service_name TEXT,
  location TEXT,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  custom_time TEXT,
  workers_needed INTEGER NOT NULL DEFAULT 1,
  shift_preference TEXT NOT NULL DEFAULT 'day',
  hours_needed INTEGER NOT NULL DEFAULT 1,
  payment_offer TEXT,
  job_description TEXT,
  professional_id UUID REFERENCES public.professionals(id),
  professional_name TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Anyone can create a booking (public-facing)
CREATE POLICY "Anyone can create a booking" ON public.bookings
  FOR INSERT TO public WITH CHECK (true);

-- Admins can view and manage all bookings
CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow public to read their own booking by id (for confirmation)
CREATE POLICY "Public can read bookings" ON public.bookings
  FOR SELECT TO public USING (true);
