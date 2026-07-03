"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function SignInPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);

  // OTP Countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setStep("otp");
      setCountdown(30);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="page-load-animate" style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      
      {/* LEFT HALF - Form */}
      <div style={{ flex: 1, padding: 60, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
        
        <div style={{ position: "absolute", top: 40, left: 60 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "var(--gold)", fontSize: 24 }}>✦</span>
            <span style={{ fontSize: 16, fontWeight: 500, color: "#FFF" }}>afterly</span>
          </a>
        </div>

        <div style={{ maxWidth: 400, margin: "0 auto", width: "100%" }}>
          {step === "phone" ? (
            <>
              <h1 style={{ fontWeight: 700, fontSize: 48, color: "#FFF", letterSpacing: -2, marginBottom: 8, lineHeight: 1.1 }}>
                welcome back.
              </h1>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, marginBottom: 40 }}>
                enter your phone number to continue.
              </p>

              <form onSubmit={handlePhoneSubmit}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  background: "var(--bg-card)", 
                  border: "0.5px solid rgba(255,255,255,0.1)", 
                  borderRadius: 14, 
                  padding: "16px 20px",
                  transition: "border-color 0.2s"
                }}>
                  <span style={{ color: "#FFF", fontWeight: 500 }}>+91</span>
                  <div style={{ width: "1px", height: 24, background: "rgba(255,255,255,0.1)", margin: "0 16px" }} />
                  <input 
                    type="tel"
                    placeholder="Mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoFocus
                    style={{ 
                      flex: 1, 
                      background: "transparent", 
                      border: "none", 
                      outline: "none", 
                      color: "#FFF", 
                      fontSize: 16 
                    }}
                  />
                </div>

                <button 
                  type="submit" 
                  style={{ 
                    width: "100%", 
                    background: "#FFF", 
                    color: "#000", 
                    borderRadius: 14, 
                    padding: 16, 
                    fontSize: 15, 
                    fontWeight: 500, 
                    marginTop: 16,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(0.99)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  send otp →
                </button>
              </form>

              <div style={{ display: "flex", alignItems: "center", margin: "32px 0" }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
                <span style={{ margin: "0 16px", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>or</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
              </div>

              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
                by continuing you agree to our terms and privacy policy
              </div>
            </>
          ) : (
            <>
              <h1 style={{ fontWeight: 700, fontSize: 48, color: "#FFF", letterSpacing: -2, marginBottom: 8, lineHeight: 1.1 }}>
                check your messages.
              </h1>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, marginBottom: 40 }}>
                we sent a 6-digit code to +91 {phone}
              </p>

              <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    autoFocus={i === 0}
                    style={{
                      width: 52,
                      height: 60,
                      background: "var(--bg-card)",
                      border: `0.5px solid ${digit ? "#FFF" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 12,
                      fontSize: 24,
                      textAlign: "center",
                      color: "#FFF",
                      outline: "none",
                      transition: "border-color 0.2s"
                    }}
                  />
                ))}
              </div>

              <div style={{ marginTop: 32, textAlign: "center" }}>
                {countdown > 0 ? (
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                    didn't get it? resend in {countdown}s
                  </span>
                ) : (
                  <button 
                    onClick={() => setCountdown(30)}
                    style={{ color: "#FFF", fontSize: 14, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                  >
                    resend otp
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT HALF - Decorative (Desktop only) */}
      <div 
        className="signin-right"
        style={{ 
          flex: 1, 
          background: "var(--bg-secondary)", 
          borderLeft: "0.5px solid rgba(255,255,255,0.06)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ 
          position: "absolute", 
          fontSize: "12vw", 
          fontWeight: 700, 
          color: "rgba(255,255,255,0.03)", 
          userSelect: "none",
          whiteSpace: "nowrap"
        }}>
          afterly
        </div>

        {/* Floating cards */}
        <div style={{ position: "relative", width: 400, height: 400 }}>
          <div style={{
            position: "absolute", top: 40, left: 20, width: 220, background: "#111", borderRadius: 16, border: "0.5px solid rgba(255,255,255,0.08)", padding: 16,
            animation: "float 6s ease-in-out infinite"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "var(--gold)", fontSize: 20 }}>✦</span>
              <span style={{ fontSize: 10, background: "#FFF", color: "#000", padding: "4px 8px", borderRadius: 100, fontWeight: 600 }}>FAREWELL</span>
            </div>
            <div style={{ color: "#FFF", fontSize: 14, fontWeight: 500 }}>The Last Dance</div>
          </div>

          <div style={{
            position: "absolute", top: 180, right: 20, width: 220, background: "#111", borderRadius: 16, border: "0.5px solid rgba(255,255,255,0.08)", padding: 16,
            animation: "float 6s ease-in-out infinite 1s"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "var(--teal)", fontSize: 20 }}>◈</span>
              <span style={{ fontSize: 10, background: "#FFF", color: "#000", padding: "4px 8px", borderRadius: 100, fontWeight: 600 }}>FRESHERS</span>
            </div>
            <div style={{ color: "#FFF", fontSize: 14, fontWeight: 500 }}>Neon Night</div>
          </div>
          
          <div style={{
            position: "absolute", bottom: 0, left: 60, width: 220, background: "#111", borderRadius: 16, border: "0.5px solid rgba(255,255,255,0.08)", padding: 16,
            animation: "float 6s ease-in-out infinite 2s"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "var(--purple)", fontSize: 20 }}>◉</span>
              <span style={{ fontSize: 10, background: "#FFF", color: "#000", padding: "4px 8px", borderRadius: 100, fontWeight: 600 }}>HOUSE PARTY</span>
            </div>
            <div style={{ color: "#FFF", fontSize: 14, fontWeight: 500 }}>Midnight Mirage</div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .signin-right { display: none !important; }
        }
      `}</style>
    </div>
  );
}
