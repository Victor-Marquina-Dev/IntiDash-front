'use client';

import React from 'react';
import type { IconComponent } from '@/components/icons';

export interface SettingsTheme {
  page: string;
  sidebar: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  muted: string;
  input: string;
  active: string;
}

export interface SettingsNavItem<TSection extends string> {
  id: TSection;
  label: string;
  icon: IconComponent;
}

interface SettingsShellProps<TSection extends string> {
  activeColor: string;
  activeSection: TSection;
  children: React.ReactNode;
  darkMode: boolean;
  navItems: ReadonlyArray<SettingsNavItem<TSection>>;
  onSectionChange: (section: TSection) => void;
  profile: {
    initials: string;
    name: string;
    subtitle: string;
  };
  theme: SettingsTheme;
}

export const SETTINGS_ACCENT = '#3C7828';

export const settingsLightTheme: SettingsTheme = {
  page: '#ffffff',
  sidebar: '#FAFAFA',
  surface: '#ffffff',
  surfaceMuted: 'rgba(17,24,39,0.04)',
  border: 'rgba(17,24,39,0.08)',
  text: '#111827',
  muted: '#6B7280',
  input: '#FAFAFA',
  active: 'rgba(143,168,143,0.14)',
};

export const settingsDarkTheme: SettingsTheme = {
  page: 'transparent',
  sidebar: 'rgba(255,255,255,0.02)',
  surface: '#1A1D21',
  surfaceMuted: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  text: 'rgba(255,255,255,0.88)',
  muted: 'rgba(255,255,255,0.45)',
  input: 'rgba(255,255,255,0.04)',
  active: 'rgba(143,168,143,0.16)',
};

function useIsNarrow() {
  const [isNarrow, setIsNarrow] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia('(max-width: 940px)');
    const update = () => setIsNarrow(query.matches);

    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isNarrow;
}

export function SettingsShell<TSection extends string>({
  activeColor,
  activeSection,
  children,
  darkMode,
  navItems,
  onSectionChange,
  profile,
  theme,
}: Readonly<SettingsShellProps<TSection>>) {
  const isNarrow = useIsNarrow();

  return (
    <div
      style={{
        minHeight: '100%',
        background: theme.page,
        color: theme.text,
        display: isNarrow ? 'flex' : 'grid',
        gridTemplateColumns: '300px minmax(0, 1fr)',
        alignItems: 'stretch',
      }}
    >
      <aside
        style={{
          background: theme.sidebar,
          borderRight: isNarrow ? 'none' : `1px solid ${theme.border}`,
          borderBottom: isNarrow ? `1px solid ${theme.border}` : 'none',
          padding: isNarrow ? '20px 18px 14px' : '28px 26px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
          <div
            aria-hidden
            style={{
              width: 52,
              height: 52,
              flexShrink: 0,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(140deg, #374151 0%, #111827 100%)',
              color: '#fff',
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: 0.4,
              boxShadow: `0 0 0 3px ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.06)'}`,
            }}
          >
            {profile.initials}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, lineHeight: 1.2, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile.name}
            </div>
            <div style={{ marginTop: 3, fontSize: 12, color: theme.muted }}>{profile.subtitle}</div>
          </div>
        </div>

        <nav
          aria-label="Secciones de configuracion"
          style={{
            display: 'flex',
            flexDirection: isNarrow ? 'row' : 'column',
            gap: 4,
            overflowX: isNarrow ? 'auto' : 'visible',
            paddingBottom: isNarrow ? 4 : 0,
          }}
        >
          {navItems.map(item => {
            const ItemIcon = item.icon;
            const active = item.id === activeSection;

            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onSectionChange(item.id)}
                style={{
                  position: 'relative',
                  width: isNarrow ? 'auto' : '100%',
                  minWidth: isNarrow ? 'max-content' : 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  border: 'none',
                  borderRadius: 10,
                  background: active ? theme.active : 'transparent',
                  color: active ? activeColor : theme.text,
                  cursor: 'pointer',
                  fontSize: 13.5,
                  fontWeight: active ? 700 : 550,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  transition: 'background 0.14s, color 0.14s',
                }}
              >
                {!isNarrow && active && (
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: -26,
                      top: 8,
                      bottom: 8,
                      width: 3,
                      borderRadius: 999,
                      background: activeColor,
                    }}
                  />
                )}
                <ItemIcon size={18} style={{ color: active ? activeColor : theme.muted }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main
        style={{
          minWidth: 0,
          padding: isNarrow ? '22px 18px 36px' : '44px 56px 56px',
          background: theme.page,
        }}
      >
        {children}
      </main>
    </div>
  );
}

export function SettingsPanel({
  title,
  theme,
  children,
  maxWidth = 820,
}: Readonly<{ title: string; theme: SettingsTheme; children: React.ReactNode; maxWidth?: number }>) {
  return (
    <section style={{ maxWidth }}>
      <SettingsHeader title={title} theme={theme} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>{children}</div>
    </section>
  );
}

function SettingsHeader({ title, theme }: Readonly<{ title: string; theme: SettingsTheme }>) {
  return (
    <div
      style={{
        marginBottom: 26,
        paddingBottom: 18,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <h1 style={{ margin: 0, fontSize: 22, lineHeight: 1.2, fontWeight: 700, letterSpacing: -0.4, color: theme.text }}>
        {title}
      </h1>
    </div>
  );
}

export function SettingsField({ label, value, theme }: Readonly<{ label: string; value: string; theme: SettingsTheme }>) {
  return (
    <label style={{ display: 'grid', gap: 7 }}>
      <span style={{ color: theme.text, fontSize: 13, fontWeight: 700 }}>{label}</span>
      <input
        readOnly
        value={value}
        style={{
          height: 42,
          maxWidth: 560,
          borderRadius: 10,
          border: `1px solid ${theme.border}`,
          background: theme.input,
          color: theme.text,
          padding: '0 14px',
          fontSize: 14,
          fontFamily: 'inherit',
          outline: 'none',
        }}
      />
    </label>
  );
}

export function SettingsInfoRow({ label, value, theme }: Readonly<{ label: string; value: string; theme: SettingsTheme }>) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(170px, 240px) minmax(0, 1fr)',
        gap: 18,
        paddingBottom: 18,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <div style={{ color: theme.text, fontSize: 13.5, fontWeight: 700 }}>{label}</div>
      <div style={{ color: theme.muted, fontSize: 13.5, minWidth: 0 }}>{value}</div>
    </div>
  );
}

export function SettingsActionRow({
  label,
  detail,
  action,
  theme,
}: Readonly<{ label: string; detail: string; action: React.ReactNode; theme: SettingsTheme }>) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 18,
        paddingBottom: 18,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <div>
        <div style={{ color: theme.text, fontSize: 13.5, fontWeight: 700 }}>{label}</div>
        <div style={{ marginTop: 4, color: theme.muted, fontSize: 13 }}>{detail}</div>
      </div>
      {action}
    </div>
  );
}
