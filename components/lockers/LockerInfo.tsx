import { Download, Edit2, Trash2, QrCode } from 'lucide-react';
import { Locker } from '@/lib/hooks/useLockerDetail';

interface LockerInfoProps {
  locker: Locker;
  itemCount: number;
  status: string;
  onEdit: () => void;
  onDelete: () => void;
  onDownloadQR: () => void;
}

export default function LockerInfo({
  locker,
  itemCount,
  status,
  onEdit,
  onDelete,
  onDownloadQR,
}: LockerInfoProps) {
  return (
    <>
      {/* QR Code Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="bg-white dark:bg-[var(--surface-2)] border-2 border-[var(--border)] rounded-xl p-5">
          {locker.qrCodeUrl ? (
            <img 
              src={locker.qrCodeUrl} 
              alt={`QR Code ${locker.code}`}
              className="w-48 h-48 rounded-lg"
            />
          ) : (
            <div className="w-48 h-48 bg-[var(--surface-2)] rounded-lg flex items-center justify-center">
              <QrCode size={120} className="text-[var(--text-tertiary)]" />
            </div>
          )}
        </div>
        <button
          onClick={onDownloadQR}
          disabled={!locker.qrCodeUrl}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--surface-3)] hover:bg-[var(--text-tertiary)] text-[var(--text-primary)] font-semibold rounded-lg transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          Download QR
        </button>
      </div>

      {/* Locker Info */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{locker.name}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Kode: <span className="font-semibold text-[var(--text-primary)]">{locker.code}</span>
          </p>
        </div>

        {locker.description && (
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed pb-4 border-b border-[var(--divider)]">
            {locker.description}
          </p>
        )}
        
        <div className="space-y-3 pb-4 border-b border-[var(--divider)]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Status:</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status === 'terisi' ? 'bg-[var(--color-primary)]' : 'bg-[var(--text-tertiary)]'}`}></div>
              <span className="text-sm font-semibold text-[var(--text-primary)] capitalize">{status}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Total Barang:</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">{itemCount}</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Edit2 size={18} />
            Edit Loker
          </button>
          <button
            onClick={onDelete}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Trash2 size={18} />
            Hapus Loker
          </button>
        </div>
      </div>
    </>
  );
}
