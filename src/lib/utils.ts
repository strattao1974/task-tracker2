import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Task } from "../types/task"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPriorityColor(priority: Task['priority']) {
  switch (priority) {
    case 'high':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-green-500';
  }
  return 'text-gray-500';
}