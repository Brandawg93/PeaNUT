'use client'

import React from 'react'
import { Button } from '@/client/components/ui/button'
import { Card } from '@/client/components/ui/card'
import { HiOutlineBell, HiOutlineBellSlash, HiOutlinePlay, HiOutlineStop } from 'react-icons/hi2'
import { useUPSNotifications } from '@/client/hooks/useUPSNotifications'

export default function UPSNotificationControls() {
  const { isSupported, isRegistered, isPolling, permission, startPolling, stopPolling, requestPermission } =
    useUPSNotifications()

  if (!isSupported) {
    return (
      <Card className='mb-4 border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20'>
        <div className='flex items-center gap-2'>
          <HiOutlineBellSlash className='text-yellow-600 dark:text-yellow-400' />
          <span className='text-sm text-yellow-800 dark:text-yellow-200'>
            Service Workers are not supported in this browser.
          </span>
        </div>
      </Card>
    )
  }

  if (permission === 'denied') {
    return (
      <Card className='mb-4 border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20'>
        <div className='flex items-center gap-2'>
          <HiOutlineBellSlash className='text-yellow-600 dark:text-yellow-400' />
          <span className='text-sm text-yellow-800 dark:text-yellow-200'>
            Notifications are blocked. Please enable them in your browser settings.
          </span>
        </div>
      </Card>
    )
  }

  return (
    <Card className='mb-4 p-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <HiOutlineBell className='text-primary' />
          <span className='font-medium'>UPS Notifications</span>
          {isPolling && <span className='rounded-full bg-green-100 px-2 py-1 text-xs text-green-800'>Active</span>}
        </div>

        <div className='flex items-center gap-2'>
          {permission === 'default' && (
            <Button variant='outline' size='sm' onClick={requestPermission}>
              Enable Notifications
            </Button>
          )}

          {permission === 'granted' && (
            <>
              {!isPolling ? (
                <Button variant='outline' size='sm' onClick={startPolling} disabled={!isRegistered}>
                  <HiOutlinePlay className='mr-1 h-4 w-4' />
                  Start Monitoring
                </Button>
              ) : (
                <Button variant='outline' size='sm' onClick={stopPolling}>
                  <HiOutlineStop className='mr-1 h-4 w-4' />
                  Stop Monitoring
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {isPolling && (
        <div className='text-muted-foreground mt-2 text-sm'>
          Monitoring UPS devices every 30 seconds. Critical status changes will trigger notifications.
        </div>
      )}
    </Card>
  )
}
