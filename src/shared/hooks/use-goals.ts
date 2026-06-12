import React from 'react';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import { useDataSyncedRefresh } from '@/shared/hooks/use-data-synced-refresh';
import type { GoalRow } from '@/shared/types/finance.types';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useGoals() {
  const [goals,   setGoals]   = React.useState<GoalRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving,  setSaving]  = React.useState(false);
  const [error,   setError]   = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    notionPaymentsService.getGoals()
      .then(setGoals)
      .catch(() => setGoals([]))
      .finally(() => setLoading(false));
  }, []);

  useDataSyncedRefresh(load);

  const create = React.useCallback(async (body: Partial<GoalRow>) => {
    setSaving(true); setError(null);
    try {
      await notionPaymentsService.createGoal(body);
      load();
    } catch (error: unknown) {
      setError(errorMessage(error, 'Error al crear objetivo'));
    } finally {
      setSaving(false);
    }
  }, [load]);

  const update = React.useCallback(async (id: string, body: Partial<GoalRow>) => {
    setSaving(true); setError(null);
    try {
      await notionPaymentsService.updateGoal(id, body);
      load();
    } catch (error: unknown) {
      setError(errorMessage(error, 'Error al actualizar objetivo'));
    } finally {
      setSaving(false);
    }
  }, [load]);

  const remove = React.useCallback(async (id: string) => {
    setSaving(true); setError(null);
    try {
      await notionPaymentsService.deleteGoal(id);
      load();
    } catch (error: unknown) {
      setError(errorMessage(error, 'Error al eliminar objetivo'));
    } finally {
      setSaving(false);
    }
  }, [load]);

  return { goals, loading, saving, error, create, update, remove, reload: load };
}
