import React from 'react';
import { ChevronRight } from 'lucide-react';
import { ThreatBadge } from '../common/ThreatBadge';
import { Pagination } from '../common/Pagination';
import type { CaseSummary } from '../../types';

interface CasesTableProps {
  cases: CaseSummary[];
  currentPage: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onSelectCase: (caseId: string) => void;
  title?: string;
  emptyMessage?: string;
}

export const CasesTable: React.FC<CasesTableProps> = ({
  cases,
  currentPage,
  pageSize = 8,
  onPageChange,
  onSelectCase,
  title = 'DATABASE SASARAN AKTIF (POSTGRESQL)',
  emptyMessage = 'Belum ada target atau kasus terdaftar di database PostgreSQL.',
}) => {
  const paginatedCases = cases.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="cyber-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/70">
        <div className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
          {title}
        </div>
        <span className="text-xs font-mono tabular-nums text-slate-400">
          Total: {cases.length} Kasus
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-slate-800/80 text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400 bg-slate-950/40">
            <tr>
              <th className="py-3 px-3.5 sm:px-5">Target / Akun</th>
              <th className="py-3 px-3.5 sm:px-5">Platform</th>
              <th className="py-3 px-3.5 sm:px-5">Klasifikasi AI</th>
              <th className="py-3 px-3.5 sm:px-5">Waktu / Status</th>
              <th className="py-3 px-3.5 sm:px-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {paginatedCases.length > 0 ? (
              paginatedCases.map((rc, idx) => (
                <tr
                  key={rc.case_id || idx}
                  onClick={() => onSelectCase(rc.case_id)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors duration-150 group"
                >
                  <td className="py-3.5 px-3.5 sm:px-5 font-mono font-medium text-sky-400 group-hover:text-sky-300">
                    <span className="truncate block max-w-xs">{rc.target}</span>
                    {(rc as any).display_name && (
                      <span className="block text-[11px] text-slate-400 font-sans font-normal mt-0.5 truncate max-w-xs">
                        {(rc as any).display_name}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3.5 sm:px-5 font-mono text-xs uppercase text-slate-300">
                    {rc.platform}
                  </td>
                  <td className="py-3.5 px-3.5 sm:px-5">
                    <ThreatBadge type="class" value={rc.verdict || rc.status} />
                  </td>
                  <td className="py-3.5 px-3.5 sm:px-5 font-mono text-xs text-slate-400">
                    {rc.created_at
                      ? new Date(rc.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : (rc as any).date || rc.case_id}
                  </td>
                  <td className="py-3.5 px-3.5 sm:px-5 text-right">
                    <span className="text-xs text-slate-400 group-hover:text-sky-400 inline-flex items-center gap-1 font-medium transition-colors">
                      Buka Kasus <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs text-slate-500 font-mono">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={cases.length}
        pageSize={pageSize}
        onPageChange={onPageChange}
        itemLabel="kasus"
      />
    </div>
  );
};
