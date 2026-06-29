"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export default function Scanner({ onScanSuccess }: ScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScanSuccess(decodedText);
      },
      (errorMessage) => {
        // parse error, ignore
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", background: "#FFF", padding: 16, borderRadius: 16 }}>
      <div id="qr-reader" style={{ width: "100%" }}></div>
    </div>
  );
}
