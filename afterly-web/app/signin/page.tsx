"use client";

/*
 * PRODUCTION OTP SETUP (Twilio via Supabase):
 * 1. Enable Phone Auth in Supabase Dashboard → Authentication → Providers → Phone
 * 2. Configure Twilio credentials (Account SID, Auth Token, Message Service SID)
 * 3. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env
 * 4. Add your site URL to Supabase Auth redirect allowlist
 * 5. For India: ensure Twilio supports +91 SMS or use a local SMS provider via Edge Function
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, requestOtp, verifyOtp, isSupabaseConfigured } from "../../lib/supabase";

const TWILIO_SETUP_MESSAGE =
  "OTP service is being set up. contact us at hello@afterly.in to get early access.";

function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

function maskPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 5) return digits;
  return `${digits.slice(0, 5)} ●●●●●`;
}

export default function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const isDev = process.env.NODE_ENV === "development";

  const phoneDigits = phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length === 10;

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      router.replace("/explore");
    }
  }, [router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
  };

  const getOtpErrorMessage = (message: string): string => {
    const lower = message.toLowerCase();
    if (
      lower.includes("twilio") ||
      lower.includes("sms") ||
      lower.includes("otp") ||
      lower.includes("provider") ||
      lower.includes("phone auth")
    ) {
      return TWILIO_SETUP_MESSAGE;
    }
    return message;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid) return;

    setIsLoading(true);
    setStatusMessage("");
    const fullPhone = `+91${phoneDigits}`;
    const result = await requestOtp(fullPhone);
    setIsLoading(false);

    if (result.success) {
      setStep("otp");
      setCountdown(30);
      setOtp(["", "", "", "", "", ""]);
      setOtpError(false);
      if (isDev && !isSupabaseConfigured) {
        setStatusMessage(result.message);
      } else {
        setStatusMessage("");
      }
    } else {
      setStatusMessage(getOtpErrorMessage(result.message));
    }
  };

  const handleOtpSubmit = async () => {
    const code = otp.join("");
    if (code.length < 6) return;

    setIsLoading(true);
    setStatusMessage("");
    setOtpError(false);
    const fullPhone = `+91${phoneDigits}`;
    const result = await verifyOtp(fullPhone, code);
    setIsLoading(false);

    if (result.success) {
      const redirect = sessionStorage.getItem("redirectAfterLogin") || "/explore";
      sessionStorage.removeItem("redirectAfterLogin");
      router.replace(redirect);
    } else {
      setOtpError(true);
      setStatusMessage(result.message);
      setTimeout(() => setOtpError(false), 500);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError(false);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="page-load-animate" style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "var(--bg-card)",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    borderRadius: 14,
                    padding: "16px 20px",
                    transition: "border-color 0.2s",
                  }}
                >
                  <span style={{ color: "#FFF", fontWeight: 500 }}>+91</span>
                  <div style={{ width: "1px", height: 24, background: "rgba(255,255,255,0.1)", margin: "0 16px" }} />
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="98765 43210"
                    value={formatPhoneDisplay(phone)}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    autoFocus
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#FFF",
                      fontSize: 16,
                    }}
                  />
                </div>

                {isDev && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "10px 14px",
                      background: "rgba(201,160,80,0.1)",
                      border: "0.5px solid rgba(201,160,80,0.2)",
                      borderRadius: 10,
                      fontSize: 12,
                      color: "rgba(201,160,80,0.8)",
                    }}
                  >
                    test mode: use +919999999999 → OTP: 123456
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isPhoneValid || isLoading}
                  style={{
                    width: "100%",
                    background: isPhoneValid ? "#FFF" : "rgba(255,255,255,0.2)",
                    color: isPhoneValid ? "#000" : "rgba(255,255,255,0.3)",
                    borderRadius: 14,
                    padding: 16,
                    fontSize: 15,
                    fontWeight: 500,
                    marginTop: 16,
                    cursor: !isPhoneValid || isLoading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    opacity: isLoading ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    border: "none",
                  }}
                >
                  {isLoading && (
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(0,0,0,0.2)",
                        borderTop: "2px solid #000",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                        display: "inline-block",
                      }}
                    />
                  )}
                  {isLoading ? "sending..." : "send otp →"}
                </button>
              </form>

              {statusMessage ? (
                <div style={{ marginTop: 16, color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{statusMessage}</div>
              ) : null}

              <div style={{ display: "flex", alignItems: "center", margin: "32px 0" }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
                <span style={{ margin: "0 16px", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>or</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
              </div>

              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
                by continuing you agree to our{" "}
                <a href="/terms" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "underline" }}>
                  terms
                </a>{" "}
                and{" "}
                <a href="/privacy" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "underline" }}>
                  privacy policy
                </a>
              </div>
            </>
          ) : (
            <>
              <h1 style={{ fontWeight: 700, fontSize: 48, color: "#FFF", letterSpacing: -2, marginBottom: 8, lineHeight: 1.1 }}>
                check your messages.
              </h1>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, marginBottom: 40 }}>
                we sent a code to +91 {maskPhone(phoneDigits)}
              </p>

              <div className={otpError ? "otp-shake" : ""} style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    autoFocus={i === 0}
                    style={{
                      width: 52,
                      height: 60,
                      background: "var(--bg-card)",
                      border: `0.5px solid ${otpError ? "#FF4444" : digit ? "#FFF" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 12,
                      fontSize: 24,
                      textAlign: "center",
                      color: "#FFF",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                  />
                ))}
              </div>

              <button
                onClick={handleOtpSubmit}
                disabled={isLoading || otp.join("").length < 6}
                style={{
                  width: "100%",
                  background: "#FFF",
                  color: "#000",
                  borderRadius: 14,
                  padding: 16,
                  fontSize: 15,
                  fontWeight: 500,
                  marginTop: 24,
                  cursor: isLoading ? "wait" : "pointer",
                  opacity: isLoading || otp.join("").length < 6 ? 0.7 : 1,
                  border: "none",
                }}
              >
                {isLoading ? "verifying..." : "continue"}
              </button>

              {statusMessage ? (
                <div
                  style={{
                    marginTop: 16,
                    textAlign: "center",
                    color: otpError ? "#FF4444" : "rgba(255,255,255,0.7)",
                    fontSize: 13,
                  }}
                >
                  {statusMessage}
                </div>
              ) : null}

              <div style={{ marginTop: 24, textAlign: "center" }}>
                {countdown > 0 ? (
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                    didn&apos;t get it? resend in {countdown}s
                  </span>
                ) : (
                  <button
                    onClick={async () => {
                      setCountdown(30);
                      const result = await requestOtp(`+91${phoneDigits}`);
                      setStatusMessage(result.success ? "" : getOtpErrorMessage(result.message));
                    }}
                    style={{
                      color: "#FFF",
                      fontSize: 14,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    resend otp
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

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
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            fontSize: "12vw",
            fontWeight: 700,
            color: "rgba(255,255,255,0.03)",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
        >
          afterly
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .signin-right { display: none !important; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .otp-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
