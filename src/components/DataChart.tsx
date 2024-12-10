import { ChartData } from "@/types";
import { EnhancedBarChart } from "./charts/BarChart";
import { LineChart } from "./charts/LineChart";
import { PieChart } from "./charts/PieChart";

interface DataChartProps {
  data: ChartData;
}

export function DataChart({ data }: DataChartProps) {
  const renderChart = () => {
    switch (data.type) {
      case "bar":
        return <EnhancedBarChart chartData={data} />;
      case "line":
        return <LineChart chartData={data} />;
      case "pie":
        return <PieChart chartData={data} />;
      default:
        return null;
    }
  };

  return <div className="w-full">{renderChart()}</div>;
}
