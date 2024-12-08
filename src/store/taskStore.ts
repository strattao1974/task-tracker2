import { create } from 'zustand';
import { Task, Project } from '../types/task';
import * as api from '../lib/api';

interface TaskState {
  tasks: Task[];
  projects: Project[];
  set: (state: Partial<TaskState>) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => void;
  deleteProject: (id: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  projects: [],
  set,
  addTask: async (task) => {
    try {
      const newTask = await api.createTask(task);
      set((state) => ({
        tasks: [newTask, ...state.tasks],
      }));
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    }
  },
  updateTask: async (id, updates) => {
    try {
      const updatedTask = await api.updateTask(id, updates);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? updatedTask : task
        ),
      }));
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  },
  toggleTask: async (id) => {
    const state = get();
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
    try {
      const updatedTask = await api.updateTask(id, {
        completed: !task.completed,
      });
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? updatedTask : task
        ),
      }));
    } catch (error) {
      console.error('Failed to toggle task:', error);
      throw error;
    }
  },
  deleteTask: async (id) => {
    try {
      await api.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  },
  addProject: (project) =>
    set((state) => ({
      projects: [
        ...state.projects,
        {
          ...project,
          id: crypto.randomUUID(),
        },
      ],
    })),
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
      tasks: state.tasks.filter((task) => task.projectId !== id),
    })),
}));