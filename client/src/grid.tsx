import React from 'react';
import { Grid } from 'gridjs-react';

export default function NutGrid(props: any) {
  const { data } = props;
  let result: any = [];
  if (data?.ups) {
    result = Object.entries(data.ups).map(( [k, v] ) => ({ key: k.replace(/_/g, '.'), value: v }));
    result.shift();
  }

  return (
    <Grid
      data={result || (() => new Promise(() => {}))}
      columns={[
        { name: 'key' },
        { name: 'value' },
      ]}
      sort
    />
  );
}
