import React from 'react';

interface DialogProps { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode; }
export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => onOpenChange?.(false)}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
export function DialogContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl mx-4 ${className}`}>{children}</div>;
}
export function DialogHeader({ children }: { children: React.ReactNode }) { return <div className="mb-4">{children}</div>; }
export function DialogTitle({ children }: { children: React.ReactNode }) { return <h2 className="text-lg font-semibold">{children}</h2>; }
export function DialogDescription({ children }: { children: React.ReactNode }) { return <p className="text-sm text-gray-500 mt-1">{children}</p>; }
export function DialogFooter({ children }: { children: React.ReactNode }) { return <div className="flex gap-3 justify-end mt-6">{children}</div>; }
export function DialogTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) { return <>{children}</>; }
export function DialogClose({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">{children}</button>;
}
