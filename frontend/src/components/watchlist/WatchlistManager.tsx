import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  ExternalLink,
  Play,
  ShieldAlert,
  AlertCircle,
  Tag,
  Clock,
  User,
  CheckCircle2,
} from 'lucide-react';
import { useCaseStore } from '../../store/useCaseStore';
import { ThreatBadge } from '../common/ThreatBadge';
import { PlatformIcon } from '../common/PlatformIcon';
import { Modal } from '../common/Modal';
import type { PlatformType } from '../../types';

interface WatchlistManagerProps {
  onStartInvestigate: (target: string, platform: PlatformType) => void;
}

export const WatchlistManager: React.FC<WatchlistManagerProps> = ({ onStartInvestigate }) => {
  const { watchlist, isLoadingWatchlist, loadWatchlist, addToWatchlist, deleteFromWatchlist } =
    useCaseStore();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Form states
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPlatform, setNewPlatform] = useState<PlatformType>('x');
  const [newTag, setNewTag] = useState<string>('suspicious_cib');
  const [newNotes, setNewNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanUser = newUsername.trim();
    if (!cleanUser) {
      setFormError('Username sasaran wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addToWatchlist({
        username: cleanUser,
        platform: newPlatform,
        tag: newTag,
        notes: newNotes.trim() || undefined,
      });

      setSuccessToast(`Target ${cleanUser} berhasil ditambahkan ke Watchlist.`);
      setShowAddModal(false);
      setNewUsername('');
      setNewNotes('');
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      setFormError(err.message || 'Gagal menambahkan target ke Watchlist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 4000);
      return;
    }
    setConfirmDeleteId(null);
    try {
      await deleteFromWatchlist(id);
      setSuccessToast(`Target ${username} telah dihapus dari Watchlist.`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus target.');
    }
  };

  // Filter daftar watchlist
  const filteredWatchlist = watchlist.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag === 'ALL' || item.tag === selectedTag;

    return matchesSearch && matchesTag;
  });

  const getTagBadgeClass = (tag: string) => {
    switch (tag) {
      case 'propaganda_botnet':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
      case 'buzzer_coordinator':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'amplification_node':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/25';
      default:
        return 'bg-sky-500/10 text-sky-400 border-sky-500/25';
    }
  };

  const getTagLabel = (tag: string) => {
    switch (tag) {
      case 'propaganda_botnet':
        return 'Botnet Propaganda';
      case 'buzzer_coordinator':
        return 'Koordinator Buzzer';
      case 'amplification_node':
        return 'Node Amplifikasi';
      case 'suspicious_cib':
        return 'Indikasi CIB';
      default:
        return tag;
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notifikasi */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-emerald-500/40 text-emerald-300 rounded-lg shadow-xl font-mono text-xs animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari target atau catatan..."
              className="w-full bg-slate-900 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              aria-label="Filter Kategori Watchlist"
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500/50 font-mono cursor-pointer"
            >
              <option value="ALL">Semua Kategori ({watchlist.length})</option>
              <option value="propaganda_botnet">Botnet Propaganda</option>
              <option value="buzzer_coordinator">Koordinator Buzzer</option>
              <option value="amplification_node">Node Amplifikasi</option>
              <option value="suspicious_cib">Indikasi CIB</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-3.5 py-1.5 rounded-md text-xs flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98] shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Target Baru</span>
        </button>
      </div>

      {/* Tabel Watchlist */}
      <div className="cyber-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/70">
          <div className="text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400">
            INVENTARISASI PENGAWASAN AKTIF (WATCHLIST)
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-400">
            {filteredWatchlist.length} Sasaran Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-slate-800/80 text-[10px] font-semibold uppercase tracking-wider font-mono text-slate-400 bg-slate-950/40">
              <tr>
                <th className="py-3 px-3.5 sm:px-5">Akun Target</th>
                <th className="py-3 px-3.5 sm:px-5">Platform</th>
                <th className="py-3 px-3.5 sm:px-5">Kategori Ancaman</th>
                <th className="py-3 px-3.5 sm:px-5">Catatan Operasional</th>
                <th className="py-3 px-3.5 sm:px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredWatchlist.length > 0 ? (
                filteredWatchlist.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3.5 sm:px-5 font-mono font-medium text-sky-400">
                      <span className="truncate block max-w-xs">{item.username}</span>
                      <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                        Ditambahkan {new Date(item.added_at).toLocaleDateString('id-ID')}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 sm:px-5 font-mono text-xs uppercase text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <PlatformIcon
                          platform={item.platform}
                          className={`w-3.5 h-3.5 ${
                            item.platform === 'youtube'
                              ? 'text-rose-400'
                              : item.platform === 'instagram'
                              ? 'text-amber-400'
                              : 'text-sky-400'
                          }`}
                        />
                        <span>{item.platform}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3.5 sm:px-5">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getTagBadgeClass(
                          item.tag
                        )}`}
                      >
                        {getTagLabel(item.tag)}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 sm:px-5 text-xs text-slate-300 max-w-xs truncate">
                      {item.notes || '-'}
                    </td>
                    <td className="py-3 px-3.5 sm:px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onStartInvestigate(item.username, item.platform as PlatformType)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-400 text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
                          title="Jalankan Audit Kasus Langsung"
                        >
                          <Play className="w-3 h-3" />
                          <span>Audit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.username)}
                          className={`p-1.5 rounded transition-all cursor-pointer ${
                            confirmDeleteId === item.id
                              ? 'bg-rose-600 text-white animate-pulse'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40'
                          }`}
                          title={
                            confirmDeleteId === item.id
                              ? 'Klik sekali lagi untuk konfirmasi hapus'
                              : 'Hapus dari Watchlist'
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-500 font-mono">
                    {isLoadingWatchlist ? 'Memuat data watchlist...' : 'Belum ada target dalam watchlist.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Watchlist Baru Menggunakan Shared Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Target ke Watchlist"
        subtitle="Registrasi akun sasaran pemantauan siber kognitif"
        icon={<ShieldAlert className="w-4 h-4" />}
        maxWidth="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target (@Username / ID)</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="contoh: @buzzer_agitator"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Platform</label>
              <select
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value as PlatformType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500 font-mono cursor-pointer"
              >
                <option value="x">X / Twitter</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Kategori Tag</label>
              <select
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500 font-mono cursor-pointer"
              >
                <option value="suspicious_cib">Indikasi CIB</option>
                <option value="propaganda_botnet">Botnet Propaganda</option>
                <option value="buzzer_coordinator">Koordinator Buzzer</option>
                <option value="amplification_node">Node Amplifikasi</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Catatan Investigasi (Opsional)</label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Catatan analisis, waktu operasi, atau indikasi afiliasi..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 font-sans"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-medium cursor-pointer"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Target'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
