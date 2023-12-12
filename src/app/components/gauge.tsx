import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import './gauge.css';

const gaugeChartText = {
  id: 'gaugeChartText',
  afterDatasetsDraw: (chart: any) => {
    const {
      ctx,
      data,
      chartArea: { height },
    } = chart;
    ctx.save();

    const xCoor = chart.getDatasetMeta(0).data[0].x;
    const yCoor = chart.getDatasetMeta(0).data[0].y;

    const score = data.datasets[0].data[0];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = `${height / 4}px sans-serif`;
    ctx.fillText(`${score}%`, xCoor, yCoor);
  },
};

const getColor = (value: number, invert = false) => {
  // value from 0 to 1
  let num = value / 100;
  if (invert) {
    num = 1 - num;
  }
  const hue = (num * 120).toString(10);
  return ['hsl(', hue, ',100%,50%)'].join('');
};

export default function Gauge(props: any) {
  const { percentage, invert, title } = props;
  const data = {
    labels: ['Used', 'Unused'],
    datasets: [
      {
        label: 'Gauge',
        data: [percentage, 100 - percentage],
        backgroundColor: [getColor(percentage, invert), 'rgb(0, 0, 0, 0.2)'],
        hoverOffset: 4,
      },
    ],
  };
  return (
    <div className="gauge-container">
      <Doughnut
        data={data}
        options={{
          cutout: '80%',
          circumference: 180,
          rotation: 270,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: title,
              position: 'bottom',
            },
            tooltip: {
              enabled: false,
            },
          },
        }}
        plugins={[gaugeChartText]}
      />
    </div>
  );
}
