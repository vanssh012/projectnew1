'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const CATEGORY_COLORS: Record<string, string> = {
  farewell: '#C9A050',
  freshers: '#5ABFCF',
  house_party: '#B07AE0',
}

const CATEGORY_SYMBOLS: Record<string, string> = {
  farewell: '✦',
  freshers: '◈',
  house_party: '◉',
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params?.id as string
  const [profile, setProfile] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editCollege, setEditCollege] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const targetId = profileId === 'me' ? user?.id : profileId

      if (!targetId) {
        if (profileId === 'me') {
          sessionStorage.setItem('redirectAfterLogin', '/profile/me')
          router.push('/signin')
        } else {
          setLoading(false)
        }
        return
      }

      setIsOwnProfile(user?.id === targetId)
      const [{ data: profileData }, { data: hostedEvents }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', targetId).single(),
        supabase.from('event_with_stats').select('*').eq('host_id', targetId).eq('status', 'published').order('event_date', { ascending: true }),
      ])

      if (profileData) {
        setProfile(profileData)
        setEditName(profileData.full_name || '')
        setEditBio(profileData.bio || '')
        setEditCollege(profileData.college || '')
      }
      setEvents(hostedEvents || [])
      setLoading(false)
    }
    load()
  }, [profileId, router])

  const saveProfile = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return
    }
    const values = { full_name: editName.trim(), bio: editBio.trim(), college: editCollege.trim() }
    const { error } = await supabase.from('profiles').update(values).eq('id', user.id)
    if (!error) {
      setProfile((previous: any) => ({ ...previous, ...values }))
      setEditing(false)
    }
    setSaving(false)
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  const upcoming = events.filter((event) => new Date(event.event_date) >= new Date())
  const past = events.filter((event) => new Date(event.event_date) < new Date())
  const initials = (profile?.full_name || 'A').split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2)

  if (loading) return <Loading />
  if (!profile) return <NotFound onHome={() => router.push('/')} />

  const renderEvent = (event: any, isPast = false) => {
    const color = CATEGORY_COLORS[event.category] || '#C9A050'
    return (
      <Link key={event.id} href={`/events/${event.id}`} style={{ ...styles.eventCard, opacity: isPast ? 0.5 : 1, borderLeft: `3px solid ${color}` }}>
        <div style={{ ...styles.eventSymbol, color, background: isPast ? 'rgba(255,255,255,0.04)' : `${color}18` }}>
          {CATEGORY_SYMBOLS[event.category] || '✦'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.eventTitle}>{event.title}</div>
          <div style={styles.eventMeta}>{formatDate(event.event_date)} · {event.venue}</div>
        </div>
        <div style={{ color: isPast ? 'rgba(255,255,255,0.2)' : color, fontSize: 12, flexShrink: 0 }}>
          {isPast ? 'past' : event.ticket_price === 0 ? 'free' : `₹${event.ticket_price / 100}`}
        </div>
      </Link>
    )
  }

  return (
    <main style={styles.page}>
      <button onClick={() => router.back()} style={styles.back}>← back</button>
      <div style={styles.header}>
        <div style={styles.avatarRow}>
          <div style={styles.avatar}>{initials}</div>
          {isOwnProfile && !editing && <button onClick={() => setEditing(true)} style={styles.editButton}>edit profile</button>}
        </div>
        {!editing ? (
          <>
            <div style={styles.name}>{profile.full_name || 'Afterly User'} {profile.verified && <span style={{ color: '#5ABFCF' }}>✓</span>}</div>
            {profile.college && <div style={styles.college}>{profile.college}</div>}
            {profile.bio && <div style={styles.bio}>{profile.bio}</div>}
            {profile.verified && <div style={styles.badge}>✓ verified host</div>}
          </>
        ) : (
          <div style={{ marginTop: 16 }}>
            <div style={styles.sectionLabel}>edit profile</div>
            <input style={styles.input} placeholder="your name" value={editName} onChange={(event) => setEditName(event.target.value)} />
            <input style={styles.input} placeholder="college (optional)" value={editCollege} onChange={(event) => setEditCollege(event.target.value)} />
            <textarea style={{ ...styles.input, minHeight: 80, resize: 'none' }} placeholder="short bio — tell guests about yourself (optional)" value={editBio} maxLength={160} onChange={(event) => setEditBio(event.target.value)} />
            <div style={styles.counter}>{editBio.length} / 160</div>
            <button onClick={saveProfile} disabled={saving} style={styles.saveButton}>{saving ? 'saving...' : 'save changes'}</button>
            <button onClick={() => setEditing(false)} style={styles.cancelButton}>cancel</button>
          </div>
        )}

        <div style={styles.stats}>
          <Stat value={events.length} label="hosted" color="#C9A050" />
          <Stat value={profile.total_attended || 0} label="attended" color="#8ECF7A" />
          <Stat value={profile.trust_score ? Number(profile.trust_score).toFixed(1) : '—'} label="rating" color="#5ABFCF" />
        </div>

        {upcoming.length > 0 && <section style={{ marginBottom: 32 }}><div style={styles.sectionLabel}>upcoming events · {upcoming.length}</div>{upcoming.map((event) => renderEvent(event))}</section>}
        {past.length > 0 && <section><div style={styles.sectionLabel}>past events · {past.length}</div>{past.map((event) => renderEvent(event, true))}</section>}
        {events.length === 0 && <div style={styles.empty}>no events hosted yet.{isOwnProfile && <><br /><Link href="/host" style={{ color: '#C9A050' }}>host your first event →</Link></>}</div>}
        {isOwnProfile && <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} style={styles.signOut}>sign out</button>}
      </div>
    </main>
  )
}

