import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Eye,
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
  const [showDetail, setShowDetail] = useState(false);

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
        ? 'glass-card opacity-60'
        : 'glass-card-hover',

      completionButton: isCompleted
        ? 'bg-green-500 text-white hover:bg-green-600'
        : 'border-2 border-border hover:border-primary hover:bg-primary/20',

      textContent: isCompleted
        ? 'line-through text-muted-foreground'
        : 'text-foreground',
    };
  };

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
   * Edit handlers
   */
  const handleSave = useCallback((): void => {
    const trimmedText = editText.trim();

    if (trimmedText && trimmedText !== dump.text) {
      onEdit(dump.id, trimmedText);
    }

    setIsEditing(false);
    setShowDetail(false);
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
    setShowDetail(false);
  }, [dump.id, onDelete]);

  const handleEnterEditMode = useCallback((): void => {
    setIsEditing(true);
  }, []);

  /**
   * Placeholder handlers
   */
  const handleAddReminder = useCallback((): void => {
    console.log('Add reminder for:', dump.id);
  }, [dump.id]);

  const handleAddTag = useCallback((): void => {
    console.log('Add tag for:', dump.id);
  }, [dump.id]);

  // Render helpers
  const renderCompletionButton = (): React.ReactNode => (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        handleToggleComplete();
      }}
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
        className="min-h-[80px] resize-none bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
        autoFocus
        aria-label="Edit brain dump text"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          className="bg-primary hover:bg-primary/90"
        >
          <Save className="h-3 w-3 mr-1" />
          Save
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          className="border-border/50 text-foreground hover:bg-secondary/80"
        >
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );

  const renderTags = (): React.ReactNode => {
    if (!dump.tags || dump.tags.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {dump.tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-0.5 rounded-md bg-secondary text-[10px] text-muted-foreground font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

  const renderTimestamp = (): React.ReactNode => (
    <p className="text-[10px] text-muted-foreground mt-2">
      {formattedTimestamp}
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

  const renderActionsMenu = (): React.ReactNode => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEnterEditMode}>
          <Edit3 className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleAddReminder}>
          <Calendar className="h-4 w-4 mr-2" />
          Reminder
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleAddTag}>
          <Tag className="h-4 w-4 mr-2" />
          Tag
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <Card
        className={`p-4 cursor-pointer transition-all duration-300 ${styleConfig.container}`}
        onClick={() => setShowDetail(true)}
      >
        <div className="flex items-start gap-3">
          {renderCompletionButton()}

          <div className="flex-1">
            {isEditing ? renderEditMode() : renderViewMode()}
          </div>

          {renderActionsMenu()}
        </div>
      </Card>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Brain Dump</DialogTitle>
          </DialogHeader>

          {isEditing ? renderEditMode() : renderViewMode()}
        </DialogContent>
      </Dialog>
    </>
  );
};