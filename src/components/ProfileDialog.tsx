import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { User, Crown, Mail, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOut?: () => void;
}

interface UserProfile {
  display_name: string | null;
  avatar_url: string | null;
}

export const ProfileDialog: React.FC<ProfileDialogProps> = ({ open, onOpenChange, onSignOut }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isPremium, createPayPalSubscription } = useSubscription();
  const [profile, setProfile] = useState<UserProfile>({ display_name: null, avatar_url: null });
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && open) {
      loadProfile();
    }
  }, [user, open]);

  const loadProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName || null,
        });

      if (error) throw error;

      setProfile(prev => ({ ...prev, display_name: displayName || null }));
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown';

  const handleUpgrade = async () => {
    try {
      const approvalUrl = await createPayPalSubscription();
      if (approvalUrl) {
        window.location.href = approvalUrl;
      } else {
        toast({
          title: "Error",
          description: "Failed to create subscription. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error starting subscription:', error);
      toast({
        title: "Error", 
        description: "Failed to start subscription process",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {user ? 'Profile' : 'Welcome'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {user ? (
              <>
                {/* User Info Section */}
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">
                      {profile.display_name || 'Anonymous User'}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {user?.email}
                    </div>
                  </div>

                  <div className="flex justify-center gap-2">
                    {isPremium ? (
                      <Badge className="bg-gradient-to-r from-accent to-category-idea text-white">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Free Plan</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Profile Edit Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      disabled={isLoading || isSaving}
                    />
                  </div>

                  <Button 
                    onClick={saveProfile} 
                    disabled={isSaving || isLoading}
                    className="w-full"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>

                <Separator />

                {/* Account Info */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Member since</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {memberSince}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account type</span>
                    <span>{isPremium ? 'Premium' : 'Free'}</span>
                  </div>
                </div>

                {!isPremium && (
                  <div className="space-y-2">
                    <Button onClick={handleUpgrade} className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Premium - $8/month
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Get unlimited brain dumps every day
                    </p>
                  </div>
                )}

                <Separator />

                {/* Sign Out */}
                <div className="space-y-2">
                  <Button 
                    onClick={() => {
                      if (onSignOut) onSignOut();
                      onOpenChange(false);
                    }}
                    variant="outline" 
                    className="w-full text-destructive border-destructive/20 hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              /* Authentication buttons for non-authenticated users */
              <div className="space-y-4 text-center">
                <p className="text-muted-foreground">
                  Sign in to start creating brain dumps and unlock premium features
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/auth')}
                    className="w-full"
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};