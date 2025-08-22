import React from 'react'
import { Card } from '@/client/components/ui/card'
import { Skeleton } from '@/client/components/ui/skeleton'

export const ServersSkeleton = () => (
  <Card className='p-4 shadow-none'>
    <div className='container'>
      <Skeleton className='mb-4 h-8 w-48' />
      <div className='mb-4'>
        <Skeleton className='h-4 w-96' />
      </div>
      <div className='space-y-4'>
        <Card className='border-border bg-card w-full gap-0 border pt-0 shadow-none'>
          <div className='flex justify-between p-2'>
            <Skeleton className='h-3 w-3 rounded-full' />
            <Skeleton className='h-6 w-6' />
          </div>
          <div className='space-y-6 px-6'>
            <div>
              <Skeleton className='mb-2 h-4 w-16' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div>
              <Skeleton className='mb-2 h-4 w-12' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div>
              <Skeleton className='mb-2 h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div>
              <Skeleton className='mb-2 h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='flex justify-end'>
              <Skeleton className='h-10 w-20' />
            </div>
          </div>
        </Card>
        <div className='text-center'>
          <Skeleton className='mx-auto h-10 w-10 rounded-full' />
        </div>
      </div>
    </div>
    <div className='flex flex-row justify-between'>
      <div />
      <Skeleton className='h-10 w-20' />
    </div>
  </Card>
)

export const InfluxSkeleton = () => (
  <Card className='p-4 shadow-none'>
    <div className='container'>
      <Skeleton className='mb-4 h-8 w-48' />
      <div className='mb-4'>
        <Skeleton className='h-4 w-96' />
      </div>
      <Card className='border-border bg-card mt-1 mb-4 w-full gap-0 border pt-0 pl-6 shadow-none'>
        <div className='space-y-6 pt-6 pr-6'>
          <div>
            <Skeleton className='mb-2 h-4 w-16' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div>
            <Skeleton className='mb-2 h-4 w-16' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div>
            <Skeleton className='mb-2 h-4 w-12' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div>
            <Skeleton className='mb-2 h-4 w-16' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div>
            <Skeleton className='mb-2 h-4 w-32' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='flex flex-row justify-between'>
            <Skeleton className='h-10 w-20' />
            <Skeleton className='h-10 w-20' />
          </div>
        </div>
      </Card>
    </div>
    <div className='flex flex-row justify-between'>
      <div />
      <Skeleton className='h-10 w-20' />
    </div>
  </Card>
)

export const ConfigSkeleton = () => (
  <Card className='p-4 shadow-none'>
    <div className='container'>
      <Skeleton className='mb-4 h-8 w-48' />
      <Skeleton className='mb-4 h-4 w-96' />
      <Skeleton className='mb-4 h-12 w-full' />
      <Skeleton className='mb-4 h-96 w-full' />
      <div className='flex flex-row gap-2'>
        <Skeleton className='h-10 w-24' />
        <Skeleton className='h-10 w-32' />
      </div>
    </div>
  </Card>
)

export const TerminalSkeleton = () => (
  <Card className='p-4 shadow-none'>
    <div className='container'>
      <Skeleton className='mb-4 h-8 w-48' />
      <Skeleton className='mb-4 h-4 w-96' />
      <div className='mt-4 mb-4 flex gap-2'>
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-10 w-24' />
      </div>
      <Skeleton className='h-96 w-full' />
    </div>
  </Card>
)

export const GeneralSkeleton = () => (
  <Card className='p-4 shadow-none'>
    <div className='container'>
      <Skeleton className='mb-4 h-8 w-48' />
      <div className='mb-4'>
        <Skeleton className='h-4 w-96' />
      </div>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-10 w-3/4' />
        </div>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-10 w-3/4' />
        </div>
      </div>
    </div>
    <div className='mt-4 flex flex-row justify-between'>
      <div />
      <Skeleton className='h-10 w-20' />
    </div>
  </Card>
)

export const DashboardSkeleton = () => (
  <Card className='p-4 shadow-none'>
    <div className='container'>
      <Skeleton className='mb-4 h-8 w-48' />
      <div className='mb-4'>
        <Skeleton className='h-4 w-96' />
      </div>
      <div className='flex flex-col items-center gap-2'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='flex w-full max-w-xl items-center gap-3 rounded-md border p-2'>
            <Skeleton className='h-4 w-4' />
            <Skeleton className='h-4 flex-1' />
            <Skeleton className='h-6 w-11' />
          </div>
        ))}
      </div>
    </div>
    <div className='mt-4 flex flex-row justify-between'>
      <div />
      <Skeleton className='h-10 w-20' />
    </div>
  </Card>
)
