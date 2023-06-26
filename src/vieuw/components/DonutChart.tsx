import React from "react";
import { Doughnut } from "react-chartjs-2";
import { ChartOptions } from "chart.js";

interface DonutChartProps {
  labels: string[];
  data: number[];
}

const DonutChart: React.FC<DonutChartProps> = ({ labels, data }) => {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: ["#36A2EB", "#FF6384"], // Example colors, you can customize these
        borderWidth: 0,
      },
    ],
  };

  const options: ChartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
};

export default DonutChart;
