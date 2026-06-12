import React from 'react';

export function dispatchDataSynced() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('data-synced'));
}

export function dispatchDataSyncedSoon() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('data-synced'));
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent('data-synced'));
  }, 150);
}

export function useDataSyncedRefresh(refresh: () => void | Promise<unknown>) {
  React.useEffect(() => {
    refresh();
  }, [refresh]);

  React.useEffect(() => {
    window.addEventListener('data-synced', refresh);
    return () => window.removeEventListener('data-synced', refresh);
  }, [refresh]);
}
