import React from 'react'
import type { Metadata } from 'next'
import { getApiDocs } from '@/app/api/swagger'
import ReactSwagger from './react-swagger'
import { logout } from '@/app/actions'

export const metadata: Metadata = {
  title: 'PeaNUT API',
}

export default async function IndexPage() {
  const spec = await getApiDocs()
  return <ReactSwagger spec={spec} onLogout={logout} />
}
