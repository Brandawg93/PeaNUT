import { authStorage } from '@/server/auth-storage'
import { redirect } from 'next/navigation'
import SetupClientPage from './setup-client'

export default function SetupPage() {
  if (authStorage.hasUser()) {
    redirect('/login')
  }

  return <SetupClientPage />
}
