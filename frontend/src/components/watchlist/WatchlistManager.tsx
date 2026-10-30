import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Search,
  Filter,
  ExternalLink,
  Play,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  User,
  Tag,
} from 'lucide-react';
import { useCaseStore } from '../../store/useCaseStore';
import { ThreatBadge } from '../common/ThreatBadge';
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

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

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

  // Filter watchlist
  const filteredWatchlist = watchlist.filter((item) => {
    const matchSearch =
      searchQuery === '' ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchTag = selectedTag === 'ALL' || item.tag === selectedTag;
    return matchSearch && matchTag;
  });

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {successToast && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 p-3 rounded text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-sky-400 shrink-0" />
            Daftar Sasaran Pantauan Khusus (Persistent Watchlist)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pengawasan persisten terhadap aktor ancaman siber kognitif, koordinator buzzer, dan operator botnet.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-3.5 py-1.5 rounded text-xs shadow-sm inline-flex items-center gap-1.5 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Target Pantauan
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="cyber-card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800/80 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari target atau catatan intelijen..."
            className="w-full h-8 pl-8 pr-3 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all duration-150"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-1.5 text-xs flex-wrap">
          <span className="text-[11px] text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Tag:
          </span>
          <button
            onClick={() => setSelectedTag('ALL')}
            className={`px-2.5 py-1 rounded text-xs transition-all duration-150 ${
              selectedTag === 'ALL'
                ? 'bg-slate-800 text-sky-400 font-semibold border border-slate-700/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            Semua ({watchlist.length})
          </button>
          <button
            onClick={() => setSelectedTag('suspicious_cib')}
            className={`px-2.5 py-1 rounded text-xs transition-all duration-150 ${
              selectedTag === 'suspicious_cib'
                ? 'bg-amber-950/40 text-amber-400 font-semibold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            Suspicious CIB
          </button>
          <button
            onClick={() => setSelectedTag('propaganda_botnet')}
            className={`px-2.5 py-1 rounded text-xs transition-all duration-150 ${
              selectedTag === 'propaganda_botnet'
                ? 'bg-rose-950/40 text-rose-400 font-semibold border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            Botnet
          </button>
          <button
            onClick={() => setSelectedTag('buzzer_coordinator')}
            className={`px-2.5 py-1 rounded text-xs transition-all duration-150 ${
              selectedTag === 'buzzer_coordinator'
                ? 'bg-purple-950/40 text-purple-400 font-semibold border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            Koordinator
          </button>
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="cyber-card overflow-hidden bg-slate-900 border border-slate-800/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Target / Akun</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Tag Klaster</th>
                <th className="py-3 px-4">Catatan Taktis</th>
                <th className="py-3 px-4">Ditambahkan Oleh</th>
                <th className="py-3 px-4">Waktu Terdaftar</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoadingWatchlist ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-500 font-mono">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat daftar sasaran Watchlist dari PostgreSQL...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredWatchlist.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-semibold text-slate-200">
                        Belum Ada Sasaran di Watchlist
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Sasaran yang mencurigakan dapat dimasukkan ke daftar pantauan untuk audit berkala dan pengawasan persisten.
                      </p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700/80 text-xs px-3.5 py-1.5 rounded shadow-xs transition-all duration-150 ease-out active:scale-[0.98] inline-flex items-center gap-1.5 font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Daftarkan Sasaran Pertama
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWatchlist.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors duration-150">
                    <td className="py-3.5 px-4 font-mono font-medium text-sky-400">
                      {item.username}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs uppercase text-slate-300">
                      {item.platform}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-sky-950/50 text-sky-400 border border-sky-800/40">
                        {item.tag}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300 truncate max-w-[220px]" title={item.notes || ''}>
                      {item.notes || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                      {item.added_by || 'system'}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono tabular-nums text-slate-400">
                      {new Date(item.added_at).toLocaleString('id-ID', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onStartInvestigate(item.username, item.platform as PlatformType)}
                          title="Jalankan Investigasi Ulang Terhadap Target Ini"
                          className="px-2.5 py-1 rounded text-sky-400 hover:text-sky-300 bg-sky-950/30 hover:bg-sky-900/40 border border-sky-800/40 text-xs inline-flex items-center gap-1 transition-all duration-150 active:scale-[0.98]"
                        >
                          <Play className="w-3 h-3 fill-sky-400/20" />
                          <span className="hidden sm:inline font-medium">Investigasi</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.username)}
                          title={confirmDeleteId === item.id ? 'Klik sekali lagi untuk konfirmasi hapus' : 'Hapus dari Watchlist'}
                          className={`p-1.5 rounded text-xs inline-flex items-center gap-1 transition-all duration-150 active:scale-[0.98] border ${
                            confirmDeleteId === item.id
                              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30 px-2.5 font-medium'
                              : 'text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-900/30 border-rose-800/30'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {confirmDeleteId === item.id && <span className="hidden sm:inline font-mono text-[10px]">Konfirmasi?</span>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Sasaran Pantauan */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 w-full max-w-md space-y-4 rounded-lg border border-slate-800/80 shadow-2xl bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-sky-950/60 border border-sky-500/30 text-sky-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold tracking-tight text-white">
                  Tambah Sasaran ke Watchlist
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-950/60 border border-rose-500/40 p-2.5 rounded text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Username Sasaran
                </label>
                <input
                  type="text"
                  required
                  placeholder="@cyber_target atau username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all duration-150"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Platform
                  </label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as PlatformType)}
                    className="w-full h-9 px-2.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all duration-150 cursor-pointer"
                  >
                    <option value="x">X (Twitter)</option>
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Tag Klaster
                  </label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full h-9 px-2.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all duration-150 cursor-pointer"
                  >
                    <option value="suspicious_cib">Suspicious CIB</option>
                    <option value="propaganda_botnet">Propaganda Botnet</option>
                    <option value="buzzer_coordinator">Buzzer Coordinator</option>
                    <option value="targeted_provocation">Targeted Provocation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Catatan Intelijen Taktis (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Catatan latar belakang, relasi sindikat, atau observasi awal..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all duration-150 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-4 py-1.5 rounded text-xs shadow-sm inline-flex items-center gap-1.5 transition-all duration-150 ease-out active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    'Simpan Target'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
