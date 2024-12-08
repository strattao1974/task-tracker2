import React from 'react';
import { format } from 'date-fns';
import { Task } from '../types/task';
import { Trash2, CheckCircle, Circle, Edit2 } from 'lucide-react';
import { getPriorityColor } from '../lib/utils';
import { EditTaskDialog } from './EditTaskDialog';
import { useState } from 'react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <div
      className={`flex flex-col md:flex-row md:items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow ${
        task.completed ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start md:items-center space-x-4">
        <button
          onClick={() => onToggle(task.id)}
          className="focus:outline-none mt-1 md:mt-0"
        >
          {task.completed ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium break-words dark:text-white ${
              task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 break-words">{task.description}</p>
          )}
          <div className="flex flex-wrap gap-2 text-xs text-gray-400 dark:text-gray-500 mt-1">
            <span className={getPriorityColor(task.priority)}>
              {task.priority}
            </span>
            {task.dueDate && (
              <span>Due: {format(task.dueDate, 'MMM d, yyyy')}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 md:mt-0">
        <button
          onClick={() => setIsEditDialogOpen(true)}
          className="text-gray-400 hover:text-blue-500 transition-colors"
        >
          <Edit2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      <EditTaskDialog
        task={task}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
};