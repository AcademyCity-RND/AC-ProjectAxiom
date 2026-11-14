import React from 'react';
import { Users, ExternalLink, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { GithubIcon } from '../common/GithubIcon';

interface TeamMember {
  name: string;
  role: string;
  accounts: {
    username: string;
    label?: string;
    url: string;
    avatarUrl: string;
  }[];
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Hilarius Christiano Avin Paliling',
    role: 'System Architect, AI Engineer, & Web Developer',
    accounts: [
      {
        username: 'Avin1731',
        label: 'Avin1731',
        url: 'https://github.com/Avin1731',
        avatarUrl: 'https://github.com/Avin1731.png',
      },
      {
        username: 'Xte-1412',
        label: 'Xte-1412',
        url: 'https://github.com/Xte-1412',
        avatarUrl: 'https://github.com/Xte-1412.png',
      },
    ],
  },
  {
    name: 'Ahsani Fadhli Ilahi',
    role: 'QA Engineer, Debugger, & Functional Tester',
    accounts: [
      {
        username: 'Ahsanifadhli',
        label: 'Ahsanifadhli',
        url: 'https://github.com/Ahsanifadhli',
        avatarUrl: 'https://github.com/Ahsanifadhli.png',
      },
    ],
  },
];

export const TeamSection: React.FC = () => {
  return (
    <section id="team" className="relative min-h-screen py-24 px-4 flex flex-col justify-center">
      <div className="max-w-5xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-sky-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Laboratorium Riset &amp; Eksperimen Terbuka</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100 flex items-center justify-center gap-2">
            <span>Tim Pengembang (Development Team)</span>
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Arsitektur, model analitik, dan sistem Project Axiom dikembangkan dan diuji secara
            kolaboratif sebagai bagian dari inisiatif riset di bawah naungan AcademyCity-RND.
          </p>
        </div>

        {/* Organization Banner Card (AcademyCity-RND) */}
        <div className="mb-10 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 backdrop-blur-md">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="relative group">
              <img
                src="https://github.com/AcademyCity-RND.png"
                alt="AcademyCity-RND Organization Logo"
                className="w-16 h-16 rounded-xl object-cover border border-slate-700 shadow-md group-hover:border-sky-400 transition-colors"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  AcademyCity-RND
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  R&amp;D Hub &amp; Lab
                </span>
              </div>
              <p className="text-xs text-sky-400/90 font-mono mt-1 italic">
                &ldquo;Exploring the frontiers of Artificial Intelligence, Next-Gen Web Engineering, and Automated Systems.&rdquo;
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Laboratorium eksperimental dan showcase proyek riset mandiri yang berfokus pada AI/NLP pipelines, arsitektur perangkat lunak berkinerja tinggi, sistem automasi, serta rekayasa web modern.
              </p>
            </div>
          </div>

          <a
            href="https://github.com/AcademyCity-RND"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white text-xs font-medium transition-all flex items-center gap-2 shrink-0 shadow-sm"
          >
            <GithubIcon className="w-4 h-4 text-white" />
            <span>Kunjungi Organisasi</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>

        {/* Team Table (Desktop & Tablet) */}
        <div className="hidden sm:block overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Anggota Tim</th>
                <th className="py-4 px-6">Peran &amp; Tanggung Jawab</th>
                <th className="py-4 px-6 text-center">Profil GitHub</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {TEAM_MEMBERS.map((member, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-800/30 transition-colors group"
                >
                  {/* Name Column */}
                  <td className="py-5 px-6 font-semibold text-slate-100">
                    <div className="text-base text-slate-100 font-bold">{member.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Core Contributor • AcademyCity-RND
                    </div>
                  </td>

                  {/* Role Column */}
                  <td className="py-5 px-6">
                    <div className="text-xs sm:text-sm text-sky-300 font-medium font-mono leading-relaxed">
                      {member.role}
                    </div>
                  </td>

                  {/* GitHub Profile Column with real-time avatars & buttons */}
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                      {member.accounts.map((acc, aIdx) => (
                        <div key={aIdx} className="flex flex-col items-center gap-1.5">
                          <a
                            href={acc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative group/avatar block"
                            title={`Buka profil GitHub @${acc.username}`}
                          >
                            <img
                              src={acc.avatarUrl}
                              alt={acc.username}
                              className="w-12 h-12 rounded-xl object-cover border-2 border-slate-700/80 group-hover/avatar:border-sky-400 shadow-md group-hover/avatar:scale-105 transition-all duration-200"
                            />
                            <div className="absolute inset-0 rounded-xl bg-sky-500/10 opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none" />
                          </a>

                          <a
                            href={acc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
                          >
                            <GithubIcon className="w-3.5 h-3.5 text-slate-300" />
                            <span>@{acc.username}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards */}
        <div className="sm:hidden space-y-4">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
            >
              <div>
                <h4 className="font-bold text-base text-slate-100">{member.name}</h4>
                <div className="text-xs text-sky-400 font-mono mt-1">{member.role}</div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-start gap-4">
                {member.accounts.map((acc, aIdx) => (
                  <div key={aIdx} className="flex items-center gap-3">
                    <img
                      src={acc.avatarUrl}
                      alt={acc.username}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                    />
                    <a
                      href={acc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 hover:text-sky-400"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      <span>@{acc.username}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
