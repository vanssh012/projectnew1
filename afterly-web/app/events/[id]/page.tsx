'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchEventById } from '@/lib/fetchEvents'
import EventClientPage from './EventClientPage'

export default function EventPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const timeout = setTimeout(() => setLoading(false), 5000)
    fetchEventById(id).then(data => {
      setEvent(data)
      setLoading(false)
      clearTimeout(timeout)
    })
    return () => clearTimeout(timeout)
  }, [id])

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#000',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.1)',
        borderTop: '2px solid #C9A050',
        animation: 'spin 0.8s linear infinite'
      }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!event) return (
    <div style={{
      minHeight: '100vh', background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ fontSize: 32, color: '#C9A050', marginBottom: 16 }}>✦</div>
      <div style={{ fontSize: 20, color: '#fff', marginBottom: 8 }}>event not found.</div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>
        this event may have been removed.
      </div>
      <button onClick={() => router.push('/explore')} style={{
        background: '#fff', color: '#000', borderRadius: 12,
        padding: '12px 24px', fontSize: 14, fontWeight: 500,
        border: 'none', cursor: 'pointer'
      }}>
        explore events →
      </button>
    </div>
  )

  return <EventClientPage event={event} />
}