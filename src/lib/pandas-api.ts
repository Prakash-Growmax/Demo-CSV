export async function getResponse(prompt: string, response) {
  console.log("🚀 ~ getResponse ~ response:", response);
  console.log("🚀 ~ getResponse ~ prompt:", prompt);
  const promptLower = prompt.toLowerCase();
  try {
    if (true) {
      if (true) {
        return createImgResponse("bar", response?.charts);
        return createChartResponse("bar", response?.charts?.bar);
      } else if (promptLower.includes("line")) {
        return createChartResponse("line", response?.charts?.line);
      } else if (promptLower.includes("pie")) {
        return createChartResponse("pie", response?.charts?.pie);
      }

      // Default to bar chart if no specific type mentioned
      return createChartResponse("bar", response);
    }

    if (promptLower.includes("table")) {
      return {
        id: Date.now().toString(),
        content: "Here's a detailed table of the data:",
        role: "assistant",
        timestamp: new Date(),
        type: "table",
        data: {
          headers: response?.table?.headers,
          rows: response?.table?.data,
        },
      };
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
    return createTextResponse(response?.text?.content);
  } catch (error) {
    return createTextResponse(
      error instanceof Error
        ? error.message
        : "An error occurred while processing your request."
    );
  }
}

function createTextResponse(content: string) {
  return {
    id: Date.now().toString(),
    content,
    role: "assistant",
    timestamp: new Date(),
    type: "text",
  };
}

function createChartResponse(type, response) {
  return {
    id: Date.now().toString(),
    content: `Here's a ${type} chart showing the ${response.title.toLowerCase()}:`,
    role: "assistant",
    timestamp: new Date(),
    type: "chart",
    data: {
      type: response.type,
      title: response.title,
      xAxis: response.xAxis || null,
      yAxis: response.yAxis || null,
      data: response.data,
    },
  };
}

function createImgResponse(type, response) {
  return {
    id: Date.now().toString(),
    content: `Here's a ${type} chart showing the response:`,
    role: "assistant",
    timestamp: new Date(),
    type: "chart",
    data: response?.bar,
  };
}
