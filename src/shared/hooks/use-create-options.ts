'use client';

import React from 'react';
import { EMPTY_CREATE_OPTIONS, notionPaymentsService } from '@/shared/services/notion-payments.service';
import type { CreateOptions } from '@/shared/types/finance.types';

export function useCreateOptions() {
  const [options, setOptions] = React.useState<CreateOptions>(EMPTY_CREATE_OPTIONS);

  React.useEffect(() => {
    notionPaymentsService.getOptions()
      .then(setOptions)
      .catch(() => setOptions(EMPTY_CREATE_OPTIONS));
  }, []);

  return options;
}
