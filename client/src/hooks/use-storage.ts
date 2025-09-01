import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { HistoryEntry, SavedPhrase, GameProgress, Settings } from '@shared/schema';

export function useHistory() {
  return useQuery<HistoryEntry[]>({
    queryKey: ['/api/history'],
  });
}

export function useAddHistoryEntry() {
  return useMutation({
    mutationFn: async (entry: { english: string; aurebesh: string; timestamp: string }) => {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...entry, favorite: false }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
    },
  });
}

export function useUpdateHistoryEntry() {
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<HistoryEntry> }) => {
      const response = await fetch(`/api/history/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
    },
  });
}

export function useDeleteHistoryEntry() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
    },
  });
}

export function useSavedPhrases() {
  return useQuery<SavedPhrase[]>({
    queryKey: ['/api/saved-phrases'],
  });
}

export function useAddSavedPhrase() {
  return useMutation({
    mutationFn: async (phrase: { phrase: string; timestamp: string }) => {
      const response = await fetch('/api/saved-phrases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phrase),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-phrases'] });
    },
  });
}

export function useDeleteSavedPhrase() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/saved-phrases/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-phrases'] });
    },
  });
}

export function useGameProgress() {
  return useQuery<GameProgress>({
    queryKey: ['/api/game-progress'],
  });
}

export function useUpdateGameProgress() {
  return useMutation({
    mutationFn: async (updates: Partial<GameProgress>) => {
      const response = await fetch('/api/game-progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-progress'] });
    },
  });
}
