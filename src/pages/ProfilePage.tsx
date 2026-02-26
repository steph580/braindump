import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { User, Crown, Mail, Calendar } from 'lucide-react';

interface UserProfile {
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPremium, createPayPalSubscription } = useSubscription();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setDisplayName(data.display_name || '');
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('user_id', user.id);

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      loadProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <span className="text-4xl font-bold text-white">
            {displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {displayName || 'Your Profile'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">{user?.email}</p>
          {isPremium && (
            <Badge className="mt-2 bg-amber-500 hover:bg-amber-600">
              <Crown className="h-3 w-3 mr-1" />
              Premium Member
            </Badge>
          )}
        </div>
      </div>

      {/* Profile Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <div className="flex gap-2">
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
              />
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving || displayName === profile?.display_name}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-slate-500" />
              <span className="text-slate-700 dark:text-slate-300">{user?.email}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Member Since</Label>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-500" />
              <span className="text-slate-700 dark:text-slate-300">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      {!isPremium && (
        <Card className="border-2 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-600" />
              Upgrade to Premium
            </CardTitle>
            <CardDescription>
              Unlock unlimited brain dumps and advanced features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-amber-600">✓</span>
                Unlimited brain dumps per day
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-600">✓</span>
                Advanced analytics
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-600">✓</span>
                Priority support
              </li>
            </ul>
            <Button
              onClick={createPayPalSubscription}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              Upgrade Now - $8/month
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
