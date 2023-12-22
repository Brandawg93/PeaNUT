import Wrapper from '@/client/components/wrapper'

export default function Home({ params }: { params: any }) {
  return <Wrapper lng={params.lng || 'en'} />
}
