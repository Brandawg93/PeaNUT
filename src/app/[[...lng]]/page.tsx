'use client'

import { ApolloProvider } from '@apollo/client'
import { Chart } from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'

import createApolloClient from '@/client/lib/client'
import Wrapper from '@/client/components/wrapper'

// eslint-disable-next-line import/no-extraneous-dependencies
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-svg-core/styles.css'
import 'gridjs/dist/theme/mermaid.min.css'
import 'chart.js/auto'

Chart.register(annotationPlugin)

export default function Home({ params }: { params: any }) {
  const client = createApolloClient()

  return (
    <ApolloProvider client={client}>
      <Wrapper lng={params.lng} />
    </ApolloProvider>
  )
}
