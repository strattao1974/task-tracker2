import React from 'react';
import { Search as SearchIcon } from 'lucide-react';

interface SearchProps {
  onSearch: (query: string) => void;
}

export const Search: React.FC<SearchProps> = ({ onSearch }) => {
  return (
    <div className="relative flex-1">
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
      <input
        type="text"
        placeholder="Search tasks..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
    </div>
  );
};