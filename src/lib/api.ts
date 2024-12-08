import { Task } from '../types/task';

declare global {
  interface Window {
    taskTrackerConfig?: {
      apiUrl: string;
      nonce: string;
    };
  }
}

const getConfig = () => {
  if (!window.taskTrackerConfig) {
    throw new Error('Task Tracker plugin not properly initialized. Please ensure the shortcode is correctly placed.');
  }
  console.log('Task Tracker config:', window.taskTrackerConfig);
  return window.taskTrackerConfig;
};

const formatTask = (task: any): Task => ({
  id: task.id,
  title: task.title,
  description: task.description || '',
  completed: Boolean(task.completed),
  priority: task.priority,
  projectId: task.project_id,
  createdAt: new Date(task.created_at),
  dueDate: task.due_date ? new Date(task.due_date) : undefined
});

export async function fetchTasks(): Promise<Task[]> {
  try {
    const config = getConfig();
    const response = await fetch(`${config.apiUrl}/tasks`, {
      headers: {
        'X-WP-Nonce': config.nonce,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const tasks = await response.json();
    console.log('Fetched tasks:', tasks);
    return tasks.map(formatTask);
  } catch (error) {
    console.error('Error in fetchTasks:', error);
    throw error;
  }
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
  const config = getConfig();
  const response = await fetch(`${config.apiUrl}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': config.nonce,
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      ...task,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create task: ${response.statusText}`);
  }

  const newTask = await response.json();
  return formatTask(newTask);
}

export async function updateTask(
  id: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt'>>
): Promise<Task> {
  const config = getConfig();
  const response = await fetch(`${config.apiUrl}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': config.nonce,
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      ...updates,
      due_date: updates.dueDate?.toISOString(),
      project_id: updates.projectId
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update task: ${response.statusText}`);
  }

  const updatedTask = await response.json();
  return formatTask(updatedTask);
}

export async function deleteTask(id: string): Promise<void> {
  const config = getConfig();
  const response = await fetch(`${config.apiUrl}/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      'X-WP-Nonce': config.nonce
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to delete task: ${response.statusText}`);
  }
}