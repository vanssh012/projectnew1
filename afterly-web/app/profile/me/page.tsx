'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function MyProfile() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        sessionStorage.setItem('redirectAfterLogin', '/profile/me')
        router.push('/signin')
        return
      }
      router.replace(`/profile/${user.id}`)
    })
  }, [router])

  return <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #C9A050', animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
}