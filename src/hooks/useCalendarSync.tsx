import { useCallback } from 'react';
import { BrainDump } from '@/components/CategorySection';
import { useToast } from '@/hooks/use-toast';

export const useCalendarSync = () => {
  const { toast } = useToast();

  const generateICSContent = useCallback((brainDumps: BrainDump[]) => {
    const header = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BrainDump//Calendar Export//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ].join('\r\n');

    const footer = 'END:VCALENDAR';

    const events = brainDumps
      .filter(dump => dump.category === 'task' || dump.category === 'reminder')
      .map(dump => {
        const now = new Date();
        const eventDate = new Date(dump.timestamp);
        const endDate = new Date(eventDate.getTime() + (60 * 60 * 1000)); // 1 hour duration
        
        // Format dates for ICS (YYYYMMDDTHHMMSSZ)
        const formatDate = (date: Date) => {
          return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        };

        const uid = `braindump-${dump.id}@braindump.app`;
        const summary = dump.text.substring(0, 100); // Limit summary length
        const description = `Category: ${dump.category}\\nStatus: ${dump.completed ? 'Completed' : 'Pending'}\\nTags: ${dump.tags.join(', ')}`;

        return [
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTAMP:${formatDate(now)}`,
          `DTSTART:${formatDate(eventDate)}`,
          `DTEND:${formatDate(endDate)}`,
          `SUMMARY:${summary}`,
          `DESCRIPTION:${description}`,
          `CATEGORIES:${dump.category.toUpperCase()}`,
          dump.completed ? 'STATUS:COMPLETED' : 'STATUS:NEEDS-ACTION',
          'END:VEVENT'
        ].join('\r\n');
      });

    return [header, ...events, footer].join('\r\n');
  }, []);

  const exportToCalendar = useCallback((brainDumps: BrainDump[]) => {
    try {
      const icsContent = generateICSContent(brainDumps);
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `braindump-export-${new Date().toISOString().split('T')[0]}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Calendar exported!",
        description: "Your brain dumps have been exported as a calendar file",
      });
    } catch (error) {
      console.error('Error exporting calendar:', error);
      toast({
        title: "Export failed",
        description: "Failed to export calendar file",
        variant: "destructive",
      });
    }
  }, [generateICSContent, toast]);

  const syncToSystemCalendar = useCallback(async (brainDumps: BrainDump[]) => {
    // This is a placeholder for future calendar API integration
    // Different platforms have different APIs:
    // - Web: Calendar API (limited support)
    // - Mobile: Native calendar APIs
    // - Desktop: Platform-specific APIs
    
    toast({
      title: "Calendar sync",
      description: "Direct calendar sync coming soon. Use export for now.",
    });
  }, [toast]);

  return {
    exportToCalendar,
    syncToSystemCalendar,
    generateICSContent
  };
};