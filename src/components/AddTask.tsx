import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTaskStore } from '../store/taskStore';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional(),
  projectId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export const AddTask: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
    },
  });

  const { addTask, projects } = useTaskStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await addTask({
        ...data,
        completed: false,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      });
      
      reset();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add task';
      console.error('Error adding task:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div>
        <input
          {...register('title')}
          placeholder="Task title"
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <textarea
          {...register('description')}
          placeholder="Description (optional)"
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <select
          {...register('priority')}
          className="p-2 border rounded w-full md:w-auto dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        <input
          type="date"
          {...register('dueDate')}
          className="p-2 border rounded w-full md:w-auto dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        {projects.length > 0 && (
          <select
            {...register('projectId')}
            className="p-2 border rounded w-full md:w-auto dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">No Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
      >
        {isSubmitting ? 'Adding...' : 'Add Task'}
      </button>
    </form>
  );
};