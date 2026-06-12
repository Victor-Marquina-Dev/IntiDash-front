'use client';

import React from 'react';
import { Icon } from '@/components/icons';
import {
  SETTINGS_ACCENT,
  SettingsActionRow,
  SettingsField,
  SettingsInfoRow,
  SettingsPanel,
  SettingsShell,
  settingsDarkTheme,
  settingsLightTheme,
  type SettingsNavItem,
} from '@/components/screens/settings/SettingsLayout';
import { NotionSyncSettings } from '@/components/screens/settings/NotionSyncSettings';
import { useWorkspaces } from '@/shared/hooks/use-workspaces';
import type { AuthUser } from '@/shared/services/auth.service';
import { WorkspaceMembersCard } from '@/components/screens/notion/WorkspaceMembersCard';

export type SettingsSection = 'profile' | 'account' | 'appearance' | 'notifications' | 'workspace' | 'notionSync';

interface NotionScreenProps {
  accent: string;
  user?: AuthUser | null;
  darkMode?: boolean;
  onToggleDark?: () => void;
  canWrite?: boolean;
  initialSection?: SettingsSection;
}

const NAV_ITEMS: ReadonlyArray<SettingsNavItem<SettingsSection>> = [
  { id: 'profile', label: 'Perfil', icon: Icon.edit },
  { id: 'account', label: 'Cuenta', icon: Icon.gear },
  { id: 'appearance', label: 'Apariencia', icon: Icon.moon },
  { id: 'notifications', label: 'Notificaciones', icon: Icon.bell },
  { id: 'workspace', label: 'Espacio compartido', icon: Icon.db },
  { id: 'notionSync', label: 'Sincronizacion con Notion', icon: Icon.refresh },
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  user: 'Usuario',
};

function getInitials(user?: AuthUser | null) {
  const source = user?.name?.trim() || user?.email?.trim() || 'Usuario';
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

function getDisplayName(user?: AuthUser | null) {
  return user?.name?.trim() || user?.email?.split('@')[0] || 'Usuario';
}

function getRoleLabel(role?: string) {
  return ROLE_LABELS[role || ''] || 'Usuario';
}

export function NotionScreen({ accent, user, darkMode = false, onToggleDark, canWrite = true, initialSection = 'profile' }: Readonly<NotionScreenProps>) {
  const [section, setSection] = React.useState<SettingsSection>(initialSection);
  const { list: workspaces, active: activeWorkspace } = useWorkspaces(true);
  const theme = darkMode ? settingsDarkTheme : settingsLightTheme;
  const displayName = getDisplayName(user);
  const roleLabel = getRoleLabel(user?.role);

  return (
    <SettingsShell
      activeColor={SETTINGS_ACCENT}
      activeSection={section}
      darkMode={darkMode}
      navItems={NAV_ITEMS}
      onSectionChange={setSection}
      profile={{
        initials: getInitials(user),
        name: displayName,
        subtitle: 'Cuenta personal',
      }}
      theme={theme}
    >
      {section === 'profile' && (
        <SettingsPanel title="Perfil publico" theme={theme}>
          <SettingsField label="Nombre" value={displayName} theme={theme} />
          <SettingsField label="Email publico" value={user?.email || 'Sin email'} theme={theme} />
          <SettingsField label="Rol" value={roleLabel} theme={theme} />
        </SettingsPanel>
      )}

      {section === 'account' && (
        <SettingsPanel title="Cuenta" theme={theme}>
          <SettingsInfoRow label="Tipo de cuenta" value={roleLabel} theme={theme} />
          <SettingsInfoRow label="Sesion" value={user ? 'Activa' : 'No iniciada'} theme={theme} />
          <SettingsInfoRow label="Espacios disponibles" value={String(workspaces.length)} theme={theme} />
          <SettingsInfoRow label="Espacio activo" value={activeWorkspace?.name || 'Sin espacio activo'} theme={theme} />
        </SettingsPanel>
      )}

      {section === 'appearance' && (
        <SettingsPanel title="Apariencia" theme={theme}>
          <SettingsActionRow
            label="Modo oscuro"
            detail={darkMode ? 'Activado' : 'Desactivado'}
            theme={theme}
            action={
              <button
                type="button"
                onClick={onToggleDark}
                aria-pressed={darkMode}
                style={{
                  height: 40,
                  padding: '0 14px',
                  borderRadius: 8,
                  border: `1px solid ${theme.border}`,
                  background: theme.surfaceMuted,
                  color: theme.text,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 800,
                  fontFamily: 'inherit',
                }}
              >
                {darkMode ? <Icon.sun size={18} /> : <Icon.moon size={18} />}
                {darkMode ? 'Claro' : 'Oscuro'}
              </button>
            }
          />

          <SettingsActionRow
            label="Color principal"
            detail={accent}
            theme={theme}
            action={
              <span
                aria-hidden
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: accent,
                  boxShadow: `0 0 0 3px ${theme.border}`,
                }}
              />
            }
          />
        </SettingsPanel>
      )}

      {section === 'notifications' && (
        <SettingsPanel title="Notificaciones" theme={theme}>
          <SettingsInfoRow label="Invitaciones a espacios" value="Activas" theme={theme} />
          <SettingsInfoRow label="Alertas del dashboard" value="Activas" theme={theme} />
        </SettingsPanel>
      )}

      {section === 'workspace' && (
        <SettingsPanel title="Espacio compartido" theme={theme} maxWidth={980}>
          <WorkspaceMembersCard accent={accent} embedded />
        </SettingsPanel>
      )}

      {section === 'notionSync' && (
        <SettingsPanel title="Sincronizacion con Notion" theme={theme}>
          <NotionSyncSettings theme={theme} canWrite={canWrite} />
        </SettingsPanel>
      )}
    </SettingsShell>
  );
}
