"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast(message);
    timeoutRef.current = setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div role="status" aria-live="polite" style={{
          position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
          background: "#111", color: "#FFF", padding: "12px 20px", borderRadius: 12,
          border: "0.5px solid rgba(255,255,255,0.1)",
          fontSize: 14, zIndex: 9999,
          animation: "slideUp 0.3s cubic-bezier(0.4,0,0.2,1)"
        }}>
          {toast}
        </div>
      )}
      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
