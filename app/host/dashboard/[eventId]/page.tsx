"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Scanner from "../../../components/Scanner";
import { supabase } from "../../../../lib/supabase";
import { useToast } from "../../../components/ToastProvider";

export default function HostDashboardPage({ params }: { params: { eventId: string } }) {
  const [activeTab, setActiveTab] = useState<"requests" | "approved" | "scan" | "details">("requests");
  const [event, setEvent] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [approved, setApproved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      // 1. Fetch Event
      const { data: eventData } = await supabase
        .from('event_with_stats')
        .select('*')
        .eq('id', params.eventId)
        .single();
      
      if (eventData) setEvent(eventData);

      // 2. Fetch Tickets
      const { data: tickets } = await supabase
        .from('tickets')
        .select('*, profiles(id, full_name, college)')
        .eq('event_id', params.eventId);

      if (tickets) {
        setRequests(tickets.filter(t => t.status === 'pending'));
        setApproved(tickets.filter(t => t.status === 'approved' || t.status === 'checked-in'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter: `event_id=eq.${params.eventId}` }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.eventId]);

  const handleApprove = async (req: any) => {
    setLoadingId(req.id);
    const { error } = await supabase
      .from('tickets')
      .update({ status: 'approved' })
      .eq('id', req.id);
      
    if (!error) {
      showToast(`Approved ${req.profiles?.full_name} ✓`);
      fetchData();
    } else {
      showToast('Error approving ticket');
    }
    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('tickets')
      .update({ status: 'rejected' })
      .eq('id', id);
    
    if (!error) {
      showToast('Request rejected');
      fetchData();
    }
    setRejectingId(null);
  };

  const handleScanSuccess = async (decodedText: string) => {
    try {
      // The decoded text should be the ticket qr_uuid or id
      const { data, error } = await supabase
        .from('tickets')
        .update({ status: 'checked-in' })
        .eq('qr_uuid', decodedText)
        .eq('event_id', params.eventId)
        .select()
        .single();
      
      if (data) {
        showToast('Guest Checked In! ✅');
      } else {
        showToast('Invalid or unrecognized QR code ❌');
      }
    } catch (err) {
      showToast('Scan failed.');
    }
  };

  if (loading) {
    return <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#000", color: "rgba(255,255,255,0.5)" }}>loading dashboard...</div>;
  }

  if (!event) {
    return <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#000", color: "rgba(255,255,255,0.5)" }}>event not found.</div>;
  }

  return (
    <div className="page-load-animate" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      <main style={{ flex: 1, padding: "40px 24px 100px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          
          <Link href="/profile" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "underline", marginBottom: 24, display: "inline-block" }}>
            ← back to profile
          </Link>

          {/* TOP SECTION */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 10, background: "#FFF", color: "#000", padding: "4px 8px", borderRadius: 100, fontWeight: 600, textTransform: "uppercase" }}>
                {event.category}
              </div>
              <div style={{ fontSize: 11, color: "#5ABFCF", display: "flex", alignItems: "center", gap: 6, fontWeight: 500, background: "rgba(90,191,207,0.1)", padding: "4px 10px", borderRadius: 100 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5ABFCF" }} /> live
              </div>
            </div>
            
            <h1 style={{ fontSize: 28, fontWeight: 500, color: "#FFF" }}>{event.name || event.title}</h1>
          </div>

          {/* 4 STAT CARDS */}
          <div className="stats-grid" style={{ marginBottom: 40 }}>
            <div className="stat-card">
              <div className="stat-label">requests</div>
              <div className="stat-value">{requests.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">approved</div>
              <div className="stat-value" style={{ color: "#5ABFCF" }}>{approved.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">spots left</div>
              <div className="stat-value" style={{ color: "var(--gold)" }}>{Math.max(0, (event.max_guests || 0) - approved.length)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">revenue</div>
              <div className="stat-value">₹{(approved.length * (event.ticket_price || 0)) / 100}</div>
            </div>
          </div>

          {/* TAB BAR */}
          <div style={{ display: "flex", gap: 32, borderBottom: "0.5px solid rgba(255,255,255,0.1)", marginBottom: 32, overflowX: "auto" }}>
            {[
              { id: "requests", label: `requests (${requests.length})` },
              { id: "approved", label: `approved (${approved.length})` },
              { id: "scan", label: "scan tickets" },
              { id: "details", label: "event details" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: "transparent", border: "none", outline: "none", cursor: "pointer",
                  padding: "0 0 16px", fontSize: 15, fontWeight: activeTab === tab.id ? 500 : 400,
                  color: activeTab === tab.id ? "#FFF" : "rgba(255,255,255,0.4)",
                  borderBottom: `2px solid ${activeTab === tab.id ? "#FFF" : "transparent"}`,
                  whiteSpace: "nowrap", transition: "all 0.2s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT: REQUESTS */}
          {activeTab === "requests" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {requests.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)", fontSize: 15 }}>
                  no pending requests right now.
                </div>
              ) : (
                requests.map(req => (
                  <div key={req.id} className="request-row">
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontSize: 13, fontWeight: 500 }}>
                      {(req.profiles?.full_name || "G").charAt(0)}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                        <div style={{ fontSize: 15, fontWeight: 500, color: "#FFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{req.profiles?.full_name || "Guest"}</div>
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{req.profiles?.college || "Unknown College"}</div>
                    </div>
                    
                    <div className="action-buttons" style={{ display: "flex", gap: 8 }}>
                      <button 
                        className="btn-approve" 
                        onClick={() => handleApprove(req)}
                        disabled={loadingId === req.id}
                      >
                        {loadingId === req.id ? "approving..." : "Approve"}
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => setRejectingId(req.id)}
                      >
                        Reject
                      </button>
                    </div>

                    {rejectingId === req.id && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 20px", gap: 12 }}>
                        <span style={{ color: "#FFF", fontSize: 14, marginRight: 8 }}>reject this request?</span>
                        <button onClick={() => setRejectingId(null)} style={{ background: "transparent", color: "rgba(255,255,255,0.5)", border: "none", fontSize: 13, cursor: "pointer" }}>cancel</button>
                        <button onClick={() => handleReject(req.id)} style={{ background: "#CF7A7A", color: "#000", border: "none", borderRadius: 100, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>yes, reject</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB CONTENT: APPROVED */}
          {activeTab === "approved" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {approved.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)", fontSize: 15 }}>
                  no guests approved yet.
                </div>
              ) : (
                approved.map(req => (
                  <div key={req.id} className="request-row" style={{ borderLeft: "3px solid #5ABFCF" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontSize: 13, fontWeight: 500 }}>
                      {(req.profiles?.full_name || "G").charAt(0)}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: 15, fontWeight: 500, color: "#FFF" }}>{req.profiles?.full_name || "Guest"}</div>
                        {req.status === 'checked-in' && (
                          <div style={{ fontSize: 10, background: "rgba(0,255,100,0.1)", color: "#00FF64", padding: "2px 6px", borderRadius: 100, textTransform: "uppercase" }}>checked in</div>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{req.profiles?.college || "Unknown College"}</div>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 6 }}>
                        {req.qr_uuid?.substring(0, 8).toUpperCase() || 'NO-QR'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB CONTENT: SCAN */}
          {activeTab === "scan" && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <h2 style={{ color: "#FFF", marginBottom: 8 }}>Scan Tickets</h2>
              <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 32 }}>Point your camera at a guest's QR code to check them in.</p>
              
              <Scanner onScanSuccess={handleScanSuccess} />
            </div>
          )}

          {/* TAB CONTENT: DETAILS */}
          {activeTab === "details" && (
            <div style={{ background: "#111", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 32 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                <div>
                  <div className="detail-label">EVENT NAME</div>
                  <div className="detail-val">{event.name || event.title}</div>
                </div>
                <div>
                  <div className="detail-label">PRICE</div>
                  <div className="detail-val">₹{(event.ticket_price || 0) / 100}</div>
                </div>
                <div>
                  <div className="detail-label">CATEGORY</div>
                  <div className="detail-val" style={{ textTransform: "capitalize" }}>{event.category}</div>
                </div>
                <div>
                  <div className="detail-label">MAX GUESTS</div>
                  <div className="detail-val">{event.max_guests}</div>
                </div>
              </div>
              <div style={{ marginTop: 40, borderTop: "0.5px solid rgba(255,255,255,0.06)", paddingTop: 32 }}>
                <button style={{ background: "transparent", border: "0.5px solid #FFF", color: "#FFF", borderRadius: 100, padding: "12px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                  edit event details
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .stat-card {
          background: #111;
          border-radius: 16px;
          padding: 24px;
          border: 0.5px solid rgba(255,255,255,0.08);
        }
        .stat-label {
          font-size: 11px;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .stat-value {
          font-size: 32px;
          font-weight: 500;
          color: #FFF;
        }

        .request-row {
          background: #111;
          border-radius: 14px;
          padding: 16px 20px;
          border: 0.5px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }

        .btn-approve {
          background: #FFF;
          color: #000;
          border: none;
          border-radius: 100px;
          padding: 8px 20px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-approve:hover:not(:disabled) {
          background: rgba(255,255,255,0.9);
          transform: scale(0.98);
        }
        .btn-approve:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .btn-reject {
          background: transparent;
          color: rgba(255,255,255,0.4);
          border: 0.5px solid rgba(255,255,255,0.15);
          border-radius: 100px;
          padding: 8px 20px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-reject:hover {
          border-color: rgba(255,255,255,0.3);
          color: rgba(255,255,255,0.6);
        }

        .detail-label {
          font-size: 10px;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.3);
          margin-bottom: 8px;
        }
        .detail-val {
          font-size: 16px;
          color: #FFF;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
