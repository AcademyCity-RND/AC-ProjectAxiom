import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  User,
  Trash2,
  Lock,
  Search,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  Radar,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink,
  Fingerprint,
  Info,
  Clock,
  Terminal,
} from 'lucide-react';
import { api } from '../../services/api';
import type {
  UserAccount,
  UserCreatePayload,
  AuditLogItem,
  AuditSummary,
} from '../../types';

export const UserManagement: React.FC = () => {
  const [subView, setSubView] = useState<'accounts' | 'audit'>('accounts');

  // State untuk Akun Pengguna
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [isSubmittingUser, setIsSubmittingUser] = useState<boolean>(false);
  const [formUserError, setFormUserError] = useState<string | null>(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<number | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null);

  // State untuk Log Audit Forensik & Leak Tracing
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  const [isLoadingAudit, setIsLoadingAudit] = useState<boolean>(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditLogItem | null>(null);

  // Filter Log
  const [operatorFilter, setOperatorFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [searchAuditQuery, setSearchAuditQuery] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [auditPage, setAuditPage] = useState<number>(1);
  const AUDIT_PAGE_SIZE = 15;

  // Notifikasi Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Muat data pengguna
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

  // Muat data audit log & ringkasan
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

  // Tambah akun pengguna baru (Role terkunci mutlak ke USER)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormUserError(null);

    const cleanUser = newUsername.trim().toLowerCase();
    if (!cleanUser || cleanUser.length < 3) {
      setFormUserError('Username minimal 3 karakter alfanumerik.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setFormUserError('Kata sandi minimal 6 karakter.');
      return;
    }

    setIsSubmittingUser(true);
    try {
      const created = await api.createUser({
        username: cleanUser,
        password: newPassword,
      });
      showToast(`Akun pengguna ${created.username} (ROLE: USER) berhasil dibuat.`);
      setShowAddModal(false);
      setNewUsername('');
      setNewPassword('');
      fetchUsers();
    } catch (err: any) {
      setFormUserError(err.message || 'Gagal membuat akun pengguna baru.');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  // Toggle status keaktifan akun pengguna
  const handleToggleStatus = async (user: UserAccount) => {
    if (user.role === 'admin') {
      alert('Akun Administrator Inti dilindungi dan tidak dapat dinonaktifkan.');
      return;
    }

    setTogglingUserId(user.id);
    try {
      const updated = await api.updateUserStatus(user.id, !user.is_active);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: updated.is_active } : u))
      );
      showToast(
        `Status akun ${user.username} diubah menjadi: ${updated.is_active ? 'AKTIF' : 'NONAKTIF'}.`
      );
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status akun.');
    } finally {
      setTogglingUserId(null);
    }
  };

  // Hapus akun pengguna
  const handleDeleteUser = async (user: UserAccount) => {
    if (user.role === 'admin') {
      alert('Akun Administrator Inti dilindungi dan tidak dapat dihapus.');
      return;
    }

    if (confirmDeleteUserId !== user.id) {
      setConfirmDeleteUserId(user.id);
      setTimeout(() => setConfirmDeleteUserId(null), 4000);
      return;
    }

    setConfirmDeleteUserId(null);
    try {
      await api.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      showToast(`Akun pengguna ${user.username} telah dihapus permanen.`);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus akun pengguna.');
    }
  };

  // Copy hash ke clipboard
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  // Filter data audit log
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Filter Operator
      if (operatorFilter !== 'ALL' && log.operator_username !== operatorFilter) {
        return false;
      }
      // Filter Kategori Aksi
      if (actionFilter !== 'ALL') {
        if (actionFilter === 'SCRAPE' && log.action !== 'SCRAPE_INVESTIGATION') return false;
        if (actionFilter === 'DOWNLOAD_PDF' && log.action !== 'DOWNLOAD_DOSSIER_PDF') return false;
        if (actionFilter === 'DOWNLOAD_CSV' && log.action !== 'DOWNLOAD_LEDGER_CSV') return false;
        if (actionFilter === 'USER_MUTATION' && !log.action.startsWith('USER_')) return false;
      }
      // Search Query
      if (searchAuditQuery.trim()) {
        const q = searchAuditQuery.toLowerCase();
        const matchTarget = log.target?.toLowerCase().includes(q);
        const matchOperator = log.operator_username.toLowerCase().includes(q);
        const matchAction = log.action.toLowerCase().includes(q);
        const matchDocCode = (log.details as any)?.document_code?.toLowerCase().includes(q);
        const matchHash = (log.details as any)?.sha256_hash?.toLowerCase().includes(q);
        const matchCaseId = (log.details as any)?.case_id?.toLowerCase().includes(q);
        if (!matchTarget && !matchOperator && !matchAction && !matchDocCode && !matchHash && !matchCaseId) {
          return false;
        }
      }
      return true;
    });
  }, [auditLogs, operatorFilter, actionFilter, searchAuditQuery]);

  // Daftar unik operator dari audit log
  const uniqueOperators = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach((l) => {
      if (l.operator_username) set.add(l.operator_username);
    });
    return Array.from(set);
  }, [auditLogs]);

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

      {/* =========================================================================
          SUB-VIEW 1: MANAJEMEN AKUN OPERATOR
      ========================================================================= */}
      {subView === 'accounts' && (
        <div className="space-y-4">
          {/* Metrik Akun */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-lg">
              <span className="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider block">
                Total Akun Pengguna
              </span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">
                {users.length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Database PostgreSQL</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-lg">
              <span className="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider block">
                Operator Aktif
              </span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                {users.filter((u) => u.is_active).length}
              </span>
              <span className="text-[11px] text-emerald-500/80 mt-0.5 block">Izin login diaktifkan</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-lg">
              <span className="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider block">
                Akun Dinonaktifkan
              </span>
              <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">
                {users.filter((u) => !u.is_active).length}
              </span>
              <span className="text-[11px] text-rose-500/80 mt-0.5 block">Akses diblokir (403)</span>
            </div>

            <div className="bg-slate-900/60 border border-amber-500/20 p-3.5 rounded-lg">
              <span className="text-[10px] font-semibold text-amber-400/90 font-mono uppercase tracking-wider block">
                Administrator Inti
              </span>
              <span className="text-xl font-bold font-mono text-amber-300 mt-1 block">
                {users.filter((u) => u.role === 'admin').length}
              </span>
              <span className="text-[11px] text-amber-500/80 mt-0.5 block">Satgas PUSSIBERAD Root</span>
            </div>
          </div>

          {/* Action Bar & Tombol Tambah Pengguna */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg">
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                Pengaturan hak akses sistem: Akun baru dibuat dengan wewenang <strong className="text-sky-300 font-mono">USER</strong> (Analis). Hak Administrator dikunci.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={fetchUsers}
                disabled={isLoadingUsers}
                className="px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-medium"
                title="Segarkan data pengguna"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin text-sky-400' : ''}`} />
                <span>Segarkan</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 rounded-md border border-sky-500/30 bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-medium shadow-sm active:scale-[0.98]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah User Baru</span>
              </button>
            </div>
          </div>

          {/* Tabel Pengguna */}
          <div className="cyber-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/70">
              <div className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
                DAFTAR AKUN OPERATOR SISTEM (POSTGRESQL)
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                Total: {users.length} Akun
              </span>
            </div>

            {userError && (
              <div className="p-4 bg-rose-950/30 border-b border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{userError}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-slate-800/80 text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400 bg-slate-950/40">
                  <tr>
                    <th className="py-3 px-4 sm:px-5">Akun Operator</th>
                    <th className="py-3 px-4 sm:px-5">Tingkat Peran (Role)</th>
                    <th className="py-3 px-4 sm:px-5">Status Keaktifan</th>
                    <th className="py-3 px-4 sm:px-5">Waktu Registrasi</th>
                    <th className="py-3 px-4 sm:px-5 text-right">Manajemen Akun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {users.length > 0 ? (
                    users.map((u) => {
                      const isAdmin = u.role === 'admin';
                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-800/30 transition-colors duration-150"
                        >
                          {/* Akun & Avatar */}
                          <td className="py-3 px-4 sm:px-5">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                                  isAdmin
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-sky-950 text-sky-300 border border-sky-500/30'
                                }`}
                              >
                                {isAdmin ? (
                                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                                ) : (
                                  <User className="w-3.5 h-3.5 text-sky-400" />
                                )}
                              </div>
                              <div>
                                <span className="font-mono font-semibold text-slate-100 flex items-center gap-1.5">
                                  {u.username}
                                  {isAdmin && (
                                    <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 font-mono">
                                      PUSSIBERAD ROOT
                                    </span>
                                  )}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono block">
                                  UID: #{u.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3 px-4 sm:px-5">
                            {isAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/35">
                                <ShieldCheck className="w-3 h-3 text-amber-400" />
                                ADMIN (ROOT)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/25">
                                <User className="w-3 h-3 text-sky-400" />
                                USER (ANALIS)
                              </span>
                            )}
                          </td>

                          {/* Status Keaktifan */}
                          <td className="py-3 px-4 sm:px-5">
                            {u.is_active ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                Dinonaktifkan
                              </span>
                            )}
                          </td>

                          {/* Tanggal Registrasi */}
                          <td className="py-3 px-4 sm:px-5 text-xs font-mono text-slate-400">
                            {new Date(u.created_at).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          {/* Action Buttons: Toggle Status & Hapus */}
                          <td className="py-3 px-4 sm:px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isAdmin ? (
                                <span className="text-[11px] text-slate-500 font-mono italic">
                                  Akun Terproteksi
                                </span>
                              ) : (
                                <>
                                  {/* Toggle Aktif/Nonaktif */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatus(u)}
                                    disabled={togglingUserId === u.id}
                                    className={`px-2 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                                      u.is_active
                                        ? 'bg-slate-900 border-slate-700 hover:bg-rose-950/40 hover:border-rose-500/40 hover:text-rose-300 text-slate-300'
                                        : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                                    }`}
                                    title={u.is_active ? 'Nonaktifkan akses akun' : 'Aktifkan akses akun'}
                                  >
                                    {togglingUserId === u.id
                                      ? 'Memproses...'
                                      : u.is_active
                                      ? 'Nonaktifkan'
                                      : 'Aktifkan'}
                                  </button>

                                  {/* Tombol Hapus */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(u)}
                                    className={`p-1.5 rounded transition-all cursor-pointer ${
                                      confirmDeleteUserId === u.id
                                        ? 'bg-rose-600 text-white border border-rose-500 animate-pulse'
                                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-950/20'
                                    }`}
                                    title={
                                      confirmDeleteUserId === u.id
                                        ? 'Klik sekali lagi untuk konfirmasi hapus permanen'
                                        : 'Hapus akun pengguna'
                                    }
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-slate-500 font-mono">
                        {isLoadingUsers ? 'Memuat data akun pengguna...' : 'Belum ada data akun.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-VIEW 2: LOG FORENSIK AKTIVITAS & DIGITAL LEAK TRACING
      ========================================================================= */}
      {subView === 'audit' && (
        <div className="space-y-4">
          {/* Metrik Audit Forensik */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider block">
                  Total Aktivitas Forensik
                </span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  {auditSummary?.total_activities ?? auditLogs.length}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Log operasional tercatat</span>
              </div>
              <div className="w-9 h-9 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                <Terminal className="w-4 h-4 text-sky-400" />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider block">
                  Operasi Scrapping / Investigasi
                </span>
                <span className="text-xl font-bold font-mono text-sky-400 mt-1 block">
                  {auditSummary?.total_scraping_operations ??
                    auditLogs.filter((l) => l.action === 'SCRAPE_INVESTIGATION').length}
                </span>
                <span className="text-[11px] text-sky-500/80 mt-0.5 block">Target @username &amp; event URL</span>
              </div>
              <div className="w-9 h-9 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                <Radar className="w-4 h-4 text-sky-400" />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-amber-500/20 p-3.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-amber-400/90 font-mono uppercase tracking-wider block">
                  Ekspor Dokumen (PDF / CSV)
                </span>
                <span className="text-xl font-bold font-mono text-amber-300 mt-1 block">
                  {auditSummary?.total_document_downloads ??
                    auditLogs.filter((l) => l.action.startsWith('DOWNLOAD_')).length}
                </span>
                <span className="text-[11px] text-amber-500/80 mt-0.5 block">Ditandai SHA-256 untuk tracing</span>
              </div>
              <div className="w-9 h-9 rounded-md bg-slate-950 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Fingerprint className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          </div>

          {/* Banner Digital Leak Tracing & Rantai Barang Bukti */}
          <div className="bg-gradient-to-r from-amber-950/20 via-slate-900/80 to-slate-900/80 border border-amber-500/30 p-3.5 rounded-lg flex items-start gap-3">
            <Fingerprint className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-semibold text-amber-300 font-mono tracking-tight flex items-center gap-2">
                <span>DIGITAL LEAK TRACING &amp; CHAIN OF CUSTODY (PUSSIBERAD)</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40">
                  TAMPER-PROOF
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Setiap dokumen <strong>Dossier PDF (@media print)</strong> dan <strong>Dataset CSV</strong> yang diekspor oleh analis secara otomatis dicap dengan <strong>Kode Dokumen Unik</strong> dan <strong>SHA-256 Evidence Hash</strong>. Apabila berkas intelijen bocor ke publik, Satgas dapat mencocokkan kode atau hash tersebut ke tabel di bawah untuk menemukan identitas akun operator pengekspor, alamat IP, dan waktu penerbitannya.
              </p>
            </div>
          </div>

          {/* Filter Bar Log */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-950/70 border border-slate-800/80 p-3 rounded-lg">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Target / Hash / Doc Code */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchAuditQuery}
                  onChange={(e) => setSearchAuditQuery(e.target.value)}
                  placeholder="Cari target, kode dokumen, hash..."
                  className="w-full bg-slate-900 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 font-mono"
                />
                {searchAuditQuery && (
                  <button
                    onClick={() => setSearchAuditQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Filter Operator */}
              <select
                value={operatorFilter}
                onChange={(e) => setOperatorFilter(e.target.value)}
                aria-label="Filter Operator"
                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50 font-mono cursor-pointer"
              >
                <option value="ALL">Semua Operator ({auditLogs.length})</option>
                {uniqueOperators.map((op) => (
                  <option key={op} value={op}>
                    Operator: {op}
                  </option>
                ))}
              </select>

              {/* Filter Aksi */}
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                aria-label="Filter Kategori Aksi"
                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50 font-mono cursor-pointer"
              >
                <option value="ALL">Semua Kategori Aksi</option>
                <option value="SCRAPE">Scrapping / Investigasi</option>
                <option value="DOWNLOAD_PDF">Unduh Dossier PDF</option>
                <option value="DOWNLOAD_CSV">Unduh Dataset CSV</option>
                <option value="USER_MUTATION">Manajemen Akun</option>
              </select>
            </div>

            <button
              type="button"
              onClick={fetchAuditData}
              disabled={isLoadingAudit}
              className="px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5 font-medium shrink-0"
              title="Segarkan Log"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAudit ? 'animate-spin text-amber-400' : ''}`} />
              <span>Segarkan Log</span>
            </button>
          </div>

          {/* Tabel Log Forensik */}
          <div className="cyber-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/70">
              <div className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
                JEJAK LOG OPERASIONAL &amp; PELACAKAN DOKUMEN FORENSIK
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                Menampilkan: {filteredAuditLogs.length} Entri
              </span>
            </div>

            {auditError && (
              <div className="p-4 bg-rose-950/30 border-b border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{auditError}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-slate-800/80 text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400 bg-slate-950/40">
                  <tr>
                    <th className="py-3 px-3.5 sm:px-4">Waktu (WIB)</th>
                    <th className="py-3 px-3.5 sm:px-4">Operator &amp; Role</th>
                    <th className="py-3 px-3.5 sm:px-4">Kategori Aksi</th>
                    <th className="py-3 px-3.5 sm:px-4">Sasaran / Input</th>
                    <th className="py-3 px-3.5 sm:px-4">Kode Dokumen / SHA-256 Hash</th>
                    <th className="py-3 px-3.5 sm:px-4 text-right">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredAuditLogs.length > 0 ? (
                    filteredAuditLogs
                      .slice((auditPage - 1) * AUDIT_PAGE_SIZE, auditPage * AUDIT_PAGE_SIZE)
                      .map((log) => {
                        const isScrape = log.action === 'SCRAPE_INVESTIGATION';
                        const isPdf = log.action === 'DOWNLOAD_DOSSIER_PDF';
                        const isCsv = log.action === 'DOWNLOAD_LEDGER_CSV';
                        const isUserMutation = log.action.startsWith('USER_');
                        const isAdmin = log.operator_role === 'admin';
                        const docCode = (log.details as any)?.document_code;
                        const sha256 = (log.details as any)?.sha256_hash;
                        const caseId = (log.details as any)?.case_id;

                        return (
                          <tr
                            key={log.id}
                            className="hover:bg-slate-800/30 transition-colors duration-150"
                          >
                            {/* Waktu */}
                            <td className="py-3 px-3.5 sm:px-4 font-mono text-xs text-slate-300 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </td>

                            {/* Operator & Role */}
                            <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold text-slate-100">
                                  {log.operator_username}
                                </span>
                                {isAdmin ? (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/35">
                                    ADMIN
                                  </span>
                                ) : (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/25">
                                    USER
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Kategori Aksi Badge */}
                            <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap">
                              {isScrape && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/25">
                                  <Radar className="w-3 h-3" />
                                  SCRAPE
                                </span>
                              )}
                              {isPdf && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/25">
                                  <FileText className="w-3 h-3 text-rose-400" />
                                  UNDUH PDF
                                </span>
                              )}
                              {isCsv && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                                  <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                                  UNDUH CSV
                                </span>
                              )}
                              {isUserMutation && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/25">
                                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                                  USER MGMT
                                </span>
                              )}
                              {!isScrape && !isPdf && !isCsv && !isUserMutation && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                                  {log.action}
                                </span>
                              )}
                            </td>

                            {/* Sasaran / Target / Input */}
                            <td className="py-3 px-3.5 sm:px-4">
                              <div className="font-mono text-xs text-slate-200 truncate max-w-[220px]" title={log.target || '-'}>
                                {log.target || (caseId ? `Case: ${caseId}` : '-')}
                              </div>
                              {log.details && (log.details as any).platform && (
                                <span className="text-[10px] text-slate-400 font-mono uppercase block">
                                  Platform: {(log.details as any).platform} &bull; Max:{' '}
                                  {(log.details as any).max_interactions ||
                                    (log.details as any).max_comments ||
                                    '-'}
                                </span>
                              )}
                            </td>

                            {/* Kode Dokumen & SHA-256 Hash */}
                            <td className="py-3 px-3.5 sm:px-4">
                              {docCode || sha256 ? (
                                <div className="space-y-1">
                                  {docCode && (
                                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-300">
                                      <Fingerprint className="w-3 h-3 text-amber-400 shrink-0" />
                                      <span className="font-semibold">{docCode}</span>
                                    </div>
                                  )}
                                  {sha256 && (
                                    <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                                      <span className="truncate max-w-[140px]" title={sha256}>
                                        {sha256.substring(0, 16)}...
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyHash(sha256)}
                                        className="p-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                        title="Salin SHA-256 Hash Lengkap"
                                      >
                                        {copiedHash === sha256 ? (
                                          <Check className="w-3 h-3 text-emerald-400" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] font-mono text-slate-500">-</span>
                              )}
                            </td>

                            {/* Tombol Detail JSON */}
                            <td className="py-3 px-3.5 sm:px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedLogDetail(log)}
                                className="px-2 py-1 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-300 text-xs font-mono transition-colors cursor-pointer"
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-slate-500 font-mono">
                        {isLoadingAudit ? 'Memuat log aktivitas forensik...' : 'Tidak ada log yang cocok dengan filter.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Audit Log */}
            {filteredAuditLogs.length > 0 && (
              <div className="px-4 sm:px-5 py-3 border-t border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
                <div>
                  Menampilkan{' '}
                  <span className="text-white font-medium">
                    {(auditPage - 1) * AUDIT_PAGE_SIZE + 1}
                  </span>{' '}
                  -{' '}
                  <span className="text-white font-medium">
                    {Math.min(auditPage * AUDIT_PAGE_SIZE, filteredAuditLogs.length)}
                  </span>{' '}
                  dari <span className="text-white font-medium">{filteredAuditLogs.length}</span> log
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                    disabled={auditPage === 1}
                    className="px-2.5 py-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    &larr; Sebelumnya
                  </button>
                  <span className="px-2 text-slate-400 font-mono text-xs">
                    Halaman {auditPage} /{' '}
                    {Math.max(1, Math.ceil(filteredAuditLogs.length / AUDIT_PAGE_SIZE))}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setAuditPage((p) =>
                        Math.min(
                          Math.max(1, Math.ceil(filteredAuditLogs.length / AUDIT_PAGE_SIZE)),
                          p + 1
                        )
                      )
                    }
                    disabled={
                      auditPage >= Math.max(1, Math.ceil(filteredAuditLogs.length / AUDIT_PAGE_SIZE))
                    }
                    className="px-2.5 py-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    Selanjutnya &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TAMBAH AKUN PENGGUNA BARU (Role Dikunci ke USER)
      ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0D131F] border border-slate-800 rounded-lg max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-sky-950/80 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    Tambah Akun Operator Baru
                  </h3>
                  <p className="text-[11px] text-slate-400">Registrasi analis intelijen kognitif</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              {formUserError && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded text-xs flex items-center gap-2 font-mono">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formUserError}</span>
                </div>
              )}

              {/* Input Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Username Operator</span>
                  <span className="text-[10px] text-slate-500 font-mono">Huruf/angka/underscore</span>
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="contoh: analis_02"
                  required
                  minLength={3}
                  maxLength={50}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/60 font-mono"
                />
              </div>

              {/* Input Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Kata Sandi Awal</span>
                  <span className="text-[10px] text-slate-500 font-mono">Minimal 6 karakter</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  required
                  minLength={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/60 font-mono"
                />
              </div>

              {/* Role Selection (Locked to USER per Security Protocol) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Tingkat Akses (Role)</span>
                  <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Terkunci Mutlak
                  </span>
                </label>
                <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-md px-3 py-2 text-xs flex items-center justify-between text-slate-300">
                  <span className="font-mono font-medium text-sky-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> USER (Analis Operasional)
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                    Locked
                  </span>
                </div>
              </div>

              {/* Security Warning Notice */}
              <div className="bg-amber-950/20 border border-amber-500/30 p-2.5 rounded text-[11px] text-amber-300/90 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong>Protokol Keamanan PUSSIBERAD:</strong> Seluruh akun yang didaftarkan melalui antarmuka ini wajib bertingkat peran <strong>USER</strong>. Hak akses Administrator Inti tidak dapat didelegasikan untuk menjaga integritas komando siber.
                </p>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-4 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-medium cursor-pointer transition-all shadow-sm flex items-center gap-1.5"
                >
                  {isSubmittingUser ? 'Menyimpan...' : 'Daftarkan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DETAIL LENGKAP AUDIT LOG & INPUT PARAMETER
      ========================================================================= */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0D131F] border border-slate-800 rounded-lg max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Detail Rekaman Audit #{selectedLogDetail.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogDetail(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-950/60 border border-slate-800/80 p-3 rounded-md font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Operator</span>
                  <span className="text-slate-200 font-semibold">
                    {selectedLogDetail.operator_username} ({selectedLogDetail.operator_role || 'user'})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Alamat IP</span>
                  <span className="text-slate-200">{selectedLogDetail.ip_address || '127.0.0.1'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Waktu Log</span>
                  <span className="text-slate-200">
                    {new Date(selectedLogDetail.timestamp).toISOString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Status Operasi</span>
                  <span className="text-emerald-400 font-semibold">{selectedLogDetail.status}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase font-mono block mb-1">
                  Parameter Input &amp; Bukti Kriptografis (JSON):
                </span>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-md font-mono text-[11px] text-sky-300 overflow-x-auto max-h-56 leading-relaxed">
                  {JSON.stringify(selectedLogDetail.details || {}, null, 2)}
                </pre>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLogDetail(null)}
                  className="px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
