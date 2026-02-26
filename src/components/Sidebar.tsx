import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogoutModal } from './LogoutModal';
import {
  Brain,
  Settings,
  User,
  LogOut,
  Crown,
  CheckCircle2,
  Bell,
  BarChart3,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  remainingDumps?: number;
  isPremium?: boolean;
}

const navItems = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'dumps', label: 'Dumps', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  onProfileClick,
  onSettingsClick,
  remainingDumps,
  isPremium,
}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };

  // Calculate usage percentage
  const usagePercentage = remainingDumps ? ((10 - remainingDumps) / 10) * 100 : 0;

  return (
    <>
      <LogoutModal
        open={logoutModalOpen}
        onOpenChange={setLogoutModalOpen}
        onConfirm={handleSignOut}
      />
      <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 flex items-center justify-center">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight">BrainDump</h1>
            <p className="text-[10px] text-muted-foreground">Organize Your Thoughts</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className="nav-item"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Usage Health */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium">Usage Status</p>
                <p className={`text-[10px] font-medium ${usagePercentage < 50 ? 'text-green-600' : usagePercentage < 80 ? 'text-amber-600' : 'text-red-600'}`}>
                  {remainingDumps}/10 used
                </p>
              </div>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${usagePercentage < 50 ? 'from-green-500 to-green-600' : usagePercentage < 80 ? 'from-amber-500 to-amber-600' : 'from-red-500 to-red-600'} rounded-full`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            {remainingDumps !== undefined && remainingDumps <= 2 && !isPremium && (
              <Button
                className="w-full mt-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-xs"
                size="sm"
              >
                <Crown className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            )}
          </div>

          {/* User Profile Section */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/30 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-medium truncate">{user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
              {isPremium && (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-xs px-1.5 py-0.5">
                  <Crown className="h-2 w-2 mr-1" />
                  Premium
                </Badge>
              )}
              <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-secondary border border-border/50 rounded-lg overflow-hidden shadow-lg">
                <button
                  onClick={() => {
                    onProfileClick?.();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-secondary/80 transition-colors flex items-center gap-2 border-b border-border/30"
                >
                  <User className="w-3 h-3" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    onSettingsClick?.();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-secondary/80 transition-colors flex items-center gap-2 border-b border-border/30"
                >
                  <Settings className="w-3 h-3" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    setLogoutModalOpen(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-vault-danger/10 transition-colors flex items-center gap-2 text-vault-danger"
                >
                  <LogOut className="w-3 h-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
