'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { fetchEventById } from '@/lib/fetchEvents'

export default function HostDashboard() {
  const params = useParams()
  const router = useRouter()
  const eventId = params?.eventId as string
  const [event, setEvent] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('requests')

  useEffect(() => {
    if (!eventId) return

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
        router.push('/signin')
        return
      }

      const eventData = await fetchEventById(eventId)
      if (!eventData) {
        setLoading(false)
        return
      }
      setEvent(eventData)

      const { data: ticketData } = await supabase
        .from('tickets')
        .select('*, profiles(full_name, college, phone)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      setTickets(ticketData || [])
      setLoading(false)
    }

    load()
  }, [eventId])

  const approve = async (ticketId: string) => {
    const qr_code = crypto.randomUUID()
    await supabase
      .from('tickets')
      .update({ status: 'approved', qr_code })
      .eq('id', ticketId)
    setTickets(prev => prev.map(t =>
      t.id === ticketId ? { ...t, status: 'approved', qr_code } : t
    ))
  }

  const reject = async (ticketId: string) => {
    await supabase
      .from('tickets')
      .update({ status: 'rejected' })
      .eq('id', ticketId)
    setTickets(prev => prev.map(t =>
      t.id === ticketId ? { ...t, status: 'rejected' } : t
    ))
  }

  if (loading) return <LoadingScreen />
  if (!event) return (
    <div style={{minHeight:'100vh',background:'#000',display:'flex',
      alignItems:'center',justifyContent:'center',flexDirection:'column',
      fontFamily:'Inter,sans-serif',gap:16}}>
      <div style={{color:'#CF7A7A',fontSize:16}}>event not found.</div>
      <button onClick={()=>router.push('/')} style={{
        color:'rgba(255,255,255,0.4)',background:'none',border:'none',
        cursor:'pointer',fontSize:14}}>go home</button>
    </div>
  )

  const pending = tickets.filter(t => t.status === 'pending')
  const approved = tickets.filter(t => t.status === 'approved')
  const revenue = approved.length * (event.ticket_price / 100)

  return (
    <div style={{minHeight:'100vh',background:'#000',
      fontFamily:'Inter,sans-serif',padding:'24px 16px',maxWidth:800,margin:'0 auto'}}>

      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',
          letterSpacing:2,textTransform:'uppercase',marginBottom:8}}>
          host dashboard
        </div>
        <div style={{fontSize:24,fontWeight:500,color:'#fff',marginBottom:4}}>
          {event.title}
        </div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.4)'}}>
          {event.venue} · {new Date(event.event_date).toLocaleDateString('en-IN',{
            day:'numeric',month:'short',year:'numeric'
          })}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',
        gap:12,marginBottom:32}}>
        {[
          {label:'requests',value:pending.length,color:'#C9A050'},
          {label:'approved',value:approved.length,color:'#8ECF7A'},
          {label:'spots left',value:event.max_guests-approved.length,color:'#5ABFCF'},
          {label:'revenue',value:`₹${revenue}`,color:'#fff'},
        ].map(s => (
          <div key={s.label} style={{background:'#111',border:'0.5px solid rgba(255,255,255,0.08)',
            borderRadius:14,padding:'16px 20px'}}>
            <div style={{fontSize:24,fontWeight:500,color:s.color}}>{s.value}</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',
              textTransform:'uppercase',letterSpacing:1,marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:24,borderBottom:'0.5px solid rgba(255,255,255,0.08)',
        marginBottom:24}}>
        {['requests','approved','details'].map(tab => (
          <button key={tab} onClick={()=>setActiveTab(tab)} style={{
            background:'none',border:'none',cursor:'pointer',
            fontSize:14,padding:'0 0 12px',
            color: activeTab===tab ? '#fff' : 'rgba(255,255,255,0.3)',
            borderBottom: activeTab===tab ? '2px solid #fff' : '2px solid transparent',
            fontFamily:'Inter,sans-serif',fontWeight: activeTab===tab ? 500 : 400
          }}>
            {tab} {tab==='requests' && pending.length>0 && `(${pending.length})`}
            {tab==='approved' && approved.length>0 && `(${approved.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'requests' && (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {pending.length === 0 ? (
            <div style={{textAlign:'center',padding:'48px 0',
              color:'rgba(255,255,255,0.2)',fontSize:14}}>
              no pending requests yet. share your event!
            </div>
          ) : pending.map(t => (
            <div key={t.id} style={{background:'#111',
              border:'0.5px solid rgba(255,255,255,0.08)',
              borderRadius:14,padding:'16px 20px',
              display:'flex',alignItems:'center',gap:16}}>
              <div style={{width:40,height:40,borderRadius:'50%',
                background:'rgba(255,255,255,0.06)',display:'flex',
                alignItems:'center',justifyContent:'center',
                fontSize:14,fontWeight:500,color:'#fff',flexShrink:0}}>
                {(t.profiles?.full_name || 'U')[0].toUpperCase()}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:500,color:'#fff',marginBottom:2}}>
                  {t.profiles?.full_name || 'Unknown'}
                </div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>
                  {t.profiles?.college || ''}
                </div>
                {t.message_to_host && (
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.3)',
                    fontStyle:'italic',marginTop:4}}>
                    "{t.message_to_host}"
                  </div>
                )}
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>approve(t.id)} style={{
                  background:'#fff',color:'#000',border:'none',
                  borderRadius:100,padding:'8px 20px',fontSize:13,
                  fontWeight:500,cursor:'pointer'}}>
                  approve
                </button>
                <button onClick={()=>reject(t.id)} style={{
                  background:'transparent',color:'rgba(255,255,255,0.4)',
                  border:'0.5px solid rgba(255,255,255,0.15)',
                  borderRadius:100,padding:'8px 20px',fontSize:13,cursor:'pointer'}}>
                  reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'approved' && (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {approved.length === 0 ? (
            <div style={{textAlign:'center',padding:'48px 0',
              color:'rgba(255,255,255,0.2)',fontSize:14}}>
              no approved guests yet.
            </div>
          ) : approved.map(t => (
            <div key={t.id} style={{background:'#111',
              border:'0.5px solid rgba(142,207,122,0.2)',
              borderRadius:14,padding:'16px 20px',
              display:'flex',alignItems:'center',gap:16}}>
              <div style={{width:8,height:8,borderRadius:'50%',
                background:'#8ECF7A',flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:500,color:'#fff'}}>
                  {t.profiles?.full_name || 'Unknown'}
                </div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>
                  {t.profiles?.college || ''} · {t.status}
                </div>
              </div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.2)',
                fontFamily:'monospace'}}>
                QR: {t.qr_code?.slice(0,8)}...
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'details' && (
        <div style={{color:'rgba(255,255,255,0.6)',fontSize:14,lineHeight:1.8}}>
          <div><span style={{color:'rgba(255,255,255,0.3)'}}>category: </span>{event.category}</div>
          <div><span style={{color:'rgba(255,255,255,0.3)'}}>venue: </span>{event.venue}</div>
          <div><span style={{color:'rgba(255,255,255,0.3)'}}>city: </span>{event.city}</div>
          <div><span style={{color:'rgba(255,255,255,0.3)'}}>date: </span>
            {new Date(event.event_date).toLocaleDateString('en-IN',{
              weekday:'long',day:'numeric',month:'long',year:'numeric'
            })}
          </div>
          <div><span style={{color:'rgba(255,255,255,0.3)'}}>price: </span>
            {event.ticket_price===0 ? 'free' : `₹${event.ticket_price/100}`}
          </div>
          <div><span style={{color:'rgba(255,255,255,0.3)'}}>capacity: </span>{event.max_guests}</div>
          <div><span style={{color:'rgba(255,255,255,0.3)'}}>access: </span>{event.access_type}</div>
        </div>
      )}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{minHeight:'100vh',background:'#000',display:'flex',
      alignItems:'center',justifyContent:'center'}}>
      <div style={{width:32,height:32,borderRadius:'50%',
        border:'2px solid rgba(255,255,255,0.1)',
        borderTop:'2px solid #C9A050',
        animation:'spin 0.8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
