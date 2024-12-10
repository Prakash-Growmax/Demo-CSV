import { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ChartProps } from '@/types';
import { useTheme } from '@/hooks/useTheme';

export function AreaChart({ data }: ChartProps) {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const { theme } = useTheme();

  const options: Highcharts.Options = {
    chart: {
      type: 'area',
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'inherit'
      }
    },
    title: {
      text: undefined
    },
    xAxis: {
      categories: data.map(item => item.name),
      labels: {
        style: {
          color: theme === 'dark' ? '#fff' : '#000'
        }
      }
    },
    yAxis: {
      title: {
        text: 'Value',
        style: {
          color: theme === 'dark' ? '#fff' : '#000'
        }
      },
      labels: {
        style: {
          color: theme === 'dark' ? '#fff' : '#000'
        }
      }
    },
    series: [{
      name: 'Value',
      data: data.map(item => item.value),
      type: 'area',
      color: '#8884d8',
      fillOpacity: 0.3
    }],
    credits: {
      enabled: false
    },
    plotOptions: {
      area: {
        marker: {
          enabled: false
        }
      }
    }
  };

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.chart.reflow();
    }
  }, [data]);

  return (
    <div className="w-full h-[300px]">
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        ref={chartRef}
      />
    </div>
  );
}