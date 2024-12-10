import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// Data transformer function with default values and type checking
const transformChartData = (chartData = {}) => {
  if (!chartData || typeof chartData !== "object") {
    return {
      data: [],
      title: "",
      formatValue: (val) => val,
    };
  }

  const { data = [], title = "" } = chartData;

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
        name: item?.x || "",
        value: typeof item?.y === "number" ? item.y : 0,
      }))
    : [];

  return {
    data: transformedData,
    title: title || "",
    formatValue,
  };
};

// Custom colors for pie slices
const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // yellow
  "#ef4444", // red
  "#8b5cf6", // purple
  "#14b8a6", // teal
  "#f97316", // orange
  "#6366f1", // indigo
  "#ec4899", // pink
  "#84cc16", // lime
];

const CustomTooltip = ({ active, payload, formatValue }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
        <p className="font-medium">{data.name}</p>
        <p className="text-blue-600 dark:text-blue-400">
          {formatValue(data.value)}
        </p>
        <p className="text-gray-500">{`${(data.percent * 100).toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  name,
  percent,
}) => {
  // Calculate position for label
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if percentage is greater than 5%
  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function PieChart({ chartData }) {
  const { data, title, formatValue } = transformChartData(chartData);

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
            <RechartsPieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={150}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value, entry) => (
                  <span className="text-sm dark:text-gray-300">{value}</span>
                )}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default PieChart;
