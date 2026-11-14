import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Bagaimana Project Axiom mendeteksi bot dan buzzer terkoordinasi?',
    answer:
      'Project Axiom menggunakan model machine learning XGBoost terkalibrasi yang mengevaluasi 21 parameter perilaku kognitif (bukan sekadar filter kata kunci). Parameter ini mencakup indeks burstiness lonjakan aktivitas mendadak, entropi temporal siklus biologis 24/7, rasio sebar-ulang (retweet), serta kemiripan vektor teks semantik copypasta (cosine similarity) untuk membongkar jaringan astroturfing yang terorganisir.',
  },
  {
    id: 'faq-2',
    question: 'Apakah pemanenan data dan analisis ini legal secara hukum?',
    answer:
      'Ya, 100% legal dan beretika. Seluruh data dipanen secara pasif menggunakan teknik Open Source Intelligence (OSINT) dari postingan yang telah dipublikasikan secara terbuka oleh pengguna di internet. Sistem tidak melakukan peretasan, bypass sandi privat, atau intersepsi pesan pribadi, serta patuh terhadap Undang-Undang Perlindungan Data Pribadi (UU No. 27 Tahun 2022).',
  },
  {
    id: 'faq-3',
    question: 'Apa perbedaan antara Mode Guest (Publik) dan Konsol Staf (Internal)?',
    answer:
      'Mode Guest menyediakan audit cepat instan untuk satu akun atau satu cuitan X dengan ringkasan klasifikasi AI dan 3 alasan utama XAI. Sementara itu, Konsol Staf internal PUSSIBERAD menyediakan akses ke graf jejaring interaktif (Social Network Analysis / SNA), matriks heatmap sirkadian 24/7, audit massal ratusan komentator, pelacak watchlist terorganisir, dan ekspor resmi dossier berkas A4 siap cetak.',
  },
  {
    id: 'faq-4',
    question: 'Bagaimana sistem membedakan antara bot otomatis dan buzzer manusia?',
    answer:
      'Bot otomasi skrip memperlihatkan pola jeda sub-detik yang sangat kaku, entropi jam aktif mendekati nol (beroperasi 24 jam nonstop secara mekanis), dan rasio angka acak tinggi pada username. Sebaliknya, buzzer (manusia) biasanya beroperasi dalam shift kelompok, memperlihatkan lonjakan bersamaan pada jam-jam kampanye tertentu dengan variasi teks parafrase yang terkoordinasi.',
  },
  {
    id: 'faq-5',
    question: 'Apakah hasil analisis dapat dijadikan bukti forensik digital?',
    answer:
      'Ya. Setiap investigasi yang diselesaikan dienkripsi dan dicatat ke dalam log audit dengan hash kriptografis SHA-256. Hal ini menjaga integritas rantai bukti (chain of custody) agar bukti temporal jam postingan dan transkrip konten tidak dapat diubah atau disangkal setelah proses ekstraksi selesai.',
  },
  {
    id: 'faq-6',
    question: 'Mengapa fitur Guest Demo saat ini difokuskan pada platform X (Twitter)?',
    answer:
      'Platform X merupakan medan utama operasi pembentukan opini publik real-time (CIB). Untuk menjaga stabilitas server publik, analisis multi-platform bervolume raksasa (seperti ribuan komentar video YouTube atau postingan visual Instagram) dialokasikan khusus pada node komputasi berkecepatan tinggi di Konsol Staf internal.',
  },
];

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="relative min-h-screen py-24 px-4 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-sky-400 mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Pertanyaan Umum &amp; Metodologi</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Frequently Asked Questions (FAQ)
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Pelajari lebih dalam mengenai metodologi kecerdasan buatan, kepatuhan etika hukum OSINT,
            dan kapabilitas analisis ancaman kognitif Project Axiom.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-slate-900/90 border-sky-500/40 shadow-lg shadow-sky-500/5'
                    : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700/80'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-sm sm:text-base text-slate-100 pr-2">
                    {item.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'bg-sky-500/20 text-sky-400 rotate-180'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-4 animate-in fade-in duration-200">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
