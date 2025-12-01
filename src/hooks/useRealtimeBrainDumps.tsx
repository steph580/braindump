import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BrainDump } from '@/components/CategorySection';

interface UseRealtimeBrainDumpsProps {
  onInsert: (dump: BrainDump) => void;
  onUpdate: (dump: BrainDump) => void;
  onDelete: (id: string) => void;
}

export const useRealtimeBrainDumps = ({ onInsert, onUpdate, onDelete }: UseRealtimeBrainDumpsProps) => {
  useEffect(() => {
    const channel = supabase
      .channel('brain_dumps_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'brain_dumps'
        },
        (payload) => {
          const newDump: BrainDump = {
            id: payload.new.id,
            text: payload.new.text,
            category: payload.new.category as BrainDump['category'],
            timestamp: new Date(payload.new.created_at),
            completed: payload.new.completed,
            tags: payload.new.tags || [],
          };
          onInsert(newDump);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'brain_dumps'
        },
        (payload) => {
          const updatedDump: BrainDump = {
            id: payload.new.id,
            text: payload.new.text,
            category: payload.new.category as BrainDump['category'],
            timestamp: new Date(payload.new.created_at),
            completed: payload.new.completed,
            tags: payload.new.tags || [],
          };
          onUpdate(updatedDump);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'brain_dumps'
        },
        (payload) => {
          onDelete(payload.old.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onInsert, onUpdate, onDelete]);
};