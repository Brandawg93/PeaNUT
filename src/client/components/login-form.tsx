'use client'

import React, { useActionState, useContext } from 'react'
import { HiArrowRight, HiOutlineExclamationCircle } from 'react-icons/hi2'
import { Button } from '@/client/components/ui/button'
import { authenticate } from '@/app/actions'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/client/components/ui/card'
import { Label } from '@/client/components/ui/label'
import { Input } from '@/client/components/ui/input'
import PasswordInput from '@/client/components/ui/password-input'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '../context/language'

export default function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined)
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)

  return (
    <Card className='border-border bg-card p-6 shadow-none'>
      <form action={formAction} className='w-full'>
        <div className='mb-4'>
          <h1 className='mb-6 text-2xl'>{t('login.title')}</h1>
          <div className='mb-4'>
            <Label htmlFor='username'>{t('login.username')}</Label>
            <div className='flex'>
              <Input
                className='border-border-card bg-background! z-10 mt-1 px-3 py-2'
                id='username'
                name='username'
                placeholder={t('login.usernamePlaceholder')}
                required
              />
            </div>
          </div>
          <div className='mb-6'>
            <Label htmlFor='password'>{t('login.password')}</Label>
            <PasswordInput
              id='password'
              name='password'
              placeholder={t('login.passwordPlaceholder')}
              required
              minLength={6}
            />
          </div>
          <input type='hidden' name='redirectTo' value={callbackUrl} />
          <div className='flex flex-row justify-end'>
            <Button className='font-bold shadow-none' aria-disabled={isPending} data-testid='login-button'>
              {t('login.submit')} <HiArrowRight className='ml-2 h-5 w-5' />
            </Button>
          </div>
          <div className='flex h-8 items-end space-x-1' aria-live='polite' aria-atomic='true'>
            {errorMessage && (
              <>
                <HiOutlineExclamationCircle className='text-destructive h-5 w-5' />
                <p className='text-destructive text-sm'>{errorMessage}</p>
              </>
            )}
          </div>
        </div>
      </form>
    </Card>
  )
}
