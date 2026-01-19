'use client'

import { useState, useContext } from 'react'
import { createInitialUser } from './actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/client/components/ui/card'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import logo from '@/app/icon.svg'
import Image from 'next/image'
import { UserPlus } from 'lucide-react'

export default function SetupClientPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const result = await createInitialUser(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className='bg-background flex min-h-screen items-center justify-center p-4'>
      <Card className='border-border bg-card text-foreground w-full max-w-md shadow-none'>
        <CardHeader className='space-y-1'>
          <div className='flex items-center justify-center pb-4'>
            <Image alt='' src={logo} width='100' height='100' className='d-inline-block align-top' />
          </div>
          <CardTitle className='text-center text-2xl font-bold'>{t('setup.title')}</CardTitle>
          <CardDescription className='text-muted-foreground text-center'>{t('setup.description')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className='space-y-4'>
            {error && <div className='rounded-md bg-red-500/10 p-3 text-sm text-red-500'>{t(error)}</div>}
            <div className='space-y-2'>
              <Label htmlFor='username'>{t('setup.username')}</Label>
              <Input
                id='username'
                name='username'
                type='text'
                required
                className='border-border bg-background px-3 py-2'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>{t('setup.password')}</Label>
              <Input
                id='password'
                name='password'
                type='password'
                required
                className='border-border bg-background px-3 py-2'
              />
              <p className='text-muted-foreground text-xs'>{t('setup.passwordHint')}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type='submit' className='w-full font-bold shadow-none' disabled={loading}>
              {loading ? (
                t('setup.submitting')
              ) : (
                <>
                  <UserPlus className='mr-2 h-4 w-4' />
                  {t('setup.submit')}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
