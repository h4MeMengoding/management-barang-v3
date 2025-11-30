'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Check } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

interface LockerCardProps {
  id: string; // UUID from database
  name?: string;
  code?: string;
  itemCount?: number;
  status?: 'terisi' | 'kosong';
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export default function LockerCard({ 
  id, 
  name: propName, 
  code: propCode, 
  itemCount: propCount, 
  status: propStatus,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
}: LockerCardProps) {
  const [name, setName] = useState<string | undefined>(propName);
  const [code, setCode] = useState<string | undefined>(propCode);
  const [itemCount, setItemCount] = useState<number | undefined>(propCount);
  const [status, setStatus] = useState<'terisi' | 'kosong'>(propStatus ?? 'kosong');

  useEffect(() => {
    // If all data provided, nothing to fetch
    if (propName && propCode && propCount !== undefined) return;

    const load = async () => {
      try {
        // Fetch locker details if name/code missing
        if (!propName || !propCode) {
          const res = await fetch(`/api/lockers?id=${id}`);
          const data = await res.json();
          if (res.ok && data.locker) {
            setName(data.locker.name ?? propName);
            setCode(data.locker.code ?? propCode);
          }
        }

        // Fetch items count if missing
        if (propCount === undefined) {
          const user = getCurrentUser();
          const userIdQuery = user ? `&userId=${user.id}` : '';
          const res2 = await fetch(`/api/items?lockerId=${id}${userIdQuery}`);
          const data2 = await res2.json();
          if (res2.ok) {
            const items = data2.items || [];
            setItemCount(items.length);
            setStatus(items.length > 0 ? 'terisi' : 'kosong');
          }
        } else {
          setStatus(propCount > 0 ? 'terisi' : 'kosong');
        }
      } catch (err) {
        console.error('Error loading locker card data:', err);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const statusColor = status === 'terisi' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'bg-[var(--surface-2)] text-[var(--text-secondary)]';
  const statusText = status === 'terisi' ? 'Terisi' : 'Kosong';

  const handleClick = (e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.preventDefault();
      onToggleSelect?.();
    }
  };

  const cardContent = (
    <div 
      className={`bg-[var(--surface-1)] rounded-xl shadow-sm border transition-all ${
        isSelectionMode 
          ? `p-3 ${isSelected
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
            : 'border-[var(--border)] hover:border-[var(--color-primary)]/50'}`
          : 'p-4 lg:p-5 border-[var(--border)] hover:shadow-md hover:border-[var(--color-primary)]/30 cursor-pointer'
      }`}
      onClick={handleClick}
    >
      {isSelectionMode ? (
        // Selection Mode Layout - More compact
        <div className="space-y-3">
          {/* Checkbox at top */}
          <div className="flex items-center justify-between">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
              isSelected 
                ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' 
                : 'border-[var(--border)] hover:border-[var(--color-primary)]'
            }`}>
              {isSelected && <Check size={14} className="text-white" />}
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusColor}`}>
              {statusText}
            </span>
          </div>
          
          {/* Content below */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
              <Package size={20} className="text-[var(--color-primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">{name ?? 'Loading...'}</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Kode: {code ?? '—'}</p>
              <p className="text-xs text-[var(--text-primary)] mt-1 font-medium">{(itemCount !== undefined) ? `${itemCount} Barang` : 'Memuat...'}</p>
            </div>
          </div>
        </div>
      ) : (
        // Normal Mode Layout
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
              <Package size={24} className="text-[var(--color-primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base lg:text-lg font-semibold text-[var(--text-primary)] truncate">{name ?? 'Loading...'}</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">Kode: {code ?? '—'}</p>
              <p className="text-sm text-[var(--text-primary)] mt-1.5 font-medium">{(itemCount !== undefined) ? `${itemCount} Barang` : 'Memuat...'}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColor}`}>
            {statusText}
          </span>
        </div>
      )}
    </div>
  );

  if (isSelectionMode) {
    return cardContent;
  }

  return (
    <Link href={`/locker/${id}`}>
      {cardContent}
    </Link>
  );
}
