import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Settings, User, Crown, Sparkles } from 'lucide-react';

interface HeaderProps {
  dumpsCount: number;
  isPremium?: boolean;
  displayName?: string;
  onSignOut?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  dumpsCount, 
  isPremium = false,
  displayName,
  onSignOut,
  onProfileClick,
  onSettingsClick 
}) => {
  const maxDumps = isPremium ? Infinity : 10;
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo - Enhanced with gradient and animation --copyright */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <Brain className="h-8 w-8 text-primary animate-pulse-soft transition-transform group-hover:scale-110 duration-300" />
              <Sparkles className="h-3 w-3 text-accent absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              BrainDump
            </h1>
          </div>
          
          {isPremium && (
            <Badge className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 animate-pulse-soft">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>

        {/* Usage Counter - Enhanced with better styling --copyright */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <div className="text-sm">
              {isPremium ? (
                <span className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ∞ Unlimited dumps
                </span>
              ) : (
                <span className="text-muted-foreground">
                  <span className="font-bold text-lg text-foreground">{dumpsCount}</span>
                  <span className="mx-1.5 text-muted-foreground/50">/</span>
                  <span className="text-xs">1 daily dump</span>
                </span>
              )}
            </div>
          </div>
          
          {!isPremium && dumpsCount >= 1 && (
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300"
            >
              <Crown className="h-3 w-3 mr-1.5" />
              Upgrade
            </Button>
          )}
        </div>

        {/* User Actions - Enhanced with hover effects --copyright */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSettingsClick}
            className="hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-full"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onProfileClick} 
            className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-full px-3"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="h-3 w-3 text-white" />
            </div>
            {displayName && <span className="hidden sm:inline text-sm font-medium">{displayName}</span>}
          </Button>
        </div>
      </div>
    </header>
  );
};