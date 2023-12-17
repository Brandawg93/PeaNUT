import { ApolloClient, InMemoryCache } from '@apollo/client'

const createApolloClient = () =>
  new ApolloClient({
    uri: '/api/graphql',
    cache: new InMemoryCache(),
  })

export default createApolloClient
