"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { supabase } from "../../../lib/supabase";
import { useToast } from "../../components/ToastProvider";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const CATEGORY = {
  farewell: { color: '#C9A050', bg: '#1E1A0E', symbol: '✦', label: 'Farewell' },
  freshers: { color: '#5ABFCF', bg: '#0E1A1E', symbol: '◈', label: 'Freshers' },
  house_party: { color: '#B07AE0', bg: '#1A0E1E', symbol: '◉', label: 'House Party' },
};

function catInfo(category: string | null | undefined) {
  return CATEGORY[category || ''] || CATEGORY.house_party;
}

export default function EventClientPage({ event }: { event: any }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [ticketStatus, setTicketStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const cat = catInfo(event?.category);
  const priceFormatted = event.ticket_price && event.ticket_price > 0 ? `₹${event.ticket_price / 100}` : "Free";
  const venue = event.venue || "venue TBA";
  const date = event.event_date || event.date || "date TBA";
  const dateDisplay = formatDate(date) || "date TBA";
  const timeDisplay = formatTime(date);
  const title = event.title || event.name || "Event";
  const description = event.description || "No description provided.";
  const hostName = event.host_name || "Unknown";
  const hostProfileId = event.host_id;
  const spots = event.spots_remaining != null ? event.spots_remaining : (event.max_guests != null && event.approved_count != null ? event.max_guests - event.approved_count : null);

  useEffect(() => {
    const checkExistingTicket = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('tickets').select('status').eq('event_id', event.id).eq('user_id', user.id).maybeSingle();
      if (data) setTicketStatus(data.status);
    };
    if (event?.id) checkExistingTicket();
  }, [event?.id]);

  useEffect(() => {
    const onScroll = () => {
      const documentElement = document.documentElement;
      const scrollHeight = documentElement.scrollHeight - documentElement.clientHeight;
      setProgress(scrollHeight > 0 ? (documentElement.scrollTop / scrollHeight) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title || event.name,
          text: `Check out this event on Afterly — ${event.title || event.name}`,
          url: url,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(url);
      showToast("✓ link copied");
    }
  };

  const handleGetTickets = async () => {
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        router.push("/signin");
        return;
      }

      const isFree = !event.ticket_price || event.ticket_price === 0;
      const createTicket = async (paymentStatus: string, paymentDetails?: Record<string, string>) => {
        const { data: ticket, error } = await supabase
          .from("tickets")
          .insert({
            event_id: event.id,
            user_id: session.user.id,
            status: event.requires_approval ? "pending" : "approved",
            payment_status: paymentStatus,
            ...paymentDetails,
          })
          .select()
          .single();

        if (error) throw error;
        return ticket;
      };

      if (isFree) {
        await createTicket("free");
        setTicketStatus(event.requires_approval ? 'pending' : 'approved');
        showToast("request sent!");
        router.push("/tickets");
        return;
      }

      const useDemoPayments = !process.env.NEXT_PUBLIC_RAZORPAY_KEY || ["localhost", "127.0.0.1"].includes(window.location.hostname);

      if (useDemoPayments) {
        await createTicket("paid", {
          razorpay_order_id: `demo_${Date.now()}`,
          razorpay_payment_id: `pay_${Date.now()}`,
        });
        setTicketStatus(event.requires_approval ? 'pending' : 'approved');
        showToast("demo payment successful!");
        router.push("/tickets");
        return;
      }

      const { data: orderData, error: orderError } = await supabase.functions.invoke("create-order", {
        body: { amount: event.ticket_price, eventId: event.id },
      });

      if (orderError || !orderData) {
        throw new Error("Failed to create order");
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load payment gateway"));
        document.body.appendChild(script);
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: event.ticket_price,
        currency: "INR",
        name: "Afterly",
        description: event.title || event.name,
        order_id: orderData.id,
        prefill: {
          name: session.user?.user_metadata?.full_name || "",
          contact: session.user?.phone || "",
        },
        theme: { color: cat.color },
        handler: async (response: any) => {
          await createTicket("paid", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
          });
          setTicketStatus(event.requires_approval ? 'pending' : 'approved');
          showToast("payment successful!");
          router.push("/tickets");
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      showToast("could not initiate payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-load-animate" style={{ background: cat.bg, minHeight: "100vh" }}>
      <Navbar />
      <div style={{ position: "fixed", top: 56, left: 0, height: 2, zIndex: 99, width: `${progress}%`, background: "linear-gradient(90deg, #C9A050, #5ABFCF)", transition: "width 0.1s linear", borderRadius: "0 2px 2px 0" }} />

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "100px 24px 170px" }}>

        {/* Cover Photo */}
        <div style={{ width: "100%", height: 300, background: "var(--bg-card)", borderRadius: 24, marginBottom: 40, position: "relative", overflow: "hidden" }}>
          {event.cover_image_url ? (
            <img src={event.cover_image_url} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, opacity: 0.1, color: "#FFF" }}>
              {cat.symbol}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <div style={{ background: cat.color + "22", padding: "6px 12px", borderRadius: 100, fontSize: 11, fontWeight: 600, display: "inline-block", marginBottom: 16, textTransform: "uppercase", color: cat.color }}>
              {cat.label}
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 700, color: "#FFF", letterSpacing: -1, marginBottom: 12 }}>
              {title}
            </h1>
            <div style={{ display: "flex", gap: 16, color: "rgba(255,255,255,0.5)", fontSize: 15 }}>
              <div>📅 {dateDisplay}{timeDisplay ? ` · ${timeDisplay}` : ""}</div>
              <div>📍 {venue}</div>
            </div>
          </div>

          <button onClick={handleShare} style={{ background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "10px 12px", color: "rgba(255,255,255,0.6)", cursor: "pointer", transition: "all 0.2s" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
          </button>
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 40, paddingBottom: 40, borderBottom: "0.5px solid rgba(255,255,255,0.1)" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontSize: 18, fontWeight: 500 }}>
            {(hostName || "H")[0]}
          </div>
          <div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Hosted by</div>
            {hostProfileId ? (
              <Link
                href={`/profile/${hostProfileId}`}
                onClick={(eventClick) => eventClick.stopPropagation()}
                style={{ fontSize: 16, fontWeight: 500, color: "#FFF", textDecoration: "none" }}
              >
                {hostName}
              </Link>
            ) : (
              <div style={{ fontSize: 16, fontWeight: 500, color: "#FFF" }}>{hostName}</div>
            )}
          </div>
        </div>

        {/* Theme Description */}
        {event.theme_description ? (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#FFF", marginBottom: 12 }}>Theme</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.6 }}>
              {event.theme_description}
            </p>
          </div>
        ) : null}

        {/* Theme Tags */}
        {event.theme_tags && event.theme_tags.length > 0 ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
            {event.theme_tags.map((tag: string) => (
              <span key={tag} style={{ background: "rgba(255,255,255,0.06)", padding: "6px 14px", borderRadius: 100, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {/* About */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#FFF", marginBottom: 16 }}>About this event</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.6 }}>
            {description}
          </p>
        </div>

        {/* Details Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 40 }}>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>City</div>
            <div style={{ fontSize: 16, color: "#FFF", fontWeight: 500 }}>{event.city || "TBA"}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Max Guests</div>
            <div style={{ fontSize: 16, color: "#FFF", fontWeight: 500 }}>{event.max_guests || "TBA"}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Spots Left</div>
            <div style={{ fontSize: 16, color: "#FFF", fontWeight: 500 }}>{spots != null ? spots : "TBA"}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Price</div>
            <div style={{ fontSize: 16, color: "#FFF", fontWeight: 500 }}>{priceFormatted}</div>
          </div>
        </div>

      </main>

      {/* Floating Action Bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 20px", paddingBottom: "max(12px, env(safe-area-inset-bottom))", background: "linear-gradient(to top, rgba(0,0,0,0.98) 60%, transparent)", zIndex: 50, pointerEvents: "none" }}>
        <div style={{ width: "100%", maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", pointerEvents: "all" }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Total Price</div>
            <div style={{ color: "#FFF", fontSize: 20, fontWeight: 600 }}>{priceFormatted}</div>
          </div>
          <button
            onClick={handleGetTickets}
            disabled={loading || ['pending', 'approved', 'checked_in'].includes(ticketStatus || '')}
            style={{ background: "#FFF", color: "#000", padding: "14px 32px", borderRadius: 100, fontSize: 15, fontWeight: 600, border: "none", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "loading..." : ticketStatus === 'pending' ? 'request sent ⏳' : ticketStatus === 'approved' ? "you're in ✓" : `get tickets${event.ticket_price > 0 ? ` · ₹${event.ticket_price / 100}` : ''} →`}
          </button>
        </div>
      </div>
    </div>
  );
}