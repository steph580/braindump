import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Check,
  X,
  Edit3,
  Trash2,
  Calendar,
  Tag,
  Save,
  MoreHorizontal,
} from 'lucide-react';
import { BrainDump } from './CategorySection';

// Constants
const TEXTAREA_MIN_HEIGHT = 80;

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
  month: 'short',
  day: 'numeric',
};

// Types
interface BrainDumpCardProps {
  dump: BrainDump;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

interface CardStyleConfig {
  container: string;
  completionButton: string;
  textContent: string;
}

/**
 * BrainDumpCard Component
 * 
 * Displays a single brain dump entry with interactive features including
 * completion toggling, inline editing, tagging, and deletion.
 * 
 * Features:
 * - Inline editing with save/cancel
 * - Completion status with visual feedback
 * - Tag display
 * - Timestamp formatting
 * - Action menu for additional operations
 * 
 * @component
 */
export const BrainDumpCard: React.FC<BrainDumpCardProps> = ({
  dump,
  onToggleComplete,
  onDelete,
  onEdit,
}) => {
  // State
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(dump.text);

  // Memoized values
  const formattedTimestamp = useMemo(
    () => formatTimestamp(dump.timestamp),
    [dump.timestamp]
  );

  const styleConfig = useMemo(
    () => getStyleConfig(dump.completed),
    [dump.completed]
  );

  /**
   * Formats timestamp for display
   */
  const formatTimestamp = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', DATE_FORMAT_OPTIONS).format(date);
  };

  /**
   * Gets style configuration based on completion status
   */
  const getStyleConfig = (isCompleted: boolean): CardStyleConfig => {
    return {
      container: isCompleted
        ? 'opacity-75 bg-muted/30'
        : 'bg-card/80 backdrop-blur-sm',
      completionButton: isCompleted
        ? 'bg-primary text-primary-foreground hover:bg-primary/80'
        : 'border-2 border-muted-foreground/30 hover:border-primary hover:bg-primary/10',
      textContent: isCompleted
        ? 'line-through text-muted-foreground'
        : 'text-foreground',
    };
  };

  /**
   * Edit handlers
   */
  const handleSave = useCallback((): void => {
    const trimmedText = editText.trim();

    if (trimmedText && trimmedText !== dump.text) {
      onEdit(dump.id, trimmedText);
    }

    setIsEditing(false);
  }, [editText, dump.text, dump.id, onEdit]);

  const handleCancel = useCallback((): void => {
    setEditText(dump.text);
    setIsEditing(false);
  }, [dump.text]);

  const handleEditChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setEditText(e.target.value);
    },
    []
  );

  /**
   * Action handlers
   */
  const handleToggleComplete = useCallback((): void => {
    onToggleComplete(dump.id);
  }, [dump.id, onToggleComplete]);

  const handleDelete = useCallback((): void => {
    onDelete(dump.id);
  }, [dump.id, onDelete]);

  const handleEnterEditMode = useCallback((): void => {
    setIsEditing(true);
  }, []);

  /**
   * Placeholder handlers for future features
   */
  const handleAddReminder = useCallback((): void => {
    // TODO: Implement reminder functionality
    console.log('Add reminder for:', dump.id);
  }, [dump.id]);

  const handleAddTag = useCallback((): void => {
    // TODO: Implement tag management
    console.log('Add tag for:', dump.id);
  }, [dump.id]);

  // Render helpers
  const renderCompletionButton = (): React.ReactNode => (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleComplete}
      className={`mt-1 h-6 w-6 rounded-full p-0 transition-all duration-300 ${styleConfig.completionButton}`}
      aria-label={dump.completed ? 'Mark as incomplete' : 'Mark as complete'}
    >
      {dump.completed && <Check className="h-3 w-3" aria-hidden="true" />}
    </Button>
  );

  const renderEditMode = (): React.ReactNode => (
    <div className="space-y-3">
      <Textarea
        value={editText}
        onChange={handleEditChange}
        className="min-h-[80px] resize-none"
        autoFocus
        aria-label="Edit brain dump text"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} aria-label="Save changes">
          <Save className="h-3 w-3 mr-1" aria-hidden="true" />
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          aria-label="Cancel editing"
        >
          <X className="h-3 w-3 mr-1" aria-hidden="true" />
          Cancel
        </Button>
      </div>
    </div>
  );

  const renderTags = (): React.ReactNode => {
    if (!dump.tags || dump.tags.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2" role="list" aria-label="Tags">
        {dump.tags.map((tag, index) => (
          <Badge
            key={index}
            variant="outline"
            className="text-xs"
            role="listitem"
          >
            <Tag className="h-2 w-2 mr-1" aria-hidden="true" />
            {tag}
          </Badge>
        ))}
      </div>
    );
  };

  const renderTimestamp = (): React.ReactNode => (
    <p className="text-xs text-muted-foreground mt-2">
      <time dateTime={dump.timestamp.toISOString()}>
        {formattedTimestamp}
      </time>
    </p>
  );

  const renderViewMode = (): React.ReactNode => (
    <>
      <p className={`text-sm leading-relaxed ${styleConfig.textContent}`}>
        {dump.text}
      </p>
      {renderTags()}
      {renderTimestamp()}
    </>
  );

  const renderActionsMenu = (): React.ReactNode => {
    if (isEditing) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="More actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEnterEditMode}>
            <Edit3 className="h-4 w-4 mr-2" aria-hidden="true" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddReminder}>
            <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
            Add Reminder
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddTag}>
            <Tag className="h-4 w-4 mr-2" aria-hidden="true" />
            Add Tag
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Main render
  return (
    <Card
      className={`p-4 transition-all duration-300 hover:shadow-lg animate-slide-in ${styleConfig.container}`}
      role="article"
      aria-label={`Brain dump: ${dump.text}`}
    >
      <div className="flex items-start gap-3">
        {renderCompletionButton()}

        <div className="flex-1 min-w-0">
          {isEditing ? renderEditMode() : renderViewMode()}
        </div>

        {renderActionsMenu()}
      </div>
    </Card>
  );
};