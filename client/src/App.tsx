import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import 'gridjs/dist/theme/mermaid.min.css';
import 'chart.js/auto';
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import Wrapper from './wrapper';
import './App.css';
import NavBar from './navbar';

Chart.register(annotationPlugin);

const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <NavBar />
      <Wrapper />
    </ApolloProvider>
  );
}

export default App;
