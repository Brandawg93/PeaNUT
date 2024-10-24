import React from 'react'
import { getApiDocs } from '@/app/api/swagger'
import ReactSwagger from './react-swagger'

export default async function IndexPage() {
  const spec = await getApiDocs()
  return <ReactSwagger spec={spec} />
}
