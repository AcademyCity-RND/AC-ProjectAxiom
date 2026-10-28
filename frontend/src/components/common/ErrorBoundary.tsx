import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex items-center justify-center p-6">
          <div className="cyber-card p-6 max-w-md w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-semibold text-white">
                Terjadi Anomali Sistem Tampilan
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Antarmuka mendeteksi error pada komponen. Silakan muat ulang halaman untuk menyegarkan state.
              </p>
            </div>

            {this.state.error && (
              <pre className="p-3 bg-[#090D16] border border-[#1E293B] rounded text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#38BDF8] text-slate-950 hover:bg-[#38BDF8]/90 font-medium py-2 rounded text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Muat Ulang Antarmuka
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
