import { Message } from "@/types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function analyzeCSV(file: File): Promise<any[]> {
  await delay(1000);
  return [
    { id: 1, name: "Product A", sales: 100, revenue: 1000 },
    { id: 2, name: "Product B", sales: 150, revenue: 1500 },
    { id: 3, name: "Product C", sales: 200, revenue: 2000 },
  ];
}

export async function getResponse(prompt: string, csvData: any) {
  const promptLower = prompt.toLowerCase();
  try {
    if (promptLower.includes("chart")) {
      if (promptLower.includes("bar")) {
        return createChartResponse("bar", csvData);
      } else if (promptLower.includes("line")) {
        return createChartResponse("line", csvData);
      } else if (promptLower.includes("pie")) {
        return createChartResponse("pie", csvData);
      } else if (promptLower.includes("area")) {
        return createChartResponse("area", csvData);
      }
      // Default to bar chart if no specific type mentioned
      return createChartResponse("bar", csvData);
    }

    if (promptLower.includes("table")) {
      return {
        id: Date.now().toString(),
        content: "Here's a detailed table of the data:",
        role: "assistant",
        timestamp: new Date(),
        type: "table",
        data: {
          headers: ["Name", "Sales", "Revenue"],
          rows: csvData.map((item) => [item.name, item.sales, item.revenue]),
        },
      };
    }

    if (promptLower.includes("revenue")) {
      const totalRevenue = csvData.reduce((acc, curr) => acc + curr.revenue, 0);
      return createTextResponse(
        `The total revenue across all products is $${totalRevenue}.`
      );
    }

    if (promptLower.includes("sales")) {
      const totalSales = csvData.reduce((acc, curr) => acc + curr.sales, 0);
      return createTextResponse(
        `The total sales volume is ${totalSales} units.`
      );
    }

    if (promptLower.includes("help")) {
      return createTextResponse(
        "You can ask me questions about the data such as:\n" +
          "- Show me a bar/line/pie/area chart\n" +
          "- Show me the data in a table\n" +
          "- What are the total sales?\n" +
          "- What is the total revenue?"
      );
    }

    throw new Error(
      "I don't understand that question. Try asking about sales, revenue, or requesting a specific chart type."
    );
  } catch (error) {
    return createTextResponse(
      error instanceof Error
        ? error.message
        : "An error occurred while processing your request."
    );
  }
}

function createChartResponse(
  type: "bar" | "line" | "pie" | "area",
  csvData: any[]
): Message {
  const chartData = csvData.map((item) => ({
    name: item.name,
    value: item.sales,
  }));

  return {
    id: Date.now().toString(),
    content: `Here's a ${type} chart showing the sales distribution:`,
    role: "assistant",
    timestamp: new Date(),
    type: "chart",
    data: {
      type,
      data: chartData,
    },
  };
}

function createTextResponse(content: string): Message {
  return {
    id: Date.now().toString(),
    content,
    role: "assistant",
    timestamp: new Date(),
    type: "text",
  };
}
