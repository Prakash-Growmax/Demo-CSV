import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Data transformer function with default values and type checking
const transformChartData = (chartData = {}) => {
  if (!chartData || typeof chartData !== "object") {
    return {
      data: [],
      title: "",
      xAxisLabel: "",
      yAxisLabel: "",
      formatValue: (val) => val,
    };
  }

  const { data = [], title = "", xAxis = {}, yAxis = {} } = chartData;

  // Format numbers for tooltip
  const formatValue = (value) => {
    if (typeof value !== "number") return "0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Transform data with type checking
  const transformedData = Array.isArray(data)
    ? data.map((item) => ({
        category: item?.x || "",
        value: typeof item?.y === "number" ? item.y : 0,
      }))
    : [];

  return {
    data: transformedData,
    title: title || "",
    xAxisLabel: xAxis?.title || "",
    yAxisLabel: yAxis?.title || "",
    formatValue,
  };
};

const CustomTooltip = ({ active, payload, label, formatValue }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-blue-600 dark:text-blue-400">
          {formatValue(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function LineChart({ chartData }) {
  const { data, title, xAxisLabel, yAxisLabel, formatValue } =
    transformChartData(chartData);

  // If no data, show a message
  if (!data.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No data available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-gray-500">
            No chart data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 40,
                bottom: 40,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-700"
              />
              <XAxis
                dataKey="category"
                label={{
                  value: xAxisLabel,
                  position: "bottom",
                  offset: 0,
                }}
                angle={-45}
                textAnchor="end"
                height={80}
                className="text-sm"
              />
              <YAxis
                label={{
                  value: yAxisLabel,
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                }}
                tickFormatter={formatValue}
                className="text-sm"
              />
              <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "#3b82f6",
                  strokeWidth: 2,
                  stroke: "#fff",
                }}
                activeDot={{
                  r: 6,
                  stroke: "#3b82f6",
                  strokeWidth: 2,
                  fill: "#fff",
                }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default LineChart;
