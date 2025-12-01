-- Enable real-time updates for brain_dumps table
ALTER TABLE public.brain_dumps REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.brain_dumps;