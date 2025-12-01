import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Settings, Bell, Download, Trash2 } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ 
  open, 
  onOpenChange
}) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [autoCategory, setAutoCategory] = useState(true);
  const [defaultView, setDefaultView] = useState('all');

  const handleExportData = () => {
    toast({
      title: "Export started",
      description: "Your data is being prepared for download",
    });
    // This would trigger actual export functionality
  };

  const handleDeleteAllData = () => {
    toast({
      title: "Feature coming soon",
      description: "Data deletion will be available in settings",
      variant: "destructive",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">

          {/* Notification Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Notifications</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Enable notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified about upcoming reminders
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </div>

          <Separator />

          {/* AI Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">AI Processing</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Auto-categorization</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically categorize new brain dumps
                </p>
              </div>
              <Switch
                checked={autoCategory}
                onCheckedChange={setAutoCategory}
              />
            </div>
          </div>

          <Separator />

          {/* View Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Default View</h4>
            
            <div className="space-y-2">
              <Label className="text-sm">Default category view</Label>
              <Select value={defaultView} onValueChange={setDefaultView}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="task">Tasks Only</SelectItem>
                  <SelectItem value="reminder">Reminders Only</SelectItem>
                  <SelectItem value="note">Notes Only</SelectItem>
                  <SelectItem value="idea">Ideas Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Data Management */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Data Management</h4>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleExportData}
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full justify-start" 
                onClick={handleDeleteAllData}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Data
              </Button>
            </div>
          </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};