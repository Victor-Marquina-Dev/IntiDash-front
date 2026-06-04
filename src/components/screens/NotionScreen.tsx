'use client';

import React from 'react';
import { API_BASE_URL } from '@/lib/api';
import { NotionBackendCard } from '@/components/screens/notion/NotionBackendCard';
import { NotionConfigCard } from '@/components/screens/notion/NotionConfigCard';
import { NotionConnectionCard } from '@/components/screens/notion/NotionConnectionCard';
import { NotionDangerZone } from '@/components/screens/notion/NotionDangerZone';
import { NotionSchemaCard } from '@/components/screens/notion/NotionSchemaCard';
import { NotionSyncedDataCard } from '@/components/screens/notion/NotionSyncedDataCard';
import { NotionSyncPanel } from '@/components/screens/notion/NotionSyncPanel';
import { type NotionDataTab, type Status } from '@/components/screens/notion/types';
import { useNotionConfig } from '@/shared/hooks/use-notion-config';
import { useNotionSchema } from '@/shared/hooks/use-notion-schema';
import { useNotionSyncedData } from '@/shared/hooks/use-notion-synced-data';
import { useNotionSync } from '@/shared/hooks/use-notion-sync';
import { dispatchDataSynced } from '@/shared/hooks/use-data-synced-refresh';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';

const API = API_BASE_URL;

interface NotionScreenProps { accent: string }

export function NotionScreen({ accent }: Readonly<NotionScreenProps>) {
  const [deleteStatus, setDeleteStatus]       = React.useState<Status>('idle');
  const [dataTab, setDataTab]                 = React.useState<NotionDataTab>('ingresos');
  const { data: syncedData, dataLoading, loadData, clearData } = useNotionSyncedData();
  const { syncState, runSync } = useNotionSync(loadData);
  const { schema, schemaStatus, schemaDbId, resetSchema, loadSchema } = useNotionSchema();
  const {
    config,
    token,
    databases,
    loadDbStatus,
    searchStatus,
    saveStatus,
    backStatus,
    activeDbId,
    activeDbName,
    sourceFields,
    handleTokenChange,
    loadDatabases,
    searchDatabases,
    saveConfig,
  } = useNotionConfig({ onReady: loadData, onDatabasesReset: resetSchema });

  async function handleDelete() {
    if (!confirm('¿Eliminar todos los datos sincronizados?')) return;
    setDeleteStatus('loading');
    try {
      await notionPaymentsService.deleteSyncedData();
      clearData();
      dispatchDataSynced();
      setDeleteStatus('ok');
    } catch { setDeleteStatus('error'); }
  }

  return (
    <div style={{ padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 860 }}>

      <NotionBackendCard accent={accent} apiUrl={API} status={backStatus} />
      <NotionConnectionCard accent={accent} config={config} />

      <NotionConfigCard
        config={config}
        token={token}
        databases={databases}
        loadDbStatus={loadDbStatus}
        searchStatus={searchStatus}
        saveStatus={saveStatus}
        sourceFields={sourceFields}
        onTokenChange={handleTokenChange}
        onLoadDatabases={loadDatabases}
        onSearch={searchDatabases}
        onSave={saveConfig}
      />

      <NotionSchemaCard
        activeDbId={activeDbId}
        activeDbName={activeDbName}
        schema={schema}
        schemaStatus={schemaStatus}
        schemaDbId={schemaDbId}
        onLoadSchema={loadSchema}
      />

      <NotionSyncPanel
        accent={accent}
        config={config}
        syncState={syncState}
        onSync={runSync}
      />

      <NotionSyncedDataCard
        data={syncedData}
        dataLoading={dataLoading}
        dataTab={dataTab}
        onTabChange={setDataTab}
        onRefresh={loadData}
      />
      <NotionDangerZone deleteStatus={deleteStatus} onDelete={handleDelete} />
    </div>
  );
}

