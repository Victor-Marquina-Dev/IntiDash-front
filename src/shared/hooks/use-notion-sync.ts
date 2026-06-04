'use client';

import React from 'react';
import { EMPTY_SYNC_STATE, type SyncKey, type SyncRowState } from '@/components/screens/notion/types';
import { dispatchDataSynced } from '@/shared/hooks/use-data-synced-refresh';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';

export function useNotionSync(onSynced: () => void | Promise<void>) {
  const [syncState, setSyncState] = React.useState<Record<SyncKey, SyncRowState>>(EMPTY_SYNC_STATE);

  const runSync = React.useCallback(async (key: SyncKey, endpoint: string) => {
    setSyncState(prev => ({ ...prev, [key]: { status: 'loading', count: null } }));
    try {
      const result = await notionPaymentsService.sync(endpoint) as { synced?: number };
      setSyncState(prev => ({ ...prev, [key]: { status: 'ok', count: result.synced ?? 0 } }));
      await onSynced();
      dispatchDataSynced();
    } catch {
      setSyncState(prev => ({ ...prev, [key]: { status: 'error', count: null } }));
    }
  }, [onSynced]);

  return { syncState, runSync };
}
