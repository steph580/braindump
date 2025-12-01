import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BrainDumpCard } from './BrainDumpCard';

export interface BrainDump {
  id: string;
  text: string;
  category: string;
  timestamp: Date;
  completed?: boolean;
  tags?: string[];
}

interface CategorySectionProps {
  title: string;
  category: string;
  dumps: BrainDump[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

const categoryColors: Record<string, string> = {
  task: 'bg-category-task/10 text-category-task border-category-task/20',
  reminder: 'bg-category-reminder/10 text-category-reminder border-category-reminder/20',
  note: 'bg-category-note/10 text-category-note border-category-note/20',
  idea: 'bg-category-idea/10 text-category-idea border-category-idea/20',
};

const categoryIcons: Record<string, string> = {
  task: '✓',
  reminder: '⏰',
  note: '📝',
  idea: '💡',
  quote: '💬',
  recipe: '🍳',
  workout: '💪',
  book: '📚',
  movie: '🎬',
  contact: '👤',
  goal: '🎯',
  habit: '🔄',
  travel: '✈️',
  learning: '🧠',
  finance: '💰',
  health: '🏥',
  project: '📋',
};

const getCategoryColor = (category: string) => {
  return categoryColors[category] || 'bg-primary/10 text-primary border-primary/20';
};

const getCategoryIcon = (category: string) => {
  return categoryIcons[category] || '📌';
};

export const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  category,
  dumps,
  onToggleComplete,
  onDelete,
  onEdit,
}) => {
  if (dumps.length === 0) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <Badge className={`${getCategoryColor(category)} font-medium px-3 py-1 hover-scale`}>
          <span className="mr-2">{getCategoryIcon(category)}</span>
          {title}
        </Badge>
        <span className="text-sm text-muted-foreground animate-pulse-soft">
          {dumps.length} {dumps.length === 1 ? 'item' : 'items'}
        </span>
      </div>
      
      <div className="grid gap-3">
        {dumps.map((dump, index) => (
          <div 
            key={dump.id}
            className="animate-fade-in"
            style={{ 
              animationDelay: `${index * 0.1}s`,
              animationFillMode: 'both'
            }}
          >
            <BrainDumpCard
              dump={dump}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          </div>
        ))}
      </div>
    </div>
  );
};