
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view their own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.professionals
    WHERE professionals.id = notifications.professional_id
    AND professionals.user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can update their own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.professionals
    WHERE professionals.id = notifications.professional_id
    AND professionals.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can insert notifications"
ON public.notifications FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "Admins can manage all notifications"
ON public.notifications FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
