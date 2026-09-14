'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignInPage() {
  const router = useRouter()
  const [step, setStep] = useState<'phone'|'otp'|'name'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['','','','','',''])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const otpRefs = useRef<(HTMLInputElement|null)[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push(sessionStorage.getItem('redirectAfterLogin') || '/')
    })
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown(p => p - 1), 1000)
    return () => clearInterval(t)
  }, [countdown])

  const sendOTP = async () => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length !== 10) { setError('enter a valid 10-digit number'); return }
    setLoading(true); setError('')
    try {
      const { error: err } = await supabase.auth.signInWithOtp({ phone: '+91' + cleaned })
      if (err) { setError(err.message); return }
      setStep('otp'); setCountdown(30)
    } catch { setError('connection failed. try again.') }
    finally { setLoading(false) }
  }

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return
    const n = [...otp]; n[i] = v.slice(-1); setOtp(n)
    if (v && i < 5) otpRefs.current[i+1]?.focus()
    if (n.every(d => d) && i === 5) verifyOTP(n.join(''))
  }

  const verifyOTP = async (token?: string) => {
    const code = token || otp.join('')
    if (code.length !== 6) { setError('enter the 6-digit code'); return }
    setLoading(true); setError('')
    try {
      const { data, error: err } = await supabase.auth.verifyOtp({
        phone: '+91' + phone.replace(/\D/g,''),
        token: code, type: 'sms'
      })
      if (err) { setError('incorrect code. try again.'); setOtp(['','','','','','']); otpRefs.current[0]?.focus(); return }

      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', data.user.id).single()
        if (!profile || profile.full_name === 'Afterly User') { setStep('name'); return }
      }

      const redirect = sessionStorage.getItem('redirectAfterLogin') || '/'
      sessionStorage.removeItem('redirectAfterLogin')
      router.push(redirect)
    } catch { setError('verification failed. try again.') }
    finally { setLoading(false) }
  }

  const saveName = async () => {
    if (!name.trim()) { setError('enter your name'); return }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('profiles').upsert({ id: user.id, full_name: name.trim(), phone: '+91' + phone })
    const redirect = sessionStorage.getItem('redirectAfterLogin') || '/'
    sessionStorage.removeItem('redirectAfterLogin')
    router.push(redirect)
  }

  const s = {
    page: { minHeight:'100vh', background:'#000', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif', padding:'24px' } as any,
    card: { width:'100%', maxWidth:420 } as any,
    logo: { fontSize:20, color:'#C9A050', fontWeight:500, marginBottom:48, display:'flex', alignItems:'center', gap:10 } as any,
    h1: { fontSize:40, fontWeight:700, color:'#fff', letterSpacing:-2, marginBottom:8, lineHeight:1.1 } as any,
    sub: { fontSize:15, color:'rgba(255,255,255,0.4)', marginBottom:40, lineHeight:1.6 } as any,
    input: { width:'100%', background:'#111', border:'0.5px solid rgba(255,255,255,0.12)', borderRadius:14, padding:'16px 18px', color:'#fff', fontSize:16, fontFamily:'Inter,sans-serif', outline:'none', boxSizing:'border-box' } as any,
    btn: { width:'100%', background:'#fff', color:'#000', border:'none', borderRadius:14, padding:16, fontSize:15, fontWeight:500, cursor:'pointer', marginTop:12, fontFamily:'Inter,sans-serif', opacity:loading?0.7:1 } as any,
    err: { color:'#CF7A7A', fontSize:13, marginTop:8, lineHeight:1.5 } as any,
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>✦ afterly</div>

        {step === 'phone' && <>
          <h1 style={s.h1}>welcome back.</h1>
          <p style={s.sub}>enter your phone number to continue.</p>
          <div style={{display:'flex',background:'#111',border:'0.5px solid rgba(255,255,255,0.12)',borderRadius:14,overflow:'hidden'}}>
            <div style={{padding:'16px 18px',color:'rgba(255,255,255,0.5)',fontSize:16,borderRight:'0.5px solid rgba(255,255,255,0.08)',whiteSpace:'nowrap'}}>+91</div>
            <input
              type="tel" inputMode="numeric" maxLength={10}
              value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
              onKeyDown={e=>e.key==='Enter'&&sendOTP()}
              placeholder="enter 10-digit number"
              style={{...s.input,border:'none',borderRadius:0}}
            />
          </div>
          {error && <div style={s.err}>{error}</div>}
          <button onClick={sendOTP} disabled={loading||phone.length!==10} style={{...s.btn,opacity:loading||phone.length!==10?0.5:1}}>
            {loading ? 'sending...' : 'send otp →'}
          </button>
          <div style={{marginTop:24,fontSize:12,color:'rgba(255,255,255,0.2)',textAlign:'center',lineHeight:1.6}}>
            by continuing you agree to our terms and privacy policy
          </div>
        </>}

        {step === 'otp' && <>
          <h1 style={s.h1}>check your messages.</h1>
          <p style={s.sub}>we sent a 6-digit code to +91 {phone.slice(0,5)}●●●●●</p>
          <div style={{display:'flex',gap:8,marginBottom:16}}>
            {otp.map((d,i) => (
              <input
                key={i} ref={el=>{otpRefs.current[i]=el}}
                type="tel" inputMode="numeric" maxLength={1} value={d}
                onChange={e=>handleOtpChange(i,e.target.value)}
                onKeyDown={e=>{if(e.key==='Backspace'&&!d&&i>0)otpRefs.current[i-1]?.focus()}}
                style={{
                  flex:1,height:60,textAlign:'center',fontSize:24,fontWeight:500,
                  background:'#111',border:`0.5px solid ${d?'rgba(255,255,255,0.4)':'rgba(255,255,255,0.1)'}`,
                  borderRadius:12,color:'#fff',fontFamily:'Inter,sans-serif',outline:'none'
                }}
              />
            ))}
          </div>
          {error && <div style={s.err}>{error}</div>}
          <button onClick={()=>verifyOTP()} disabled={loading} style={s.btn}>
            {loading ? 'verifying...' : 'verify →'}
          </button>
          <div style={{marginTop:16,textAlign:'center',fontSize:13,color:'rgba(255,255,255,0.3)'}}>
            {countdown > 0 ? `resend in ${countdown}s` : (
              <span onClick={sendOTP} style={{cursor:'pointer',color:'rgba(255,255,255,0.5)'}}>
                resend otp
              </span>
            )}
          </div>
        </>}

        {step === 'name' && <>
          <h1 style={s.h1}>what should we call you?</h1>
          <p style={s.sub}>just your first name is fine.</p>
          <input
            type="text" placeholder="your name" value={name}
            onChange={e=>setName(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&saveName()}
            style={s.input}
          />
          {error && <div style={s.err}>{error}</div>}
          <button onClick={saveName} disabled={loading||!name.trim()} style={{...s.btn,opacity:loading||!name.trim()?0.5:1}}>
            {loading ? 'saving...' : "let's go →"}
          </button>
        </>}
      </div>
    </div>
  )
}
