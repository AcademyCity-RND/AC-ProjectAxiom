import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Fingerprint, CheckCircle2 } from 'lucide-react';
import { UserAccountTab } from './UserAccountTab';
import { AuditLogTab } from './AuditLogTab';
import { api } from '../../services/api';
import type { UserAccount, AuditLogItem, AuditSummary } from '../../types';

export const UserManagement: React.FC = () => {
  const [subView, setSubView] = useState<'accounts' | 'audit'>('accounts');

  // State untuk Akun Pengguna
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [userError, setUserError] = useState<string | null>(null);

  // State untuk Log Audit Forensik & Leak Tracing
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  const [isLoadingAudit, setIsLoadingAudit] = useState<boolean>(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Notifikasi Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setUserError(null);
    try {
      const data = await api.getUsers();
      setUsers(data.users || []);
    } catch (err: any) {
      setUserError(err.message || 'Gagal memuat daftar pengguna.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchAuditData = async () => {
    setIsLoadingAudit(true);
    setAuditError(null);
    try {
      const [logsData, summaryData] = await Promise.all([
        api.getAuditLogs({ limit: 200 }),
        api.getAuditSummary(),
      ]);
      setAuditLogs(logsData.logs || []);
      setAuditSummary(summaryData);
    } catch (err: any) {
      setAuditError(err.message || 'Gagal memuat log audit aktivitas.');
    } finally {
      setIsLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (subView === 'accounts') {
      fetchUsers();
    } else {
      fetchAuditData();
    }
  }, [subView]);

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 border border-emerald-500/40 text-emerald-300 rounded-lg shadow-xl font-mono text-xs animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Halaman & Sub-View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              User Management &amp; Audit Forensik
            </h1>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/35 font-semibold">
              ADMIN ONLY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manajemen hierarki akun operator analis, kontrol akses RBAC, dan pelacakan kebocoran dokumen digital (Leak Tracing).
          </p>
        </div>

        {/* Sub-View Switcher */}
        <div className="flex items-center p-1 bg-slate-950 border border-slate-800/80 rounded-md text-xs shadow-inner self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setSubView('accounts')}
            className={`px-3 py-1.5 rounded transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer whitespace-nowrap flex items-center gap-1.5 font-medium ${
              subView === 'accounts'
                ? 'bg-slate-800 text-sky-400 border border-slate-700/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Akun Operator ({users.length})</span>
          </button>
          <button
            onClick={() => setSubView('audit')}
            className={`px-3 py-1.5 rounded transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer whitespace-nowrap flex items-center gap-1.5 font-medium ${
              subView === 'audit'
                ? 'bg-slate-800 text-amber-400 border border-slate-700/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Jejak Audit &amp; Leak Tracing</span>
          </button>
        </div>
      </div>

      {/* Sub-View Renders */}
      {subView === 'accounts' ? (
        <UserAccountTab
          users={users}
          isLoading={isLoadingUsers}
          error={userError}
          onRefresh={fetchUsers}
          onShowToast={showToast}
          onUsersChange={setUsers}
        />
      ) : (
        <AuditLogTab
          logs={auditLogs}
          summary={auditSummary}
          isLoading={isLoadingAudit}
          error={auditError}
          onRefresh={fetchAuditData}
        />
      )}
    </div>
  );
};
