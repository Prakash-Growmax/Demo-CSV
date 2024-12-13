import { ChartData } from "@/types";

interface DataChartProps {
  data: ChartData;
}

export function DataChart({ data }: DataChartProps) {

  const renderChart = () => {
    return (
      <div
        style={{ width: "90%", height: "auto" }}
        dangerouslySetInnerHTML={{
          __html: data,
        }}
      />
    );
    switch (data.type) {
      // case "bar":
      //   return <EnhancedBarChart chartData={data} />;
      // case "line":
      //   return <LineChart chartData={data} />;
      // case "pie":
      //   return <PieChart chartData={data} />;
      // default:
      //   return null;

      case "bar":
        return (
          <div
            style={{ width: "100%", height: "400px" }}
            dangerouslySetInnerHTML={{
              __html: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="red" />
                </svg>
              `,
            }}
          />
        );
      case "pie":
        return <div dangerouslySetInnerHTML={{ __html: data }} />;
      default:
        return null;
    }
  };

  return <div className="w-full">{renderChart()}</div>;
}
