'use server'

import { authStorage } from '@/server/auth-storage'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const setupSchema = z.object({
  username: z.string().min(1, 'setup.errorUsernameRequired'),
  password: z.string().min(5, 'setup.passwordHint'),
})

export async function createInitialUser(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  const result = setupSchema.safeParse({ username, password })

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  if (authStorage.hasUser()) {
    return { error: 'setup.errorUserExists' }
  }

  const success = await authStorage.setAuthUser(username, password)

  if (success) {
    redirect('/login')
  } else {
    return { error: 'setup.errorSaveFailed' }
  }
}
