'use client'

import React from 'react'
import { Skeleton } from '@/client/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/client/components/ui/table'

type DeviceGridSkeletonProps = {
  rows?: number
}

export default function DeviceGridSkeleton({ rows = 3 }: DeviceGridSkeletonProps) {
  return (
    <Table className='w-full'>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Skeleton className='bg-muted h-6 w-20' />
          </TableHead>
          <TableHead>
            <Skeleton className='bg-muted h-6 w-24' />
          </TableHead>
          <TableHead>
            <Skeleton className='bg-muted h-6 w-16' />
          </TableHead>
          <TableHead>
            <Skeleton className='bg-muted h-6 w-28' />
          </TableHead>
          <TableHead>
            <Skeleton className='bg-muted h-6 w-24' />
          </TableHead>
          <TableHead>
            <Skeleton className='bg-muted h-6 w-20' />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRow key={index}>
            <TableCell className='border-t p-3'>
              <Skeleton className='bg-muted h-4 w-32' />
            </TableCell>
            <TableCell className='border-t p-3'>
              <Skeleton className='bg-muted h-4 w-40' />
            </TableCell>
            <TableCell className='border-t p-3'>
              <div className='flex items-center gap-2'>
                <Skeleton className='bg-muted h-6 w-6 rounded-full' />
                <Skeleton className='bg-muted h-4 w-20' />
              </div>
            </TableCell>
            <TableCell className='border-t p-3'>
              <div className='flex items-center gap-2'>
                <Skeleton className='bg-muted h-2 w-16' />
                <Skeleton className='bg-muted h-4 w-8' />
              </div>
            </TableCell>
            <TableCell className='border-t p-3'>
              <div className='flex items-center gap-2'>
                <Skeleton className='bg-muted h-2 w-16' />
                <Skeleton className='bg-muted h-4 w-8' />
              </div>
            </TableCell>
            <TableCell className='border-t p-3'>
              <Skeleton className='bg-muted h-8 w-20' />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
