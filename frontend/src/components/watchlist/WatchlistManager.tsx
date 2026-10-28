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
    if (confirm(`Apakah Anda yakin ingin menghapus ${username} dari daftar pantauan?`)) {
      try {
        await deleteFromWatchlist(id);
        setSuccessToast(`Target ${username} telah dihapus dari Watchlist.`);
        setTimeout(() => setSuccessToast(null), 3000);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus target.');
      }
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
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-sky-400" />
            Daftar Sasaran Pantauan Khusus (Persistent Watchlist)
          </h2>
          <p className="text-xs text-slate-400">
            Pengawasan persisten terhadap aktor ancaman siber kognitif, koordinator buzzer, dan operator botnet.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#38BDF8] text-slate-950 hover:bg-[#38BDF8]/90 font-medium px-3.5 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors duration-120 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Target Pantauan
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="cyber-card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari target atau catatan intelijen..."
            className="w-full h-8 pl-8 pr-3 bg-[#090D16] border border-[#1E293B] rounded text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-1 text-xs">
          <span className="text-[11px] text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Tag:
          </span>
          <button
            onClick={() => setSelectedTag('ALL')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedTag === 'ALL'
                ? 'bg-[#1E293B] text-sky-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua ({watchlist.length})
          </button>
          <button
            onClick={() => setSelectedTag('suspicious_cib')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedTag === 'suspicious_cib'
                ? 'bg-amber-950/40 text-amber-400 font-semibold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Suspicious CIB
          </button>
          <button
            onClick={() => setSelectedTag('propaganda_botnet')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedTag === 'propaganda_botnet'
                ? 'bg-rose-950/40 text-rose-400 font-semibold border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Botnet
          </button>
          <button
            onClick={() => setSelectedTag('buzzer_coordinator')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedTag === 'buzzer_coordinator'
                ? 'bg-purple-950/40 text-purple-400 font-semibold border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Koordinator
          </button>
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="cyber-card overflow-hidden">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[#131C2E] border-b border-[#1E293B] text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">
            <tr>
              <th className="py-2.5 px-3">Target / Akun</th>
              <th className="py-2.5 px-3">Platform</th>
              <th className="py-2.5 px-3">Tag Klaster</th>
              <th className="py-2.5 px-3">Catatan Taktis</th>
              <th className="py-2.5 px-3">Ditambahkan Oleh</th>
              <th className="py-2.5 px-3">Waktu Terdaftar</th>
              <th className="py-2.5 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {isLoadingWatchlist ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-slate-500 font-mono">
                  Memuat daftar sasaran Watchlist dari PostgreSQL...
                </td>
              </tr>
            ) : filteredWatchlist.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="max-w-md mx-auto space-y-3">
                    <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto" />
                    <div className="text-sm font-semibold text-slate-300">
                      Belum Ada Sasaran di Watchlist
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      Sasaran yang mencurigakan dapat dimasukkan ke daftar pantauan untuk audit berkala dan pengawasan persisten.
                    </p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="border border-[#1E293B] bg-[#0F172A] hover:bg-[#1E293B] text-sky-400 text-xs px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Daftarkan Sasaran Pertama
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredWatchlist.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-sky-400">
                    {item.username}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs uppercase text-slate-300">
                    {item.platform}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-sky-950/50 text-sky-400 border border-sky-800/40">
                      {item.tag}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-300 truncate max-w-[200px]" title={item.notes || ''}>
                    {item.notes || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-xs font-mono text-slate-400">
                    {item.added_by || 'system'}
                  </td>
                  <td className="py-2.5 px-3 text-xs font-mono text-slate-500">
                    {new Date(item.added_at).toLocaleString('id-ID', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onStartInvestigate(item.username, item.platform as PlatformType)}
                        title="Jalankan Investigasi Ulang Terhadap Target Ini"
                        className="p-1.5 rounded text-sky-400 hover:bg-sky-950/40 border border-sky-800/30 text-xs inline-flex items-center gap-1 transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        <span className="hidden sm:inline">Investigasi</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.username)}
                        title="Hapus dari Watchlist"
                        className="p-1.5 rounded text-rose-400 hover:bg-rose-950/40 border border-rose-800/30 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Sasaran Pantauan */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cyber-card p-6 w-full max-w-md space-y-4 border border-[#1E293B] shadow-2xl bg-[#0F172A] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-white">
                  Tambah Sasaran ke Watchlist
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
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

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B] mb-1">
                  Username Sasaran
                </label>
                <input
                  type="text"
                  required
                  placeholder="@cyber_target atau username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full h-9 px-3 bg-[#090D16] border border-[#1E293B] rounded text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B] mb-1">
                    Platform
                  </label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as PlatformType)}
                    className="w-full h-9 px-2 bg-[#090D16] border border-[#1E293B] rounded text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                  >
                    <option value="x">X (Twitter)</option>
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B] mb-1">
                    Tag Klaster
                  </label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full h-9 px-2 bg-[#090D16] border border-[#1E293B] rounded text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                  >
                    <option value="suspicious_cib">Suspicious CIB</option>
                    <option value="propaganda_botnet">Propaganda Botnet</option>
                    <option value="buzzer_coordinator">Buzzer Coordinator</option>
                    <option value="targeted_provocation">Targeted Provocation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B] mb-1">
                  Catatan Intelijen Taktis (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Catatan latar belakang, relasi sindikat, atau observasi awal..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#090D16] border border-[#1E293B] rounded text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-400 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
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
                  className="bg-[#38BDF8] text-slate-950 hover:bg-[#38BDF8]/90 font-medium px-4 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
