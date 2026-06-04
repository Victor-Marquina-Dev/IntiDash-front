import React from 'react';

export function dispatchDataSynced() {
  window.dispatchEvent(new CustomEvent('data-synced'));
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
