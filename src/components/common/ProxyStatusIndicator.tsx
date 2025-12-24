import React from 'react';
// FIX: The type 'ProxyStatus' does not exist. Replaced with 'ApiStatus' which is what parent components provide.
import type { ApiStatus } from '../../types';
import { Tooltip } from './Tooltip';
import { ServerIcon } from '../icons/Icons';

interface ProxyStatusIndicatorProps {
  status: ApiStatus;
}

const getStatusInfo = (status: ApiStatus) => {
  switch (status) {
    case 'IDLE':
      return {
        color: 'text-slate-500',
        tooltip: 'Status API: Idle. Menunggu permintaan.',
        animation: '',
      };
    case 'PENDING':
      return {
        color: 'text-amber-400',
        tooltip: 'Status API: Tertunda. Mengirim permintaan ke server AI.',
        animation: 'animate-pulse',
      };
    case 'SUCCESS':
      return {
        color: 'text-green-500',
        tooltip: 'Status API: Berhasil. Permintaan terakhir berhasil.',
        animation: '',
      };
    case 'ERROR':
      return {
        color: 'text-red-500',
        tooltip: 'Status API: Gagal. Terjadi kesalahan pada permintaan terakhir.',
        animation: '',
      };
    default:
        return { color: 'text-slate-500', tooltip: 'Status API: Tidak Diketahui', animation: '' };
  }
};

export const ProxyStatusIndicator: React.FC<ProxyStatusIndicatorProps> = ({ status }) => {
  const { color, tooltip, animation } = getStatusInfo(status);

  return (
    <Tooltip text={tooltip} position="left">
        <div className={`transition-colors ${animation}`}>
            <ServerIcon className={`w-5 h-5 ${color}`} />
        </div>
    </Tooltip>
  );
};