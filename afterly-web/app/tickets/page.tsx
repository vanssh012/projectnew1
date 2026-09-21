'use client'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AuthGuard from '../components/AuthGuard'
import { supabase } from '@/lib/supabase'
import QRTicket from '../components/QRTicket'

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

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTickets = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('tickets')
        .select('*, events(id, title, event_date, city, venue, cover_image_url, category, ticket_price)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setTickets(data)
      }
      setLoading(false)
    }

    const timeout = setTimeout(() => setLoading(false), 5000)
    fetchTickets()
    return () => clearTimeout(timeout)
  }, [])

  return (
    <AuthGuard>
      <div className="page-load-animate" style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
        <Navbar />

        <main style={{ maxWidth: 800, margin: "0 auto", padding: "100px 24px 80px" }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, color: "#FFF", letterSpacing: -1, marginBottom: 40 }}>
            your tickets.
          </h1>

          {loading ? (
            <div style={{ color: "rgba(255,255,255,0.5)" }}>loading...</div>
          ) : tickets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>no tickets yet.</div>
              <a href="/explore" className="btn btn-secondary">explore events →</a>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {tickets.map(ticket => {
                const event = ticket.events
                const title = event?.title || event?.name || "Event"
                const date = event?.event_date || event?.date
                const location = event?.city || event?.venue
                const formattedDate = formatDate(date || "")

                return (
                  <div key={ticket.id} style={{ background: "var(--bg-card)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: 24, borderBottom: "0.5px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <h3 style={{ fontSize: 24, fontWeight: 600, color: "#FFF", marginBottom: 8 }}>{title}</h3>
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                          {formattedDate} · {location}
                        </div>
                      </div>
                      <div>
                        {ticket.status === 'approved' ? (
                          <div style={{ background: "rgba(0,255,100,0.1)", color: "#00FF64", padding: "6px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Approved</div>
                        ) : ticket.status === 'rejected' ? (
                          <div style={{ background: "rgba(255,0,0,0.1)", color: "#FF4444", padding: "6px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Rejected</div>
                        ) : (
                          <div style={{ background: "rgba(255,255,255,0.1)", color: "#FFF", padding: "6px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Pending</div>
                        )}
                      </div>
                    </div>

                    <div style={{ padding: 24 }}><QRTicket ticket={ticket} event={event} /></div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </AuthGuard>
  )
}
