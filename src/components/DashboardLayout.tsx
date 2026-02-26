import React from 'react';
import { Sidebar } from '@/components/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  remainingDumps?: number;
  isPremium?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  onProfileClick,
  onSettingsClick,
  remainingDumps,
  isPremium,
}) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        onProfileClick={onProfileClick}
        onSettingsClick={onSettingsClick}
        remainingDumps={remainingDumps}
        isPremium={isPremium}
      />
      <main className="flex-1 overflow-auto bg-background">
        <div className="h-full flex flex-col">{children}</div>
      </main>
    </div>
  );
};
