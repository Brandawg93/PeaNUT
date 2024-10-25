import React from 'react'
import type { Metadata } from 'next'
import { getApiDocs } from '@/app/api/swagger'
import ReactSwagger from './react-swagger'

export const metadata: Metadata = {
  title: 'PeaNUT API',
}

export default async function IndexPage() {
  const spec = await getApiDocs()
  return <ReactSwagger spec={spec} />
}
