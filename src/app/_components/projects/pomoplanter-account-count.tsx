'use client';

import { useEffect, useState } from 'react';

import { POMODORO_PLANTER } from './projects';

const fetchAccountCount = async () => {
  const response = await fetch(POMODORO_PLANTER.accountCountUrl);
  const accountCount = Number(await response.text());

  if (!response.ok || !Number.isInteger(accountCount)) {
    throw new Error(`Account count request failed (HTTP ${response.status})`);
  }

  return accountCount;
};

const formatAccountCount = (accountCount: number) => {
  if (accountCount === 1) {
    return '1 ACCOUNT';
  }

  return `${accountCount.toLocaleString('en')} ACCOUNTS`;
};

export const PomoplanterAccountCount = () => {
  const [label, setLabel] = useState<string | null>(null);

  // REASON: the total lives on pomoplanter.com and the dive tree is client-only, so the browser reads it after mount to keep it live instead of frozen at build
  useEffect(() => {
    fetchAccountCount().then(
      (accountCount) => setLabel(formatAccountCount(accountCount)),
      () => setLabel('ACCOUNT COUNT UNAVAILABLE'),
    );
  }, []);

  if (label === null) {
    return null;
  }

  return <> · {label}</>;
};
