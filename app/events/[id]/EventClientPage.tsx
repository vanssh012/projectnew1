"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { supabase } from "../../../lib/supabase";
import { useToast } from "../../components/ToastProvider";

export default function EventClientPage({ event }: { event: any }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const priceFormatted = event.ticket_price && event.ticket_price > 0 ? `₹${event.ticket_price / 100}` : "Free";

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
      showToast("link copied!");
    }
  };

  const handleGetTickets = async () => {
    setLoading(true);
    
    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/signin");
      return;
    }

    const isFree = !event.ticket_price || event.ticket_price === 0;

    if (isFree) {
      // Free Event Logic
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert({
          event_id: event.id,
          user_id: session.user.id,
          status: event.requires_approval ? 'pending' : 'approved',
          payment_status: 'free',
        })
        .select()
        .single();
        
      if (error) {
        showToast("something went wrong. try again.");
      } else {
        showToast("request sent!");
        router.push("/tickets");
      }
      setLoading(false);
      return;
    }

    // Paid Event Logic - Call Edge Function to create Razorpay Order
    try {
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-order', {
        body: { amount: event.ticket_price, eventId: event.id } // ticket_price is already in paise
      });

      if (orderError || !orderData) {
        throw new Error("Failed to create order");
      }

      // Load Razorpay Script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
          amount: event.ticket_price,
          currency: 'INR',
          name: 'Afterly',
          description: event.title || event.name,
          order_id: orderData.id,
          prefill: { 
            name: session.user?.user_metadata?.full_name || '', 
            contact: session.user?.phone || '' 
          },
          theme: { color: '#C9A050' },
          handler: async (response: any) => {
            // Payment success - insert ticket
            await supabase
              .from('tickets')
              .insert({
                event_id: event.id,
                user_id: session.user.id,
                payment_status: 'paid',
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                status: event.requires_approval ? 'pending' : 'approved'
              });
            showToast("payment successful!");
            router.push('/tickets');
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setLoading(false);
      };
      document.body.appendChild(script);

    } catch (err) {
      showToast("could not initiate payment.");
      setLoading(false);
    }
  };

  return (
    <div className="page-load-animate" style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "100px 24px 80px" }}>
        
        {/* Cover Photo */}
        <div style={{ width: "100%", height: 300, background: "var(--bg-card)", borderRadius: 24, marginBottom: 40, position: "relative", overflow: "hidden" }}>
          {event.cover_image_url ? (
            <img src={event.cover_image_url} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, opacity: 0.1 }}>
              {event.category === 'farewell' ? '✦' : event.category === 'freshers' ? '◈' : '◉'}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <div style={{ background: "rgba(255,255,255,0.06)", padding: "6px 12px", borderRadius: 100, fontSize: 11, fontWeight: 600, display: "inline-block", marginBottom: 16, textTransform: "uppercase", color: "var(--gold)" }}>
              {event.category}
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 700, color: "#FFF", letterSpacing: -1, marginBottom: 12 }}>
              {event.title || event.name}
            </h1>
            <div style={{ display: "flex", gap: 16, color: "rgba(255,255,255,0.5)", fontSize: 15 }}>
              <div>📅 {event.date || event.event_date}</div>
              <div>📍 {event.city || event.venue}</div>
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
            {(event.host_name || "H")[0]}
          </div>
          <div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Hosted by</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: "#FFF" }}>{event.host_name || "Unknown"}</div>
          </div>
        </div>

        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#FFF", marginBottom: 16 }}>About this event</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.6 }}>
            {event.description || "No description provided."}
          </p>
        </div>

        {/* Floating Action Bar */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "20px 24px", background: "rgba(10,10,10,0.8)", backdropFilter: "blur(20px)", borderTop: "0.5px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Total Price</div>
              <div style={{ color: "#FFF", fontSize: 20, fontWeight: 600 }}>{priceFormatted}</div>
            </div>
            <button 
              onClick={handleGetTickets}
              disabled={loading}
              style={{ background: "#FFF", color: "#000", padding: "14px 32px", borderRadius: 100, fontSize: 15, fontWeight: 600, border: "none", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "loading..." : "get tickets →"}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
