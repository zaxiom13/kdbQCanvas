import type { CodeExample } from "@shared/schema";

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'text-green-600 bg-green-100';
    case 'intermediate':
      return 'text-orange-600 bg-orange-100';
    case 'advanced':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getDifficultyLabel = (difficulty: string) => {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
};

export const formatCode = (code: string) => {
  return code.replace(/\n/g, ' ').substring(0, 50) + (code.length > 50 ? '...' : '');
};
