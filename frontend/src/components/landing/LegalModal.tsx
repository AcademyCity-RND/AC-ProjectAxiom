import React, { useEffect } from 'react';
import { X, Shield, FileText, Lock, CheckCircle2 } from 'lucide-react';

export type LegalModalType = 'privacy' | 'terms' | null;

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
  onSwitchType: (type: 'privacy' | 'terms') => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose, onSwitchType }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (type) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [type, onClose]);

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip with Tabs */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSwitchType('privacy')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                type === 'privacy'
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Kebijakan Privasi (Privacy Policy)</span>
            </button>

            <button
              onClick={() => onSwitchType('terms')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                type === 'terms'
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Syarat &amp; Ketentuan (Terms of Service)</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup dialog"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
          {type === 'privacy' ? (
            <>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] mb-2">
                  <CheckCircle2 className="w-3 h-3" /> Kepatuhan UU Perlindungan Data Pribadi (UU PDP)
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Kebijakan Privasi (Privacy Policy) Project Axiom
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Terakhir diperbarui: 13 November 2026 • Versi Operasional 1.0.0
                </p>
              </div>

              <section className="space-y-2">
                <h4 className="font-semibold text-white text-sm">
                  1. Prinsip Pengumpulan Intelijen Sumber Terbuka (OSINT)
                </h4>
                <p className="text-xs sm:text-sm text-slate-400">
                  Project Axiom beroperasi secara murni berdasarkan data publik yang telah disebarluaskan secara sukarela oleh pengguna di platform media sosial terbuka (seperti X/Twitter). Sistem kami tidak pernah mengakses akun privat, membobol sandi, melakukan intersepsi lalu lintas privat, maupun menembus enkripsi kanal pesan langsung (DM).
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-white text-sm">
                  2. Jenis Informasi yang Dianalisis
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-400">
                  <li>Metadata profil publik: Nama tampilan, handle pengguna, waktu pembuatan akun, serta jumlah pengikut/mengikuti.</li>
                  <li>Metadata postingan publik: Timestamp cuitan (untuk ritme sirkadian 24/7), frekuensi retweet/kutipan, dan teks cuitan terbuka.</li>
                  <li>Ekstraksi 21 fitur statistik perilaku matematis tanpa menyimpan informasi biometrik maupun kontak pribadi.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-white text-sm">
                  3. Non-Penyimpanan Informasi Pribadi Pengunjung (Guest Mode)
                </h4>
                <p className="text-xs sm:text-sm text-slate-400">
                  Pada fitur uji coba Guest Demo Sandbox, sistem tidak mengumpulkan, melacak, maupun membagikan alamat IP pengunjung atau kata kunci pencarian Anda kepada pihak ketiga untuk kepentingan komersial atau periklanan.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-white text-sm">
                  4. Integritas Keamanan dan Bukti Forensik
                </h4>
                <p className="text-xs sm:text-sm text-slate-400">
                  Setiap berkas audit forensik yang dihasilkan dienkripsi dengan standar hash SHA-256 untuk menjaga integritas rantai bukti (*chain of custody*). Sesi otentikasi internal staf satgas diproteksi protokol JWT Bearer dan TLS 1.3 berstandar militer.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-white text-sm">
                  5. Hak Koreksi &amp; Hubungan Kepatuhan
                </h4>
                <p className="text-xs sm:text-sm text-slate-400">
                  Jika terdapat entitas publik yang menduga adanya ketidaksesuaian klasifikasi akun, Anda dapat menghubungi divisi forensik siber AcademyCity-RND atau Satgas PUSSIBERAD untuk permohonan audit ulang data secara transparan.
                </p>
              </section>
            </>
          ) : (
            <>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono text-[11px] mb-2">
                  <Shield className="w-3 h-3" /> Tata Kelola Operasional &amp; Lisensi
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Syarat &amp; Ketentuan Layanan (Terms of Service)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Berlaku efektif sejak: 13 November 2026 • PUSSIBERAD &amp; AcademyCity-RND
                </p>
              </div>

              <section className="space-y-2">
                <h4 className="font-semibold text-white text-sm">
                  1. Penerimaan Ketentuan
                </h4>
                <p className="text-xs sm:text-sm text-slate-400">
                  Dengan mengakses atau menggunakan platform Project Axiom (baik melalui Guest Mode publik maupun Konsol Staf terotorisasi), Anda setuju untuk terikat secara sah oleh Syarat dan Ketentuan ini serta seluruh peraturan perundang-undangan digital yang berlaku di Republik Indonesia.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-white text-sm">
                  2. Larangan Penyalahgunaan (Anti-Doxxing &amp; Anti-Persekusi)
                </h4>
                <p className="text-xs sm:text-sm text-slate-400">
                  Platform Project Axiom dikembangkan semata-mata untuk tujuan riset domain kognitif, verifikasi fakta, serta pertahanan ruang siber terhadap manipulasi opini terkoordinasi (CIB). Anda secara tegas dilarang:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-400">
                  <li>Menggunakan hasil analisis untuk melakukan persekusi, intimidasi, pelecehan, atau *doxxing* terhadap individu mana pun.</li>
                  <li>Melakukan scraping agresif atau serangan *Denial of Service (DoS)* terhadap API dan infrastruktur Project Axiom.</li>
                  <li>Mencoba merekayasa balik (*reverse engineering*) algoritma tertutup atau memalsukan identitas token otentikasi militer.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-white text-sm">
                  3. Batasan Sifat Probabilistik Model AI
                </h4>
                <p className="text-xs sm:text-sm text-slate-400">
                  Inferensi klasifikasi akun (Human, Bot, Buzzer) dihasilkan oleh model machine learning terlatih berbasis distribusi statistik perilaku empiris. Skor keyakinan persentase merupakan estimasi probabilitas algoritmik dan wajib diverifikasi oleh analis siber manusia sebelum diambil tindakan hukum resmi.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-white text-sm">
                  4. Hak Kekayaan Intelektual &amp; Lisensi
                </h4>
                <p className="text-xs sm:text-sm text-slate-400">
                  Seluruh arsitektur kode, visualisasi graf jejaring, dan laporan dossier merupakan hak cipta bersama Satgas Operasi Siber PUSSIBERAD dan tim riset AcademyCity-RND. Kode sumber terbuka tunduk pada ketentuan lisensi repositori resmi di GitHub.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-white text-sm">
                  5. Perubahan Ketentuan Operasional
                </h4>
                <p className="text-xs sm:text-sm text-slate-400">
                  Pengembang berhak memperbarui dan menyelaraskan syarat ketentuan ini sewaktu-waktu guna merespons perkembangan ancaman siber kognitif dan pembaharuan regulasi hukum nasional.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <div className="text-xs text-slate-500 font-mono">
            PUSSIBERAD Digital Legal Ethics Framework
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
