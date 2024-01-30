import { getApiDocs } from '@/app/api/swagger'
import ReactSwagger from './react-swagger'

export default async function IndexPage() {
  const spec = await getApiDocs()
  return (
    <section className='container'>
      <ReactSwagger spec={spec} />
    </section>
  )
}
