import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import 'gridjs/dist/theme/mermaid.min.css';
import 'chart.js/auto';
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import Wrapper from './wrapper';
import './App.css';

Chart.register(annotationPlugin);

const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Wrapper />
    </ApolloProvider>
  );
}

export default App;
