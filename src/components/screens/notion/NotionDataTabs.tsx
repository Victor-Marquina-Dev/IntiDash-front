import { C } from '@/lib/colors';
import type { NotionDataTab } from './types';

export interface NotionDataTabItem {
  id: NotionDataTab;
  label: string;
  count: number;
}

interface NotionDataTabsProps {
  tabs: readonly NotionDataTabItem[];
  activeTab: NotionDataTab;
  onTabChange: (tab: NotionDataTab) => void;
}

export function NotionDataTabs({ tabs, activeTab, onTabChange }: NotionDataTabsProps) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
      {tabs.map(t => {
        const active = activeTab === t.id;
        return (
          <button key={t.id} onClick={() => onTabChange(t.id)} style={{
            padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: active ? 600 : 400,
            color: active ? C.text : C.textMute,
            borderBottom: `2px solid ${active ? C.olive : 'transparent'}`,
            marginBottom: -1,
          }}>
            {t.label}
            <span style={{ marginLeft: 6, fontSize: 11, background: `${C.olive}18`, color: C.olive, borderRadius: 10, padding: '1px 7px', fontWeight: 600 }}>
              {t.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
