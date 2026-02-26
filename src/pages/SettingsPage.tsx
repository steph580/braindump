import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Settings, Bell, Download, Trash2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [autoCategory, setAutoCategory] = useState(true);
  const [defaultView, setDefaultView] = useState('all');

  const handleExportData = () => {
    toast({
      title: 'Export started',
      description: 'Your data is being prepared for download',
    });
  };

  const handleDeleteAllData = () => {
    toast({
      title: 'Feature coming soon',
      description: 'Data deletion will be available soon',
      variant: 'destructive',
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your preferences and account settings</p>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Notifications
          </CardTitle>
          <CardDescription>Control how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Enable Notifications</Label>
              <p className="text-sm text-slate-500">Receive alerts about your reminders</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Email Digest</Label>
              <p className="text-sm text-slate-500">Daily summary of your brain dumps</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            AI Processing
          </CardTitle>
          <CardDescription>Configure AI features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Auto-Categorization</Label>
              <p className="text-sm text-slate-500">Automatically categorize new brain dumps</p>
            </div>
            <Switch checked={autoCategory} onCheckedChange={setAutoCategory} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Smart Tags</Label>
              <p className="text-sm text-slate-500">AI-generated tags for your dumps</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* View Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Display Preferences</CardTitle>
          <CardDescription>Customize your dashboard experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium mb-2 block">Default Category View</Label>
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
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Manage your data and privacy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start border-slate-200 dark:border-slate-700"
            onClick={handleExportData}
          >
            <Download className="h-4 w-4 mr-3 text-blue-600" />
            <span>Export All Data</span>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={handleDeleteAllData}
          >
            <Trash2 className="h-4 w-4 mr-3" />
            <span>Delete All Data</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
