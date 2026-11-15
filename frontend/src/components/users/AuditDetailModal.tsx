import React from 'react';
import { Terminal } from 'lucide-react';
import { Modal } from '../common/Modal';
import type { AuditLogItem } from '../../types';

interface AuditDetailModalProps {
  log: AuditLogItem | null;
  onClose: () => void;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <Modal
      isOpen={Boolean(log)}
      onClose={onClose}
      title={`Detail Rekaman Audit #${log.id}`}
      subtitle="Parameter operasional & metadata forensik"
      icon={<Terminal className="w-4 h-4 text-sky-400" />}
      maxWidth="lg"
    >
      <div className="space-y-3.5 text-xs">
        <div className="grid grid-cols-2 gap-2 bg-slate-950/60 border border-slate-800/80 p-3 rounded-md font-mono">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Operator</span>
            <span className="text-slate-200 font-semibold">
              {log.operator_username} ({log.operator_role || 'user'})
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Alamat IP</span>
            <span className="text-slate-200">{log.ip_address || '127.0.0.1'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Waktu Log</span>
            <span className="text-slate-200">{new Date(log.timestamp).toISOString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Status Operasi</span>
            <span className="text-emerald-400 font-semibold">{log.status}</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase font-mono block mb-1">
            Parameter Input &amp; Bukti Kriptografis (JSON):
          </span>
          <pre className="p-3 bg-slate-950 border border-slate-800 rounded-md font-mono text-[11px] text-sky-300 overflow-x-auto max-h-56 leading-relaxed">
            {JSON.stringify(log.details || {}, null, 2)}
          </pre>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
