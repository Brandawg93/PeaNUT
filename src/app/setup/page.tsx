import { authStorage } from '@/server/auth-storage'
import { redirect } from 'next/navigation'
import SetupClientPage from './setup-client'

export default function SetupPage() {
  let shouldRedirectToLogin = false
  try {
    shouldRedirectToLogin = authStorage.hasUser()
  } catch (error) {
    // If there is an error accessing auth storage (e.g., corrupted auth.yaml),
    // stay on the setup page to allow the user to fix the issue.
    console.error('PeaNUT: Error checking for initial user:', error)
    shouldRedirectToLogin = false
  }

  if (shouldRedirectToLogin) {
    redirect('/login')
  }

  return <SetupClientPage />
}
