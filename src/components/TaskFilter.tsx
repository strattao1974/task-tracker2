import React from 'react';

interface TaskFilterProps {
  currentFilter: 'all' | 'active' | 'completed';
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void;
}

export const TaskFilter: React.FC<TaskFilterProps> = ({ currentFilter, onFilterChange }) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onFilterChange('all')}
        className={`px-4 py-2 rounded-lg ${
          currentFilter === 'all'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      <button
        onClick={() => onFilterChange('active')}
        className={`px-4 py-2 rounded-lg ${
          currentFilter === 'active'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Active
      </button>
      <button
        onClick={() => onFilterChange('completed')}
        className={`px-4 py-2 rounded-lg ${
          currentFilter === 'completed'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Completed
      </button>
    </div>
  );
};