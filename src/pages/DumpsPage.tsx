import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Search, Trash2, CheckCircle2, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BrainDump {
  id: string;
  title: string;
  content: string;
  category: string;
  completed: boolean;
  created_at: string;
  user_id: string;
}

export const DumpsPage: React.FC = () => {
  const { user } = useAuth();
  const [dumps, setDumps] = useState<BrainDump[]>([]);
  const [filteredDumps, setFilteredDumps] = useState<BrainDump[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'completed'>('newest');
  const [selectedDump, setSelectedDump] = useState<BrainDump | null>(null);

  useEffect(() => {
    loadDumps();
  }, [user]);

  useEffect(() => {
    filterAndSortDumps();
  }, [dumps, searchTerm, categoryFilter, sortBy]);

  const loadDumps = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('brain_dumps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDumps(data || []);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortDumps = () => {
    let result = [...dumps];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (dump) =>
          dump.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dump.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      result = result.filter((dump) => dump.category === categoryFilter);
    }

    // Sort
    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'completed':
        result.sort((a, b) => (b.completed ? 1 : -1) - (a.completed ? 1 : -1));
        break;
      case 'newest':
      default:
        // Already sorted by newest from the API
        break;
    }

    setFilteredDumps(result);
  };

  const handleToggleComplete = async (dump: BrainDump) => {
    try {
      const { error } = await supabase
        .from('brain_dumps')
        .update({ completed: !dump.completed })
        .eq('id', dump.id);

      if (error) throw error;
      setDumps((prev) =>
        prev.map((d) => (d.id === dump.id ? { ...d, completed: !d.completed } : d))
      );
    } catch (error) {
      console.error('Error updating dump:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('brain_dumps').delete().eq('id', id);

      if (error) throw error;
      setDumps((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error('Error deleting dump:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      task: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      reminder: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      note: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      idea: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    };
    return colors[category] || 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading brain dumps...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Brain Dumps</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage all your brain dumps in one place</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search dumps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="task">Tasks</SelectItem>
            <SelectItem value="reminder">Reminders</SelectItem>
            <SelectItem value="note">Notes</SelectItem>
            <SelectItem value="idea">Ideas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="completed">Completed First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dumps List */}
      <div className="space-y-4">
        {filteredDumps.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-slate-500 dark:text-slate-400">No brain dumps found</p>
            </CardContent>
          </Card>
        ) : (
          filteredDumps.map((dump) => (
            <Card
              key={dump.id}
              className={`hover:shadow-md transition-all cursor-pointer ${
                dump.completed ? 'opacity-60' : ''
              } dark:bg-slate-900`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`${getCategoryColor(dump.category)}`}>
                        {dump.category.charAt(0).toUpperCase() + dump.category.slice(1)}
                      </Badge>
                      {dump.completed && (
                        <Badge variant="secondary" className="bg-green-100 dark:bg-green-900">
                          ✓ Completed
                        </Badge>
                      )}
                    </div>
                    <h3 className={`font-semibold text-lg ${dump.completed ? 'line-through' : ''}`}>
                      {dump.title || 'Untitled'}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {dump.content}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{formatDate(dump.created_at)}</p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDump(dump)}
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleComplete(dump)}
                      title={dump.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      <CheckCircle2 className={`h-4 w-4 ${dump.completed ? 'fill-current' : ''}`} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(dump.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedDump && (
        <Dialog open={!!selectedDump} onOpenChange={() => setSelectedDump(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedDump.title || 'Untitled'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={`${getCategoryColor(selectedDump.category)}`}>
                  {selectedDump.category.charAt(0).toUpperCase() + selectedDump.category.slice(1)}
                </Badge>
                {selectedDump.completed && (
                  <Badge variant="secondary" className="bg-green-100 dark:bg-green-900">
                    ✓ Completed
                  </Badge>
                )}
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {selectedDump.content}
                </p>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 border-t dark:border-slate-700 pt-4">
                Created {formatDate(selectedDump.created_at)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleToggleComplete(selectedDump)}
                  className="flex-1"
                >
                  {selectedDump.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedDump.id);
                    setSelectedDump(null);
                  }}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