function Stat({ value, label, color }: { value: string | number; label: string; color: string }) {
  return <div style={styles.stat}><div style={{ ...styles.statNumber, color }}>{value}</div><div style={styles.statLabel}>{label}</div></div>
}

function Loading() {
  return <div style={styles.center}><div style={styles.spinner} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
}

function NotFound({ onHome }: { onHome: () => void }) {
  return <div style={{ ...styles.center, gap: 12 }}><div style={{ fontSize: 32, color: '#C9A050' }}>✦</div><div>profile not found.</div><button onClick={onHome} style={styles.cancelButton}>go home</button></div>
}

const styles: Record<string, any> = {
  page: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif', paddingBottom: 80 },
  center: { minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', flexDirection: 'column' },
  spinner: { width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #C9A050', animation: 'spin 0.8s linear infinite' },
  back: { display: 'inline-flex', color: 'rgba(255,255,255,0.4)', fontSize: 13, padding: '24px 24px 0', cursor: 'pointer', background: 'none', border: 'none' },
  header: { padding: '32px 24px 0', maxWidth: 640, margin: '0 auto' },
  avatarRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  avatar: { width: 72, height: 72, borderRadius: '50%', background: '#1A1A1E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#C9A050', border: '1.5px solid rgba(201,160,80,0.3)' },
  name: { fontSize: 24, fontWeight: 500, marginBottom: 4 },
  college: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 8 },
  bio: { fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 16 },
  badge: { display: 'inline-flex', fontSize: 11, color: '#5ABFCF', background: 'rgba(90,191,207,0.08)', border: '0.5px solid rgba(90,191,207,0.3)', borderRadius: 100, padding: '4px 10px' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 16, overflow: 'hidden', margin: '24px 0', border: '0.5px solid rgba(255,255,255,0.08)' },
  stat: { padding: '20px 16px', textAlign: 'center', background: '#0A0A0A' },
  statNumber: { fontSize: 24, fontWeight: 500, marginBottom: 4 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 },
  sectionLabel: { fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 },
  eventCard: { background: '#111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 18px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' },
  eventSymbol: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  eventTitle: { fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  eventMeta: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  editButton: { background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 100, padding: '8px 18px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' },
  input: { width: '100%', background: '#111', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px', color: '#fff', fontSize: 14, boxSizing: 'border-box', marginBottom: 10 },
  counter: { fontSize: 10, color: 'rgba(255,255,255,0.2)', marginBottom: 16, marginTop: -6 },
  saveButton: { background: '#fff', color: '#000', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, cursor: 'pointer', marginRight: 8 },
  cancelButton: { background: 'none', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 24px', color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.2)', fontSize: 14, lineHeight: 1.7 },
  signOut: { marginTop: 48, padding: '10px 20px', background: 'none', border: '0.5px solid rgba(207,122,122,0.3)', borderRadius: 12, color: '#CF7A7A', cursor: 'pointer' },
}