import React from 'react';
import { FORM_INPUT_STYLE, FORM_LABEL_STYLE } from '@/components/ui';

export const BANK_META: Record<string, { color: string; bg: string }> = {
  interbank:  { color: '#fff', bg: '#006341' },
  bcp:        { color: '#fff', bg: '#003DA5' },
  bbva:       { color: '#fff', bg: '#004481' },
  scotiabank: { color: '#fff', bg: '#d42b1b' },
  yape:       { color: '#fff', bg: '#7b2d8b' },
  plin:       { color: '#fff', bg: '#00b4d8' },
  falabella:  { color: '#fff', bg: '#009640' },
};

export const ACCOUNT_INPUT_STYLE: React.CSSProperties = {
  ...FORM_INPUT_STYLE,
  background: '#fafafa',
};

export const ACCOUNT_LABEL_STYLE: React.CSSProperties = {
  ...FORM_LABEL_STYLE,
};
