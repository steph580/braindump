import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeBrainDumps } from '@/hooks/useRealtimeBrainDumps';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

import { Header } from '@/components/Header';
import { BrainDumpInput } from '@/components/BrainDumpInput';
import { CategorySection, BrainDump } from '@/components/CategorySection';
import { EmptyState } from '@/components/EmptyState';
import { ProfileDialog } from '@/components/ProfileDialog';
import { SettingsDialog } from '@/components/SettingsDialog';
import { DashboardLayout } from '@/components/DashboardLayout';

// Constants
const CATEGORY_ORDER = ['task', 'reminder', 'note', 'idea'] as const;
const DEFAULT_AI_RESULT = {
  category: 'note' as const,
  priority: 'medium' as const,
  tags: [],
};

// Types
interface UserProfile {
  display_name: string | null;
}

interface ProcessedItem {
  category: string;
  refinedText: string;
  priority: string;
  tags: string[];
}

const Index: React.FC = () => {
  // Hooks
  const { toast } = useToast();
  const navigate = useNavigate();
  const { subscription, isPremium, checkDumpLimit } = useSubscription();

  // State
  const [brainDumps, setBrainDumps] = useState<BrainDump[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({ display_name: null });
  const [remainingDumps, setRemainingDumps] = useState<number | undefined>(undefined);

  // Effects
  useEffect(() => {
    initializeUserData();
  }, []);

  // Initialization
  const initializeUserData = async (): Promise<void> => {
    await Promise.all([
      loadBrainDumps(),
      loadUserProfile(),
      loadUsageInfo(),
    ]);
  };

  // Data Loading
  const loadUsageInfo = async (): Promise<void> => {
    try {
      const limitCheck = await checkDumpLimit();
      setRemainingDumps(
        limitCheck.remaining_dumps === -1 ? undefined : limitCheck.remaining_dumps
      );
    } catch (error) {
      console.error('Error loading usage info:', error);
    }
  };

  const loadBrainDumps = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('brain_dumps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDumps: BrainDump[] = (data || []).map(dump => ({
        id: dump.id,
        text: dump.text,
        category: dump.category,
        timestamp: new Date(dump.created_at),
        completed: dump.completed,
        tags: dump.tags || [],
      }));

      setBrainDumps(formattedDumps);
    } catch (error) {
      console.error('Error loading brain dumps:', error);
      showErrorToast('Failed to load your brain dumps');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Real-time Callbacks
  const handleRealtimeInsert = useCallback((dump: BrainDump): void => {
    setBrainDumps(prev => {
      const exists = prev.some(d => d.id === dump.id);
      return exists ? prev : [dump, ...prev];
    });
  }, []);

  const handleRealtimeUpdate = useCallback((dump: BrainDump): void => {
    setBrainDumps(prev => prev.map(d => (d.id === dump.id ? dump : d)));
  }, []);

  const handleRealtimeDelete = useCallback((id: string): void => {
    setBrainDumps(prev => prev.filter(d => d.id !== id));
  }, []);

  // Real-time Subscription
  useRealtimeBrainDumps({
    onInsert: handleRealtimeInsert,
    onUpdate: handleRealtimeUpdate,
    onDelete: handleRealtimeDelete,
  });

  // AI Processing
  const processWithAI = async (text: string): Promise<ProcessedItem[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('process-brain-dump', {
        body: { text },
      });

      if (error) throw error;

      return data.items || [{ ...DEFAULT_AI_RESULT, refinedText: text }];
    } catch (error) {
      console.error('AI processing failed:', error);
      return [{ ...DEFAULT_AI_RESULT, refinedText: text }];
    }
  };

  // User Actions
  const handleSubmit = async (text: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsProcessing(true);
    showInfoToast('AI is analyzing and categorizing your thoughts', 'Processing your brain dump...');

    try {
      const limitCheck = await checkDumpLimit();
      if (!limitCheck.can_dump) {
        showLimitReachedToast();
        return;
      }

      const processedItems = await processWithAI(text);
      await saveBrainDumps(processedItems, user.id);
      
      if (!isPremium) {
        await incrementDailyDumpCount(user.id);
      }

      showSuccessToast(processedItems);
      await loadUsageInfo();
    } catch (error) {
      console.error('Error creating brain dump:', error);
      showErrorToast('Failed to process your brain dump');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveBrainDumps = async (items: ProcessedItem[], userId: string): Promise<void> => {
    const insertData = items.map(item => ({
      user_id: userId,
      text: item.refinedText,
      category: item.category,
      completed: false,
      tags: item.tags || [],
    }));

    const { error } = await supabase
      .from('brain_dumps')
      .insert(insertData)
      .select();

    if (error) throw error;
  };

  const incrementDailyDumpCount = async (userId: string): Promise<void> => {
    await supabase.rpc('increment_daily_dump', {
      p_user_id: userId,
    });
  };

  const handleToggleComplete = async (id: string): Promise<void> => {
    const dump = brainDumps.find(d => d.id === id);
    if (!dump) return;

    try {
      const { error } = await supabase
        .from('brain_dumps')
        .update({ completed: !dump.completed })
        .eq('id', id);

      if (error) throw error;

      setBrainDumps(prev =>
        prev.map(d => (d.id === id ? { ...d, completed: !d.completed } : d))
      );
    } catch (error) {
      console.error('Error updating brain dump:', error);
      showErrorToast('Failed to update brain dump');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('brain_dumps')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBrainDumps(prev => prev.filter(dump => dump.id !== id));
      showInfoToast('Brain dump removed', 'Deleted');
    } catch (error) {
      console.error('Error deleting brain dump:', error);
      showErrorToast('Failed to delete brain dump');
    }
  };

  const handleEdit = async (id: string, newText: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('brain_dumps')
        .update({ text: newText })
        .eq('id', id);

      if (error) throw error;

      setBrainDumps(prev =>
        prev.map(dump => (dump.id === id ? { ...dump, text: newText } : dump))
      );
      showInfoToast('Brain dump edited successfully', 'Updated');
    } catch (error) {
      console.error('Error updating brain dump:', error);
      showErrorToast('Failed to update brain dump');
    }
  };

  // Navigation Actions
  const handleSignOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleProfileClick = (): void => {
    setProfileOpen(true);
  };

  const handleSettingsClick = (): void => {
    setSettingsOpen(true);
  };

  // Toast Helpers
  const showErrorToast = (description: string, title: string = 'Error'): void => {
    toast({ title, description, variant: 'destructive' });
  };

  const showInfoToast = (description: string, title: string): void => {
    toast({ title, description });
  };

  const showLimitReachedToast = (): void => {
    toast({
      title: 'Daily limit reached',
      description: isPremium
        ? 'Something went wrong checking your premium status'
        : 'Free users can create 10 brain dumps per day. Upgrade to Premium for unlimited dumps!',
      variant: 'destructive',
    });
  };

  const showSuccessToast = (items: ProcessedItem[]): void => {
    const itemCount = items.length;
    toast({
      title: `${itemCount} brain dump${itemCount > 1 ? 's' : ''} processed!`,
      description:
        itemCount > 1
          ? `Split into ${itemCount} categorized items`
          : `Categorized as ${items[0].category}`,
    });
  };

  // Data Processing
  const getCategorizedDumps = () => {
    const allCategories = [...new Set(brainDumps.map(dump => dump.category))];
    const groupedDumps = allCategories.reduce((acc, category) => {
      acc[category] = brainDumps.filter(dump => dump.category === category);
      return acc;
    }, {} as Record<string, BrainDump[]>);

    const sortedCategories = [
      ...CATEGORY_ORDER.filter(cat => groupedDumps[cat]?.length > 0),
      ...allCategories.filter(
        cat => !CATEGORY_ORDER.includes(cat as typeof CATEGORY_ORDER[number]) && groupedDumps[cat]?.length > 0
      ),
    ];

    return { groupedDumps, sortedCategories };
  };

  // Render
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  const { groupedDumps, sortedCategories } = getCategorizedDumps();

  return (
    <DashboardLayout
      onProfileClick={handleProfileClick}
      onSettingsClick={handleSettingsClick}
      remainingDumps={remainingDumps}
      isPremium={isPremium}
    >
      <div className="flex flex-col h-full">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Brain Dump Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              You have <span className="font-semibold text-slate-700">{brainDumps.length}</span> brain dumps
            </p>
          </div>
          {isPremium && (
            <div className="px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg border border-amber-200">
              <p className="text-sm font-semibold text-amber-900">Premium Member</p>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <main className="container mx-auto px-8 py-8">
            <div className="mb-12 animate-scale-in">
              <BrainDumpInput
                onSubmit={handleSubmit}
                isProcessing={isProcessing}
                remainingDumps={remainingDumps}
                isPremium={isPremium}
                isAuthenticated={true}
              />
            </div>

            {brainDumps.length === 0 ? (
              <div className="animate-fade-in">
                <EmptyState />
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                {sortedCategories.map(category => (
                  <CategorySection
                    key={category}
                    title={category.charAt(0).toUpperCase() + category.slice(1)}
                    category={category}
                    dumps={groupedDumps[category]}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <ProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        onSignOut={handleSignOut}
      />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </DashboardLayout>
  );
};

export default Index;