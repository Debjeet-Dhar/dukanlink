import { useState, useRef, useEffect } from 'react';

export function FloatingInput({ label, value, onChange, type = 'text', error, prefix }) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value.length > 0;

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-sm font-medium z-10">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`input-field ${error ? 'input-field-error' : ''} ${prefix ? 'pl-[88px]' : ''}`}
      />
      <label className={`floating-label ${prefix ? 'left-[88px]' : ''} ${isActive ? 'floating-label-active' : ''}`}>
        {label}
      </label>
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

export function FloatingTextarea({ label, value, onChange, error }) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value.length > 0;

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={3}
        className={`input-field resize-none ${error ? 'input-field-error' : ''}`}
      />
      <label className={`floating-label ${isActive ? 'floating-label-active top-3' : ''}`}>
        {label}
      </label>
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-elevated max-h-[90vh] overflow-y-auto animate-[slideUp_200ms_ease-out, scaleIn_200ms_ease-out]">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="text-lg font-bold text-surface-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mb-4 text-surface-400">
        {icon}
      </div>
      <p className="text-surface-500 font-medium mb-4">{title}</p>
      {action}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors active:scale-95"
    >
      {copied ? (
        <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11.667 3.5L5.25 9.917 2.333 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Copied</>
      ) : (
        <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4.5" y="4.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M9.5 4.5V3a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 3v5A1.5 1.5 0 003 9.5h1.5" stroke="currentColor" strokeWidth="1.5"/></svg> Copy</>
      )}
    </button>
  );
}

export function UploadZone({ label, preview, onFileSelect }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
        dragOver ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
      }`}
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFileSelect(f); }} />
      {preview ? (
        <div className="space-y-3">
          <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
          <p className="text-sm text-surface-500 font-medium">Click or drag to replace</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="w-10 h-10 bg-surface-100 rounded-xl flex items-center justify-center mx-auto text-surface-400">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12m0-12L6 8m4-4l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 14v2a2 2 0 002 2h10a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <p className="text-sm text-surface-500 font-medium">{label}</p>
          <p className="text-xs text-surface-400">Drag & drop or click to browse</p>
        </div>
      )}
    </div>
  );
}
