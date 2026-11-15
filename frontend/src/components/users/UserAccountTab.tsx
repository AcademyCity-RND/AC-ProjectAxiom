import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  User,
  Trash2,
  RefreshCw,
  AlertCircle,
  Search,
  X,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { Pagination } from '../common/Pagination';
import { UserCreateModal } from './UserCreateModal';
import { api } from '../../services/api';
import type { UserAccount } from '../../types';

interface UserAccountTabProps {
  users: UserAccount[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onShowToast: (msg: string) => void;
  onUsersChange: (newUsers: UserAccount[]) => void;
}

export const UserAccountTab: React.FC<UserAccountTabProps> = ({
  users,
  isLoading,
  error,
  onRefresh,
  onShowToast,
  onUsersChange,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<number | null>(null);

  // Search & Pagination states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 8;

  const handleToggleStatus = async (user: UserAccount) => {
    if (user.role === 'admin') {
      alert('Akun Administrator Inti dilindungi dan tidak dapat dinonaktifkan.');
      return;
    }

    setTogglingUserId(user.id);
    try {
      const updated = await api.updateUserStatus(user.id, !user.is_active);
      onUsersChange(
        users.map((u) => (u.id === user.id ? { ...u, is_active: updated.is_active } : u))
      );
      onShowToast(
        `Status akun ${user.username} diubah menjadi: ${updated.is_active ? 'AKTIF' : 'NONAKTIF'}.`
      );
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status akun.');
    } finally {
      setTogglingUserId(null);
    }
  };

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
      onUsersChange(users.filter((u) => u.id !== user.id));
      onShowToast(`Akun pengguna ${user.username} telah dihapus permanen.`);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus akun pengguna.');
    }
  };

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        String(u.id).includes(q)
    );
  }, [users, searchQuery]);

  // Paginated users slice
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  return (
    <div className="space-y-4">
      {/* Metrik Akun Menggunakan Shared StatCard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Akun Pengguna"
          value={users.length}
          subtext="Database PostgreSQL"
        />
        <StatCard
          label="Operator Aktif"
          value={users.filter((u) => u.is_active).length}
          subtext="Izin login diaktifkan"
          colorVariant="emerald"
        />
        <StatCard
          label="Akun Dinonaktifkan"
          value={users.filter((u) => !u.is_active).length}
          subtext="Akses diblokir (403)"
          colorVariant="rose"
        />
        <StatCard
          label="Administrator Inti"
          value={users.filter((u) => u.role === 'admin').length}
          subtext="Satgas PUSSIBERAD Root"
          colorVariant="amber"
        />
      </div>

      {/* Action Bar: Search Input & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg">
        {/* Search Bar User */}
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari username akun atau UID..."
            className="w-full bg-slate-900 border border-slate-800 rounded pl-8 pr-8 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 font-mono shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              title="Bersihkan pencarian"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-medium"
            title="Segarkan data pengguna"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
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
            {searchQuery ? `Hasil: ${filteredUsers.length} dari ${users.length} Akun` : `Total: ${users.length} Akun`}
          </span>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/30 border-b border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
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
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((u) => {
                  const isAdmin = u.role === 'admin';
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors duration-150">
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

                      <td className="py-3 px-4 sm:px-5 text-xs font-mono text-slate-400">
                        {new Date(u.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-4 sm:px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin ? (
                            <span className="text-[11px] text-slate-500 font-mono italic">
                              Akun Terproteksi
                            </span>
                          ) : (
                            <>
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
                    {isLoading
                      ? 'Memuat data akun pengguna...'
                      : searchQuery
                      ? 'Tidak ada akun yang sesuai dengan pencarian.'
                      : 'Belum ada data akun.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginasi Akun Pengguna */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemLabel="akun operator"
        />
      </div>

      <UserCreateModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(newUser) => {
          onUsersChange([newUser, ...users]);
          onShowToast(`Akun pengguna ${newUser.username} (ROLE: USER) berhasil dibuat.`);
        }}
      />
    </div>
  );
};
