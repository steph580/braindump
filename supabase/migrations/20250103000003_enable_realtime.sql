-- Enable real-time updates for brain_dumps table
ALTER TABLE public.brain_dumps REPLICA IDENTITY FULL;

-- Add brain_dumps to the publication for real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.brain_dumps;
