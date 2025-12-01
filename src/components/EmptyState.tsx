import React from 'react';
import { Brain, Sparkles } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-16 px-4">
      <div className="relative mb-6">
        <Brain className="h-16 w-16 text-primary/30 mx-auto animate-float" />
        <Sparkles className="h-6 w-6 text-accent absolute top-0 right-1/3 animate-pulse" />
      </div>
      
      <h3 className="text-2xl font-semibold text-foreground mb-3">
        Your mind is clear!
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Start dumping your thoughts, ideas, tasks, and reminders. 
        Our AI will automatically organize everything for you.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto text-sm">
        <div className="p-3 rounded-lg bg-category-task/10 border border-category-task/20">
          <div className="text-lg mb-1">✓</div>
          <div className="font-medium text-category-task">Tasks</div>
        </div>
        <div className="p-3 rounded-lg bg-category-reminder/10 border border-category-reminder/20">
          <div className="text-lg mb-1">⏰</div>
          <div className="font-medium text-category-reminder">Reminders</div>
        </div>
        <div className="p-3 rounded-lg bg-category-note/10 border border-category-note/20">
          <div className="text-lg mb-1">📝</div>
          <div className="font-medium text-category-note">Notes</div>
        </div>
        <div className="p-3 rounded-lg bg-category-idea/10 border border-category-idea/20">
          <div className="text-lg mb-1">💡</div>
          <div className="font-medium text-category-idea">Ideas</div>
        </div>
      </div>
    </div>
  );
};