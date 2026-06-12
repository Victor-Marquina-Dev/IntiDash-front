import { Icon } from '@/components/icons';

export type ScreenId = 'home' | 'cards' | 'goals' | 'charts' | 'debts' | 'notion';

export interface DashboardNavItem {
  id: ScreenId;
  label: string;
  I: (typeof Icon)[keyof typeof Icon];
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { id: 'home',   label: 'Dashboard',  I: Icon.home },
  { id: 'cards',  label: 'Cuentas',    I: Icon.wallet },
  { id: 'charts', label: 'Análisis',   I: Icon.chart },
  { id: 'goals',  label: 'Objetivos',  I: Icon.target },
  { id: 'debts',  label: 'Presupuesto', I: Icon.cards },
];

export const SETTINGS_NAV_ITEM: DashboardNavItem = {
  id: 'notion',
  label: 'Ajustes',
  I: Icon.gear,
};

export const DASHBOARD_SCREEN_ORDER: ScreenId[] = [
  'home',
  'cards',
  'charts',
  'goals',
  'debts',
  'notion',
];

export function isDashboardScreen(value: string): value is ScreenId {
  return DASHBOARD_SCREEN_ORDER.includes(value as ScreenId);
}

export function getDashboardNavItem(screen: ScreenId): DashboardNavItem {
  return [...DASHBOARD_NAV_ITEMS, SETTINGS_NAV_ITEM].find(item => item.id === screen) ?? DASHBOARD_NAV_ITEMS[0];
}
