import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Settings, Bell, Download, Trash2, BarChart3 } from 'lucide-react';

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
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Settings
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Notification Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Notifications</h3>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Enable Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive notifications about your reminders
                    </p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* AI Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">AI Processing</h3>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Auto-Categorization</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically categorize new brain dumps with AI
                    </p>
                  </div>
                  <Switch
                    checked={autoCategory}
                    onCheckedChange={setAutoCategory}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* View Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Default View</h3>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Default Category View</Label>
                  <Select value={defaultView} onValueChange={setDefaultView}>
                    <SelectTrigger className="bg-white dark:bg-slate-700">
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
            </div>

            <Separator />

            {/* Data Management */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold">Data Management</h3>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={handleExportData}
                >
                  <Download className="h-4 w-4 mr-3 text-blue-600" />
                  <span className="flex-1 text-left">Export All Data</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={handleDeleteAllData}
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  <span className="flex-1 text-left">Delete All Data</span>
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};