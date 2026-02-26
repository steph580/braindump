import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, TrendingUp, Brain, Calendar } from 'lucide-react';

interface Stats {
  totalDumps: number;
  taskCount: number;
  reminderCount: number;
  noteCount: number;
  ideaCount: number;
  completedCount: number;
}

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalDumps: 0,
    taskCount: 0,
    reminderCount: 0,
    noteCount: 0,
    ideaCount: 0,
    completedCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('brain_dumps')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const dumps = data || [];
      setStats({
        totalDumps: dumps.length,
        taskCount: dumps.filter(d => d.category === 'task').length,
        reminderCount: dumps.filter(d => d.category === 'reminder').length,
        noteCount: dumps.filter(d => d.category === 'note').length,
        ideaCount: dumps.filter(d => d.category === 'idea').length,
        completedCount: dumps.filter(d => d.completed).length,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completionRate = stats.totalDumps > 0 ? Math.round((stats.completedCount / stats.totalDumps) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Track your productivity and brain dump insights</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalDumps}</div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total Brain Dumps</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{completionRate}%</div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Completion Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.completedCount}</div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Completed Tasks</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.totalDumps > 0 ? Math.round(stats.totalDumps / 7) : 0}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Per Week Avg</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Distribution of your brain dumps by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Tasks */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900">
                  ✓ Tasks
                </Badge>
                <span className="text-sm font-medium">{stats.taskCount}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.totalDumps > 0 ? (stats.taskCount / stats.totalDumps) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Reminders */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="bg-green-50 dark:bg-green-900">
                  ⏰ Reminders
                </Badge>
                <span className="text-sm font-medium">{stats.reminderCount}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.totalDumps > 0 ? (stats.reminderCount / stats.totalDumps) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900">
                  📝 Notes
                </Badge>
                <span className="text-sm font-medium">{stats.noteCount}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.totalDumps > 0 ? (stats.noteCount / stats.totalDumps) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Ideas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900">
                  💡 Ideas
                </Badge>
                <span className="text-sm font-medium">{stats.ideaCount}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.totalDumps > 0 ? (stats.ideaCount / stats.totalDumps) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
