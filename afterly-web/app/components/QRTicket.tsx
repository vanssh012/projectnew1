'use client'

import { QRCodeSVG } from 'qrcode.react'

export default function QRTicket({ ticket, event }: { ticket: any; event: any }) {
  const colors: Record<string, string> = {
    farewell: '#C9A050', freshers: '#5ABFCF', house_party: '#B07AE0',
  }
  const color = colors[event?.category] || '#C9A050'
  const approved = ticket?.status === 'approved' && ticket?.qr_code

  return (
    <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 20, overflow: 'hidden', maxWidth: 360, fontFamily: 'Inter,sans-serif' }}>
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>{event?.title || 'Event'}</div>
        <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>📍 {event?.venue || event?.city}</div>
      </div>
      <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '0 16px' }} />
      <div style={{ padding: 20, textAlign: 'center' }}>
        {approved ? <>
          <div style={{ background: '#fff', borderRadius: 12, padding: 12, display: 'inline-block' }}>
            <QRCodeSVG value={JSON.stringify({ ticket_id: ticket.id, qr_code: ticket.qr_code, event_id: ticket.event_id })} size={160} bgColor="#fff" fgColor="#000" level="H" />
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>show this at the door</div>
        </> : <div style={{ padding: '24px 0', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
          {ticket?.status === 'pending' ? 'QR code will appear once the host approves you.' : 'This ticket is not available for entry.'}
        </div>}
      </div>
      <div style={{ padding: '12px 20px', borderTop: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
        <span style={{ color: approved ? '#8ECF7A' : '#C9A050' }}>{ticket?.status || 'unknown'}</span>
        <span style={{ color }}>{!event?.ticket_price ? 'free' : `₹${event.ticket_price / 100}`}</span>
      </div>
    </div>
  )
}
