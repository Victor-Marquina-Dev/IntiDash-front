'use client';

import { notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { CategoriaRow, CuentaBancariaRow, DeudaRow, PrestamoRow } from '@/shared/types/finance.types';
import { useAsyncResource } from './use-async-resource';

export function useCuentasBancarias() {
  return useAsyncResource<CuentaBancariaRow[]>(notionPaymentsService.getCuentasBancarias, []);
}

export function useDeudasSuscripciones() {
  return useAsyncResource<DeudaRow[]>(notionPaymentsService.getDeudasSuscripciones, []);
}

export function usePrestamos() {
  return useAsyncResource<PrestamoRow[]>(notionPaymentsService.getPrestamos, []);
}

export function useCategoriasGastos() {
  return useAsyncResource<CategoriaRow[]>(notionPaymentsService.getCategoriasGastos, []);
}

export function useCategoriasIngreso() {
  return useAsyncResource<CategoriaRow[]>(notionPaymentsService.getCategoriasIngreso, []);
}
