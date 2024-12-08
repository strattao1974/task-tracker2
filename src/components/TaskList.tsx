import React, { useMemo } from 'react';
import { useTaskStore } from '../store/taskStore';
import { TaskItem } from './TaskItem';
import { Search } from './Search';
import { TaskFilter } from './TaskFilter';
import { useState } from 'react';

export const TaskList: React.FC = () => {
  const { tasks, toggleTask, deleteTask } = useTaskStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = 
        filter === 'all' ? true :
        filter === 'active' ? !task.completed :
        task.completed;

      return matchesSearch && matchesFilter;
    }).sort((a, b) => {
      if (a.completed === b.completed) {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return a.completed ? 1 : -1;
    });
  }, [tasks, searchQuery, filter]);

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Search onSearch={setSearchQuery} />
        <TaskFilter currentFilter={filter} onFilterChange={setFilter} />
      </div>
      {filteredTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
      ))}
    </div>
  );
};