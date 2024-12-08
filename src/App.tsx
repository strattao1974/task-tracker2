import { TaskList } from './components/TaskList';
import { AddTask } from './components/AddTask';
import { ThemeToggle } from './components/ThemeToggle';
import { useThemeStore } from './store/themeStore';
import { useTaskStore } from './store/taskStore';
import { useEffect, useState } from 'react';
import * as api from './lib/api';

function App() {
  const { isDark } = useThemeStore();
  const { set } = useTaskStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasks = await api.fetchTasks();
        set({ tasks });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks';
        console.error('Error loading tasks:', errorMessage);
        setError(errorMessage);
      }
    };
    loadTasks();
  }, [set]);

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 transition-colors">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Tracker</h1>
            <ThemeToggle />
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <div className="space-y-8">
            <AddTask />
            <TaskList />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;