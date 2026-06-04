'use client';

import React from 'react';
import type { Status } from '@/components/screens/notion/types';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { DbProperty } from '@/shared/types/finance.types';

export function useNotionSchema() {
  const [schema, setSchema] = React.useState<DbProperty[]>([]);
  const [schemaStatus, setSchemaStatus] = React.useState<Status>('idle');
  const [schemaDbId, setSchemaDbId] = React.useState('');

  const resetSchema = React.useCallback(() => {
    setSchema([]);
    setSchemaStatus('idle');
  }, []);

  const loadSchema = React.useCallback(async (dbId: string) => {
    if (!dbId) return;
    setSchemaDbId(dbId);
    setSchemaStatus('loading');
    setSchema([]);
    try {
      const data = await notionPaymentsService.getDatabaseProperties(dbId);
      setSchema(data);
      setSchemaStatus('ok');
    } catch {
      setSchemaStatus('error');
    }
  }, []);

  return { schema, schemaStatus, schemaDbId, resetSchema, loadSchema };
}
