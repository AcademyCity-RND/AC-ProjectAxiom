import React, { useState } from 'react';
import { UserPlus, User, Lock, ShieldAlert, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import type { UserAccount } from '../../types';

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
}

export const UserCreateModal: React.FC<UserCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser || cleanUser.length < 3) {
      setFormError('Username minimal 3 karakter alfanumerik.');
      return;
    }

    if (!password || password.length < 6) {
      setFormError('Kata sandi minimal 6 karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createUser({
        username: cleanUser,
        password,
      });
      onSuccess(created);
      setUsername('');
      setPassword('');
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Gagal membuat akun pengguna baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Akun Operator Baru"
      subtitle="Registrasi analis intelijen kognitif"
      icon={<UserPlus className="w-4 h-4" />}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Username Operator</span>
            <span className="text-[10px] text-slate-500 font-mono">Huruf/angka/underscore</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="contoh: analis_02"
            required
            minLength={3}
            maxLength={50}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/60 font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Kata Sandi Awal</span>
            <span className="text-[10px] text-slate-500 font-mono">Minimal 6 karakter</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/60 font-mono"
          />
        </div>

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

        <div className="bg-amber-950/20 border border-amber-500/30 p-2.5 rounded text-[11px] text-amber-300/90 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Protokol Keamanan PUSSIBERAD:</strong> Seluruh akun yang didaftarkan melalui antarmuka ini wajib bertingkat peran <strong>USER</strong>. Hak akses Administrator Inti tidak dapat didelegasikan untuk menjaga integritas komando siber.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-medium cursor-pointer transition-all shadow-sm flex items-center gap-1.5"
          >
            {isSubmitting ? 'Menyimpan...' : 'Daftarkan Akun'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
