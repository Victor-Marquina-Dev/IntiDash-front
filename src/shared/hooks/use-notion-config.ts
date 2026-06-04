'use client';

import React from 'react';
import type { NotionSourceField, Status } from '@/components/screens/notion/types';
import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { DataSource, NotionConfig } from '@/shared/types/finance.types';

interface UseNotionConfigOptions {
  onReady: () => void | Promise<void>;
  onDatabasesReset: () => void;
}

export function useNotionConfig({ onReady, onDatabasesReset }: UseNotionConfigOptions) {
  const [config, setConfig] = React.useState<NotionConfig | null>(null);
  const [token, setToken] = React.useState('');
  const [databases, setDatabases] = React.useState<DataSource[]>([]);
  const [ingresosId, setIngresosId] = React.useState('');
  const [gastosUnicosId, setGastosUnicosId] = React.useState('');
  const [gastosDeudasId, setGastosDeudasId] = React.useState('');
  const [deudasId, setDeudasId] = React.useState('');
  const [cuentasBancariasId, setCuentasBancariasId] = React.useState('');
  const [transferenciasId, setTransferenciasId] = React.useState('');
  const [categoriasGastosId, setCategoriasGastosId] = React.useState('');
  const [categoriasIngresoId, setCategoriasIngresoId] = React.useState('');
  const [prestamosId, setPrestamosId] = React.useState('');
  const [loadDbStatus, setLoadDbStatus] = React.useState<Status>('idle');
  const [searchStatus, setSearchStatus] = React.useState<Status>('idle');
  const [saveStatus, setSaveStatus] = React.useState<Status>('idle');
  const [backStatus, setBackStatus] = React.useState<Status>('loading');

  React.useEffect(() => {
    notionPaymentsService.health()
      .then(() => {
        setBackStatus('ok');
        return notionPaymentsService.getConfig();
      })
      .then((data) => {
        if (!data) throw new Error('Config not found');
        setConfig(data);
        if (data.notionDataSources?.length) setDatabases(data.notionDataSources);
        setIngresosId(data.ingresosSourceId ?? '');
        setGastosUnicosId(data.gastosUnicosSourceId ?? '');
        setGastosDeudasId(data.gastosDeudasSourceId ?? '');
        setDeudasId(data.deudasSourceId ?? '');
        setCuentasBancariasId(data.cuentasBancariasSourceId ?? '');
        setTransferenciasId(data.transferenciasSourceId ?? '');
        setCategoriasGastosId(data.categoriasGastosSourceId ?? '');
        setCategoriasIngresoId(data.categoriasIngresoSourceId ?? '');
        setPrestamosId(data.prestamosSourceId ?? '');
        onReady();
      })
      .catch(() => setBackStatus('error'));
  }, [onReady]);

  const handleTokenChange = React.useCallback((value: string) => {
    setToken(value);
    setSearchStatus('idle');
  }, []);

  const loadDatabases = React.useCallback(async () => {
    setLoadDbStatus('loading');
    onDatabasesReset();
    try {
      const list = await notionPaymentsService.getDatabases();
      setDatabases(list);
      setLoadDbStatus(list.length ? 'ok' : 'error');
    } catch {
      setLoadDbStatus('error');
    }
  }, [onDatabasesReset]);

  const searchDatabases = React.useCallback(async () => {
    if (!token.trim()) return;
    setSearchStatus('loading');
    setDatabases([]);
    onDatabasesReset();
    try {
      const list = await notionPaymentsService.searchDatabases(token);
      setDatabases(list);
      setSearchStatus(list.length ? 'ok' : 'error');
    } catch {
      setSearchStatus('error');
    }
  }, [onDatabasesReset, token]);

  const saveConfig = React.useCallback(async () => {
    setSaveStatus('loading');
    try {
      const allIds = [ingresosId, gastosUnicosId, gastosDeudasId, deudasId, cuentasBancariasId, transferenciasId, categoriasGastosId, categoriasIngresoId, prestamosId].filter(Boolean);
      const notionDataSources = databases.filter(d => allIds.includes(d.id));
      const data = await notionPaymentsService.saveConfig({
        notionToken: token || undefined,
        notionDataSources,
        ingresosSourceId: ingresosId || null,
        gastosUnicosSourceId: gastosUnicosId || null,
        gastosDeudasSourceId: gastosDeudasId || null,
        deudasSourceId: deudasId || null,
        cuentasBancariasSourceId: cuentasBancariasId || null,
        transferenciasSourceId: transferenciasId || null,
        categoriasGastosSourceId: categoriasGastosId || null,
        categoriasIngresoSourceId: categoriasIngresoId || null,
        prestamosSourceId: prestamosId || null,
      });
      setConfig(data);
      setSaveStatus('ok');
      setToken('');
    } catch {
      setSaveStatus('error');
    }
  }, [categoriasGastosId, categoriasIngresoId, cuentasBancariasId, databases, deudasId, gastosDeudasId, gastosUnicosId, ingresosId, prestamosId, token, transferenciasId]);

  const activeDbId = ingresosId || gastosUnicosId || gastosDeudasId || deudasId || cuentasBancariasId || transferenciasId || categoriasGastosId || categoriasIngresoId || prestamosId || '';
  const activeDbName = databases.find(d => d.id === activeDbId)?.name ?? '';
  const sourceFields: NotionSourceField[] = [
    { label: 'Ingresos', value: ingresosId, onChange: setIngresosId },
    { label: 'Gastos Únicos', value: gastosUnicosId, onChange: setGastosUnicosId },
    { label: 'Gastos por Deudas', value: gastosDeudasId, onChange: setGastosDeudasId },
    { label: 'Deudas / Suscripciones', value: deudasId, onChange: setDeudasId },
    { label: 'Cuentas Bancarias', value: cuentasBancariasId, onChange: setCuentasBancariasId },
    { label: 'Transferencias', value: transferenciasId, onChange: setTransferenciasId },
    { label: 'Categorías Gastos', value: categoriasGastosId, onChange: setCategoriasGastosId },
    { label: 'Categorías Ingreso', value: categoriasIngresoId, onChange: setCategoriasIngresoId },
    { label: 'Préstamos', value: prestamosId, onChange: setPrestamosId },
  ];

  return {
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
  };
}
