import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  itemLabel?: string;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = 'data',
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems <= pageSize) {
    return null;
  }

  return (
    <div
      className={`px-4 sm:px-5 py-3 border-t border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400 ${className}`}
    >
      <div>
        Menampilkan{' '}
        <span className="text-white font-medium font-mono">{startItem}</span> -{' '}
        <span className="text-white font-medium font-mono">{endItem}</span> dari{' '}
        <span className="text-white font-medium font-mono">{totalItems}</span> {itemLabel}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-2.5 py-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
        >
          &larr; Sebelumnya
        </button>
        <span className="px-2 text-slate-400 font-mono text-xs">
          Halaman {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
        >
          Selanjutnya &rarr;
        </button>
      </div>
    </div>
  );
};
