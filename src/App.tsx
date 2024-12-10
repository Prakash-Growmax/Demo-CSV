import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { FileUpload } from "@/components/FileUpload";
import { TypingIndicator } from "@/components/TypingIndicator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMessageQueue } from "@/lib/useMessageQueue";
import { ChatState, Message } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Header } from "./components/Header/Header";
import { getResponse } from "./lib/pandas-api";
import { S3UploadError, uploadToS3 } from "./lib/s3-client";

function App() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    csvData: null,
    error: null,
    s3Key: null,
  });

  const { queue, processing, addToQueue, processQueue } = useMessageQueue();

  const handleError = (error: string) => {
    setState((prev) => ({ ...prev, error, csvData: null }));
  };

  const processMessage = useCallback(
    async (message: Message) => {
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, message],
        isLoading: true,
        error: null,
      }));

      try {
        const result = await fetch(
          "https://pandasai-production.up.railway.app/analyze",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
              s3_key: state.s3Key,
              query: message?.content,
            }),
          }
        );
        if (!result.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await result.json();
        console.log("🚀 ~ data:", data);

        const response = await getResponse(
          message.content,
          sample_json?.response!
        );
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, response],
          isLoading: false,
          error: null,
          csvData: sample_json?.response,
        }));
      } catch (error) {
        console.log("🚀 ~ error:", error);
        setState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: Date.now().toString(),
              content: "Unable to respond right now.",
              role: "assistant",
              timestamp: new Date(),
              type: "text",
            },
          ],
          isLoading: false,
        }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.csvData, state.s3Key]
  );

  const handleSendMessage = async (content: string) => {
    if (!state.s3Key) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
      type: "text",
    };

    addToQueue(userMessage);
  };

  useEffect(() => {
    if (!processing && queue.length > 0) {
      processQueue(processMessage);
    }
  }, [processing, queue, processQueue, processMessage]);

  function createNewChat() {
    setState({
      messages: [],
      isLoading: false,
      csvData: null,
      error: null,
      s3Key: null,
    });
  }

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handleFileUpload = useCallback(
    async (
      event: React.ChangeEvent<HTMLInputElement>,
      onFileUploaded: (s3Key: string) => void
    ) => {
      const file = event.target.files?.[0];
      if (!file) return; // Early exit if no file selected

      setFileName(file.name);
      setIsUploading(true);
      setError(null);

      try {
        const s3Key = await uploadToS3(file, (progress) => {
          setUploadProgress(progress);
        });

        onFileUploaded(s3Key); // Trigger the callback with the uploaded key
      } catch (error) {
        if (error instanceof S3UploadError) {
          setError(error.message);
          handleError(error.message);
        } else {
          setError("An unexpected error occurred");
          handleError("An unexpected error occurred");
        }
      } finally {
        setIsUploading(false);
        setUploadProgress(null);
      }
    },
    [handleError]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header createNewChat={createNewChat} />
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex flex-col w-screen">
          <main className="flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              {!state.s3Key ? (
                <div className="flex-1 flex items-center justify-center p-4">
                  <FileUpload
                    // onDataLoaded={handleDataLoaded}
                    onError={handleError}
                    onFileUploaded={(key: string) => {
                      setState({
                        ...state,
                        s3Key: key,
                        messages: [
                          {
                            id: Date.now().toString(),
                            content:
                              'CSV data loaded successfully! Try asking me questions about the data. Type "help" to see what I can do.',
                            role: "assistant",
                            timestamp: new Date(),
                            type: "text",
                          },
                        ],
                      });
                    }}
                  />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col"
                >
                  <div className="flex flex-col h-screen">
                    <h1 className="text-2xl font-bold text-center my-4">
                      CSV Conversational AI
                    </h1>

                    <ScrollArea className="flex-1 px-4 overflow-auto">
                      <div className="mx-auto py-4 space-y-6">
                        {state.messages.map((message) => (
                          <ChatMessage key={message.id} message={message} />
                        ))}
                        {state.isLoading && <TypingIndicator />}
                      </div>
                    </ScrollArea>

                    <div className="flex items-center sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                      <div className="relative flex-shrink-0 group ">
                        {/* Upload Icon */}
                        <Upload
                          size={24}
                          color="black"
                          className="cursor-pointer group-hover:bg-gray-300 active:bg-gray-400 w-10 h-10 p-2 rounded-full"
                          onClick={() => {
                            // Create a hidden file input to handle file selection
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = ".csv"; // Allow only CSV files
                            input.onchange = (event) =>
                              handleFileUpload(event, (key) => {
                                setState((prevState) => ({
                                  ...prevState,
                                  s3Key: key,
                                  messages: [
                                    ...prevState.messages,
                                    {
                                      id: Date.now().toString(),
                                      content:
                                        'CSV data loaded successfully! Try asking me questions about the data. Type "help" to see what I can do.',
                                      role: "assistant",
                                      timestamp: new Date(),
                                      type: "text",
                                    },
                                  ],
                                }));
                              });
                            input.click();
                          }}
                        />

                        {/* Tooltip */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          Upload
                        </div>
                      </div>
                      <div className=" flex-1 max-w-3xl p-4">
                        <ChatInput
                          onSend={handleSendMessage}
                          disabled={state.isLoading || !state.s3Key}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {state.error && (
        <Alert variant="destructive" className="fixed bottom-4 right-4 w-auto">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default App;

const sample_json = {
  response: {
    analysis: {
      ai_suggestions:
        "Unfortunately, I was not able to answer your question, because of the following error:\n\n'gca' is not allowed in RestrictedMatplotlib\n",
      category_col: "Product_Short_Description",
      main_metric: "asked_quantity",
      suggested_charts: ["bar", "pie"],
    },
    charts: {
      bar: '\n            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400">\n                <style>\n                    .bar { fill: #4c72b0; opacity: 0.8; }\n                    .bar:hover { opacity: 1; }\n                    .axis { stroke: #666; stroke-width: 1; }\n                    .grid { stroke: #ddd; stroke-width: 0.5; }\n                    .label { font-family: Arial; font-size: 12px; fill: #666; }\n                    .title { font-family: Arial; font-size: 16px; fill: #333; }\n                </style>\n                \n                <text x="400" y="30" class="title" text-anchor="middle">\n                    asked_quantity by Product_Short_Description\n                </text>\n            \n                <rect x="60.0" y="70.0" width="10.793650793650794" height="280.0" class="bar">\n                    <title>ரின் சோப் Rin Soap ₹10: 18,480</title>\n                </rect>\n                <text x="65.39682539682539" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 65.39682539682539, 365)">\n                    ரின் சோப் \n                </text>\n                \n                <rect x="80.7936507936508" y="102.72727272727275" width="10.793650793650794" height="247.27272727272725" class="bar">\n                    <title>கிளினிக் பிளஸ் ஷாம்பு Clinic Plus Shampoo  ₹1 (Pack of 16): 16,320</title>\n                </rect>\n                <text x="86.19047619047619" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 86.19047619047619, 365)">\n                    கிளினிக் ப\n                </text>\n                \n                <rect x="101.5873015873016" y="145.0" width="10.793650793650794" height="205.0" class="bar">\n                    <title>மில்க் பிகிஸ் Milk Bikis ₹5: 13,530</title>\n                </rect>\n                <text x="106.98412698412699" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 106.98412698412699, 365)">\n                    மில்க் பிக\n                </text>\n                \n                <rect x="122.38095238095238" y="171.8181818181818" width="10.793650793650794" height="178.1818181818182" class="bar">\n                    <title>சர்ஃப் எக்செல் சோப்பு Surf Excel Soap ₹10: 11,760</title>\n                </rect>\n                <text x="127.77777777777777" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 127.77777777777777, 365)">\n                    சர்ஃப் எக்\n                </text>\n                \n                <rect x="143.1746031746032" y="175.45454545454547" width="10.793650793650794" height="174.54545454545453" class="bar">\n                    <title>சிக் ஷாம்பு வெள்ளை Chik Shampoo White ₹1 (Pack of 16): 11,520</title>\n                </rect>\n                <text x="148.57142857142858" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 148.57142857142858, 365)">\n                    சிக் ஷாம்ப\n                </text>\n                \n                <rect x="163.96825396825398" y="204.9090909090909" width="10.793650793650794" height="145.0909090909091" class="bar">\n                    <title>மேரி கோல்ட் Marie Gold ₹5: 9,576</title>\n                </rect>\n                <text x="169.36507936507937" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 169.36507936507937, 365)">\n                    மேரி கோல்ட\n                </text>\n                \n                <rect x="184.76190476190476" y="245.27272727272725" width="10.793650793650794" height="104.72727272727273" class="bar">\n                    <title>புரு காபி Bru Instant coffee ₹2 (Pack of 12x2): 6,912</title>\n                </rect>\n                <text x="190.15873015873015" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 190.15873015873015, 365)">\n                    புரு காபி \n                </text>\n                \n                <rect x="205.55555555555557" y="251.8181818181818" width="10.793650793650794" height="98.18181818181819" class="bar">\n                    <title>பூஸ்ட் Boost ₹5 (Pack of 15): 6,480</title>\n                </rect>\n                <text x="210.95238095238096" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 210.95238095238096, 365)">\n                    பூஸ்ட் Boo\n                </text>\n                \n                <rect x="226.34920634920636" y="259.0909090909091" width="10.793650793650794" height="90.9090909090909" class="bar">\n                    <title>புரு காபி Bru Instant coffee MRP 5: 6,000</title>\n                </rect>\n                <text x="231.74603174603175" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 231.74603174603175, 365)">\n                    புரு காபி \n                </text>\n                \n                <rect x="247.14285714285714" y="284.9090909090909" width="10.793650793650794" height="65.0909090909091" class="bar">\n                    <title>மேரி கோல்ட் Marie Gold ₹10: 4,296</title>\n                </rect>\n                <text x="252.53968253968253" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 252.53968253968253, 365)">\n                    மேரி கோல்ட\n                </text>\n                \n                <rect x="267.93650793650795" y="289.9848484848485" width="10.793650793650794" height="60.015151515151516" class="bar">\n                    <title>மில்க் பிகிஸ் Milk Bikis ₹10: 3,961</title>\n                </rect>\n                <text x="273.33333333333337" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 273.33333333333337, 365)">\n                    மில்க் பிக\n                </text>\n                \n                <rect x="288.73015873015873" y="304.54545454545456" width="10.793650793650794" height="45.45454545454545" class="bar">\n                    <title>சர்ஃப் எக்செல் சோப்பு Surf Excel Soap ₹20: 3,000</title>\n                </rect>\n                <text x="294.12698412698415" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 294.12698412698415, 365)">\n                    சர்ஃப் எக்\n                </text>\n                \n                <rect x="309.5238095238095" y="306.3636363636364" width="10.793650793650794" height="43.63636363636363" class="bar">\n                    <title>சிக் ஷாம்பு கருப்பு Chik Shampoo Black ₹1 (Pack of 16): 2,880</title>\n                </rect>\n                <text x="314.92063492063494" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 314.92063492063494, 365)">\n                    சிக் ஷாம்ப\n                </text>\n                \n                <rect x="330.3174603174603" y="306.3636363636364" width="10.793650793650794" height="43.63636363636363" class="bar">\n                    <title>சர்ப் எக்செல் பவுடர் Surf Excel Powder ₹10 (Pack of 6): 2,880</title>\n                </rect>\n                <text x="335.7142857142857" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 335.7142857142857, 365)">\n                    சர்ப் எக்ச\n                </text>\n                \n                <rect x="351.11111111111114" y="315.0" width="10.793650793650794" height="35.0" class="bar">\n                    <title>ஹமாம் நீம் சோப் Hamam Neem Soap ₹10 (Pack of 6): 2,310</title>\n                </rect>\n                <text x="356.50793650793656" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 356.50793650793656, 365)">\n                    ஹமாம் நீம்\n                </text>\n                \n                <rect x="371.9047619047619" y="320.9090909090909" width="10.793650793650794" height="29.090909090909093" class="bar">\n                    <title>சிக் ஷாம்பு பச்சை Chik Shampoo Green ₹1 (Pack of 16): 1,920</title>\n                </rect>\n                <text x="377.30158730158735" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 377.30158730158735, 365)">\n                    சிக் ஷாம்ப\n                </text>\n                \n                <rect x="392.6984126984127" y="323.8181818181818" width="10.793650793650794" height="26.181818181818183" class="bar">\n                    <title>ஹார்லிக்ஸ் Horlicks ₹2 (Pack of 12x2): 1,728</title>\n                </rect>\n                <text x="398.09523809523813" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 398.09523809523813, 365)">\n                    ஹார்லிக்ஸ்\n                </text>\n                \n                <rect x="413.4920634920635" y="324.90909090909093" width="10.793650793650794" height="25.09090909090909" class="bar">\n                    <title>புரு காபி Bru Instant coffee ₹10 (Pack of 12): 1,656</title>\n                </rect>\n                <text x="418.8888888888889" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 418.8888888888889, 365)">\n                    புரு காபி \n                </text>\n                \n                <rect x="434.2857142857143" y="325.45454545454544" width="10.793650793650794" height="24.545454545454547" class="bar">\n                    <title>ரின் பவுடர் Rin Powder ₹10 (Pack of 6): 1,620</title>\n                </rect>\n                <text x="439.6825396825397" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 439.6825396825397, 365)">\n                    ரின் பவுடர\n                </text>\n                \n                <rect x="455.0793650793651" y="326.0" width="10.793650793650794" height="24.0" class="bar">\n                    <title>ஹாப்பி ஹாப்பி Happy Happy ₹5: 1,584</title>\n                </rect>\n                <text x="460.47619047619054" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 460.47619047619054, 365)">\n                    ஹாப்பி ஹாப\n                </text>\n                \n                <rect x="475.8730158730159" y="328.1818181818182" width="10.793650793650794" height="21.818181818181817" class="bar">\n                    <title>ஹாப்பி ஹாப்பி Happy Happy ₹5 (Offer Pack): 1,440</title>\n                </rect>\n                <text x="481.2698412698413" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 481.2698412698413, 365)">\n                    ஹாப்பி ஹாப\n                </text>\n                \n                <rect x="496.6666666666667" y="331.8181818181818" width="10.793650793650794" height="18.18181818181818" class="bar">\n                    <title>Head and Shoulder Daily Cool Green பச்சை டெய்லி கூல் RS 2 : 1,200</title>\n                </rect>\n                <text x="502.0634920634921" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 502.0634920634921, 365)">\n                    Head and S\n                </text>\n                \n                <rect x="517.4603174603175" y="338.1818181818182" width="10.793650793650794" height="11.818181818181818" class="bar">\n                    <title>ரின் சோப் Rin Soap 250g ₹25: 780</title>\n                </rect>\n                <text x="522.8571428571429" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 522.8571428571429, 365)">\n                    ரின் சோப் \n                </text>\n                \n                <rect x="538.2539682539682" y="339.09090909090907" width="10.793650793650794" height="10.909090909090908" class="bar">\n                    <title>சர்ஃப் எக்செல் சோப்பு Surf Excel Soap 250g ₹35: 720</title>\n                </rect>\n                <text x="543.6507936507936" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 543.6507936507936, 365)">\n                    சர்ஃப் எக்\n                </text>\n                \n                <rect x="559.047619047619" y="340.90909090909093" width="10.793650793650794" height="9.09090909090909" class="bar">\n                    <title>மில்க் கிளாசிக் பிகிஸ் Milk classic Bikis ₹10: 600</title>\n                </rect>\n                <text x="564.4444444444445" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 564.4444444444445, 365)">\n                    மில்க் கிள\n                </text>\n                \n                <rect x="579.8412698412699" y="343.6363636363636" width="10.793650793650794" height="6.363636363636364" class="bar">\n                    <title>மேரி கோல்ட் Marie Gold ₹30: 420</title>\n                </rect>\n                <text x="585.2380952380953" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 585.2380952380953, 365)">\n                    மேரி கோல்ட\n                </text>\n                \n                <rect x="600.6349206349206" y="343.93939393939394" width="10.793650793650794" height="6.0606060606060606" class="bar">\n                    <title>ரின் பவுடர் Rin Powder 500g: 400</title>\n                </rect>\n                <text x="606.031746031746" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 606.031746031746, 365)">\n                    ரின் பவுடர\n                </text>\n                \n                <rect x="621.4285714285714" y="344.1818181818182" width="10.793650793650794" height="5.818181818181818" class="bar">\n                    <title>சர்ப் எக்செல் நீலம் பவுடர் Surf Excel Powder EW Blue 500g: 384</title>\n                </rect>\n                <text x="626.8253968253969" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 626.8253968253969, 365)">\n                    சர்ப் எக்ச\n                </text>\n                \n                <rect x="642.2222222222223" y="344.54545454545456" width="10.793650793650794" height="5.454545454545454" class="bar">\n                    <title>ரின் பவுடர் Rin Powder ₹5 (Pack of 6): 360</title>\n                </rect>\n                <text x="647.6190476190477" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 647.6190476190477, 365)">\n                    ரின் பவுடர\n                </text>\n                \n                <rect x="663.015873015873" y="347.27272727272725" width="10.793650793650794" height="2.727272727272727" class="bar">\n                    <title>முகி ஆக்டிவ் டிடர்ஜென்ட் Mugi Active Wash Detergent 150g  ₹10 : 180</title>\n                </rect>\n                <text x="668.4126984126984" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 668.4126984126984, 365)">\n                    முகி ஆக்டி\n                </text>\n                \n                <rect x="683.8095238095239" y="347.27272727272725" width="10.793650793650794" height="2.727272727272727" class="bar">\n                    <title>ஹமாம் நீம் சோப் Hamam Neem Soap (Pack of 4x100g): 180</title>\n                </rect>\n                <text x="689.2063492063493" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 689.2063492063493, 365)">\n                    ஹமாம் நீம்\n                </text>\n                \n                <rect x="704.6031746031746" y="347.45454545454544" width="10.793650793650794" height="2.5454545454545454" class="bar">\n                    <title>ஸ்டேபிரீ நாப்கின் Stayfree Secure XL ₹42: 168</title>\n                </rect>\n                <text x="710.0" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 710.0, 365)">\n                    ஸ்டேபிரீ ந\n                </text>\n                \n                <rect x="725.3968253968254" y="347.8181818181818" width="10.793650793650794" height="2.1818181818181817" class="bar">\n                    <title>சிந்தால் ஒரிஜினல் சோப் Cinthol Original Soap ₹10 (Pack of 6): 144</title>\n                </rect>\n                <text x="730.7936507936508" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 730.7936507936508, 365)">\n                    சிந்தால் ஒ\n                </text>\n                \n                <rect x="746.1904761904763" y="348.25757575757575" width="10.793650793650794" height="1.7424242424242424" class="bar">\n                    <title>கோபிகோ Kopiko 115pcs பேக்: 115</title>\n                </rect>\n                <text x="751.5873015873017" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 751.5873015873017, 365)">\n                    கோபிகோ Kop\n                </text>\n                \n                <rect x="766.984126984127" y="348.3636363636364" width="10.793650793650794" height="1.6363636363636365" class="bar">\n                    <title>க்ளோஸ் அப் டீப் ஆக்ஷன் ரெட் Close Up Deep Action Red ₹10: 108</title>\n                </rect>\n                <text x="772.3809523809524" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 772.3809523809524, 365)">\n                    க்ளோஸ் அப்\n                </text>\n                \n                <rect x="787.7777777777778" y="348.4848484848485" width="10.793650793650794" height="1.5151515151515151" class="bar">\n                    <title>உளுத்தம் பருப்பு Urad Dal 500g: 100</title>\n                </rect>\n                <text x="793.1746031746032" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 793.1746031746032, 365)">\n                    உளுத்தம் ப\n                </text>\n                \n                <rect x="808.5714285714286" y="348.90909090909093" width="10.793650793650794" height="1.0909090909090908" class="bar">\n                    <title>லக்ஸ் ஜாஸ்மின் சோப் Lux Jasmine Soap ₹10: 72</title>\n                </rect>\n                <text x="813.968253968254" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 813.968253968254, 365)">\n                    லக்ஸ் ஜாஸ்\n                </text>\n                \n                <rect x="829.3650793650794" y="348.90909090909093" width="10.793650793650794" height="1.0909090909090908" class="bar">\n                    <title>லக்ஸ் ரோஸ் சோப் Lux Rose Soap ₹10: 72</title>\n                </rect>\n                <text x="834.7619047619048" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 834.7619047619048, 365)">\n                    லக்ஸ் ரோஸ்\n                </text>\n                \n                <rect x="850.1587301587302" y="348.90909090909093" width="10.793650793650794" height="1.0909090909090908" class="bar">\n                    <title>லைஃப்பாய் சோப் Lifebuoy Soap ₹10: 72</title>\n                </rect>\n                <text x="855.5555555555557" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 855.5555555555557, 365)">\n                    லைஃப்பாய் \n                </text>\n                \n                <rect x="870.952380952381" y="348.90909090909093" width="10.793650793650794" height="1.0909090909090908" class="bar">\n                    <title>லைஃப்பாய் சோப் Lifebuoy Soap ₹36: 72</title>\n                </rect>\n                <text x="876.3492063492064" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 876.3492063492064, 365)">\n                    லைஃப்பாய் \n                </text>\n                \n                <rect x="891.7460317460318" y="349.0151515151515" width="10.793650793650794" height="0.9848484848484849" class="bar">\n                    <title>நிவியா மாய்ஸ்சரைசர் கிரீம் Nivea Soft Moisture Cream Mini 25ml: 65</title>\n                </rect>\n                <text x="897.1428571428572" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 897.1428571428572, 365)">\n                    நிவியா மாய\n                </text>\n                \n                <rect x="912.5396825396825" y="349.09090909090907" width="10.793650793650794" height="0.9090909090909092" class="bar">\n                    <title>Amrutanjan ஸ்ட்ரோங் பால்ம் Strong Pain Balm Rs.2/- : 60</title>\n                </rect>\n                <text x="917.936507936508" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 917.936507936508, 365)">\n                    Amrutanjan\n                </text>\n                \n                <rect x="933.3333333333334" y="349.24242424242425" width="10.793650793650794" height="0.7575757575757576" class="bar">\n                    <title>ராஜா கோல்ட் சமையல் எண்ணெய் Raja Gold Cooking Oil 840gm: 50</title>\n                </rect>\n                <text x="938.7301587301588" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 938.7301587301588, 365)">\n                    ராஜா கோல்ட\n                </text>\n                \n                <rect x="954.1269841269842" y="349.27272727272725" width="10.793650793650794" height="0.7272727272727273" class="bar">\n                    <title>லக்ஸ் ரோஸ் சோப் Lux Rose Soap 100g: 48</title>\n                </rect>\n                <text x="959.5238095238096" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 959.5238095238096, 365)">\n                    லக்ஸ் ரோஸ்\n                </text>\n                \n                <rect x="974.9206349206349" y="349.45454545454544" width="10.793650793650794" height="0.5454545454545454" class="bar">\n                    <title>பூஸ்ட் ஜார் Boost Jar 200g : 36</title>\n                </rect>\n                <text x="980.3174603174604" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 980.3174603174604, 365)">\n                    பூஸ்ட் ஜார\n                </text>\n                \n                <rect x="995.7142857142858" y="349.6363636363636" width="10.793650793650794" height="0.36363636363636365" class="bar">\n                    <title>நிவியா மென் ஃபேஸ் வாஷ் முகப்பரு Nivea Men Face Wash Acne 50g: 24</title>\n                </rect>\n                <text x="1001.1111111111112" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 1001.1111111111112, 365)">\n                    நிவியா மென\n                </text>\n                \n                <rect x="1016.5079365079365" y="349.6818181818182" width="10.793650793650794" height="0.3181818181818182" class="bar">\n                    <title>நிவியா மென் ஃபேஸ் வாஷ் டார்க் ஸ்பாட் Nivea Men Face Wash Dark Spot 50g: 21</title>\n                </rect>\n                <text x="1021.9047619047619" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 1021.9047619047619, 365)">\n                    நிவியா மென\n                </text>\n                \n                <rect x="1037.3015873015875" y="349.72727272727275" width="10.793650793650794" height="0.2727272727272727" class="bar">\n                    <title>நிவியா சாஃப்ட் க்ரீம் சோப் Nivea Soft Creme Soap 75g: 18</title>\n                </rect>\n                <text x="1042.6984126984128" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 1042.6984126984128, 365)">\n                    நிவியா சாஃ\n                </text>\n                \n                <rect x="1058.095238095238" y="349.72727272727275" width="10.793650793650794" height="0.2727272727272727" class="bar">\n                    <title>நிவியா கற்றாழை லோஷன் Nivea Aloe Hydration Lotion 75ml: 18</title>\n                </rect>\n                <text x="1063.4920634920634" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 1063.4920634920634, 365)">\n                    நிவியா கற்\n                </text>\n                \n                <rect x="1078.888888888889" y="349.77272727272725" width="10.793650793650794" height="0.2272727272727273" class="bar">\n                    <title>நிவியா ஃபேஸ் வாஷ் ரோஸ் Nivea Face Wash Rose 50ml: 15</title>\n                </rect>\n                <text x="1084.2857142857142" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 1084.2857142857142, 365)">\n                    நிவியா ஃபே\n                </text>\n                \n                <rect x="1099.6825396825398" y="349.77272727272725" width="10.793650793650794" height="0.2272727272727273" class="bar">\n                    <title>நிவியா ஃபேஸ் வாஷ் மஞ்சள் Nivea Face Wash Turmeric 50ml: 15</title>\n                </rect>\n                <text x="1105.079365079365" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 1105.079365079365, 365)">\n                    நிவியா ஃபே\n                </text>\n                \n                <rect x="1120.4761904761906" y="349.77272727272725" width="10.793650793650794" height="0.2272727272727273" class="bar">\n                    <title>நிவியா ஃபேஸ் வாஷ் தேன் Nivea Face Wash Honey 50ml: 15</title>\n                </rect>\n                <text x="1125.873015873016" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 1125.873015873016, 365)">\n                    நிவியா ஃபே\n                </text>\n                \n                <rect x="1141.2698412698412" y="349.77272727272725" width="10.793650793650794" height="0.2272727272727273" class="bar">\n                    <title>நிவியா ஃபேஸ் வாஷ் குங்குமப்பூ Nivea Face Wash Saffron 50ml: 15</title>\n                </rect>\n                <text x="1146.6666666666665" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 1146.6666666666665, 365)">\n                    நிவியா ஃபே\n                </text>\n                \n                <rect x="1162.063492063492" y="349.8181818181818" width="10.793650793650794" height="0.18181818181818182" class="bar">\n                    <title>நிவியா கோகோ லோஷன் Nivea Cocoa Nourish Lotion 75ml: 12</title>\n                </rect>\n                <text x="1167.4603174603174" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 1167.4603174603174, 365)">\n                    நிவியா கோக\n                </text>\n                \n                <rect x="1182.857142857143" y="349.8181818181818" width="10.793650793650794" height="0.18181818181818182" class="bar">\n                    <title>Ariel FL1lt Pouch: 12</title>\n                </rect>\n                <text x="1188.2539682539682" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 1188.2539682539682, 365)">\n                    Ariel FL1l\n                </text>\n                \n                <rect x="1203.6507936507937" y="349.8181818181818" width="10.793650793650794" height="0.18181818181818182" class="bar">\n                    <title>நிவியா ஷியா லோஷன் Nivea Shea Smooth Lotion 75ml: 12</title>\n                </rect>\n                <text x="1209.047619047619" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 1209.047619047619, 365)">\n                    நிவியா ஷிய\n                </text>\n                \n                <rect x="1224.4444444444446" y="349.8181818181818" width="10.793650793650794" height="0.18181818181818182" class="bar">\n                    <title>Tide TL Pouch: 12</title>\n                </rect>\n                <text x="1229.8412698412699" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 1229.8412698412699, 365)">\n                    Tide TL Po\n                </text>\n                \n                <rect x="1245.2380952380952" y="349.8181818181818" width="10.793650793650794" height="0.18181818181818182" class="bar">\n                    <title>Tide FL 1lt Pouch: 12</title>\n                </rect>\n                <text x="1250.6349206349205" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 1250.6349206349205, 365)">\n                    Tide FL 1l\n                </text>\n                \n                <rect x="1266.031746031746" y="349.8636363636364" width="10.793650793650794" height="0.13636363636363635" class="bar">\n                    <title>நிவியா ஜெல் பாடி லோஷன் Nivea Gel Body Lotion 75ml: 9</title>\n                </rect>\n                <text x="1271.4285714285713" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 1271.4285714285713, 365)">\n                    நிவியா ஜெல\n                </text>\n                \n                <rect x="1286.8253968253969" y="349.8636363636364" width="10.793650793650794" height="0.13636363636363635" class="bar">\n                    <title>நிவியா பாடி மில்க் லோஷன் Nivea Body Milk Lotion 75ml: 9</title>\n                </rect>\n                <text x="1292.2222222222222" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 1292.2222222222222, 365)">\n                    நிவியா பாட\n                </text>\n                \n                <rect x="1307.6190476190477" y="349.8636363636364" width="10.793650793650794" height="0.13636363636363635" class="bar">\n                    <title>பூஸ்ட் பாக்கெட் Boost Pouch 500g : 9</title>\n                </rect>\n                <text x="1313.015873015873" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 1313.015873015873, 365)">\n                    பூஸ்ட் பாக\n                </text>\n                \n                <rect x="1328.4126984126985" y="349.8787878787879" width="10.793650793650794" height="0.12121212121212122" class="bar">\n                    <title>Ariel TL1lt Pouch: 8</title>\n                </rect>\n                <text x="1333.8095238095239" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 1333.8095238095239, 365)">\n                    Ariel TL1l\n                </text>\n                \n                <rect x="1349.2063492063492" y="349.969696969697" width="10.793650793650794" height="0.030303030303030304" class="bar">\n                    <title>சர்ப் எக்செல் ஆரஞ்சு பவுடர் Surf Excel Powder QW Orange 500g: 2</title>\n                </rect>\n                <text x="1354.6031746031745" y="365" class="label" text-anchor="middle" \n                      transform="rotate(45, 1354.6031746031745, 365)">\n                    சர்ப் எக்ச\n                </text>\n                </svg>',
      pie: '\n            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">\n                <style>\n                    .slice { stroke: #fff; stroke-width: 1; }\n                    .slice:hover { opacity: 0.8; }\n                    .label { font-family: Arial; font-size: 12px; fill: #666; }\n                    .title { font-family: Arial; font-size: 16px; fill: #333; }\n                </style>\n                \n                <text x="200" y="30" class="title" text-anchor="middle">\n                    asked_quantity Distribution\n                </text>\n            \n                <path d="M 200 200 L 350.0 200.0 A 150 150 0 0 1 298.9224734540131 312.7579010346507 Z"\n                      fill="#4c72b0" class="slice">\n                    <title>ரின் சோப் Rin Soap ₹10: 18,480 (13.5%)</title>\n                </path>\n                \n                <text x="363.9622735053201" y="274.2722886880873" class="label" \n                      text-anchor="start">\n                    ரின் சோப்  (13.5%)\n                </text>\n                \n                <path d="M 200 200 L 298.9224734540131 312.7579010346507 A 150 150 0 0 1 195.33486691522157 349.92743755997867 Z"\n                      fill="#55a868" class="slice">\n                    <title>கிளினிக் பிளஸ் ஷாம்பு Clinic Plus Shampoo  ₹1 (Pack of 16): 16,320 (12.0%)</title>\n                </path>\n                \n                <text x="260.79282389588593" y="369.4232350144566" class="label" \n                      text-anchor="start">\n                    கிளினிக் ப (12.0%)\n                </text>\n                \n                <path d="M 200 200 L 195.33486691522157 349.92743755997867 A 150 150 0 0 1 108.75530216620136 319.0563106988402 Z"\n                      fill="#c44e52" class="slice">\n                    <title>மில்க் பிகிஸ் Milk Bikis ₹5: 13,530 (9.9%)</title>\n                </path>\n                \n                <text x="139.54654707477533" y="369.5446254807791" class="label" \n                      text-anchor="end">\n                    மில்க் பிக (9.9%)\n                </text>\n                \n                <path d="M 200 200 L 108.75530216620136 319.0563106988402 A 150 150 0 0 1 60.45406264903235 255.01755509689443 Z"\n                      fill="#8172b3" class="slice">\n                    <title>சர்ஃப் எக்செல் சோப்பு Surf Excel Soap ₹10: 11,760 (8.6%)</title>\n                </path>\n                \n                <text x="56.29370012803162" y="308.39049486513056" class="label" \n                      text-anchor="end">\n                    சர்ஃப் எக் (8.6%)\n                </text>\n                \n                <path d="M 200 200 L 60.45406264903235 255.01755509689443 A 150 150 0 0 1 51.792149837555144 176.88218976143514 Z"\n                      fill="#ccb974" class="slice">\n                    <title>சிக் ஷாம்பு வெள்ளை Chik Shampoo White ₹1 (Pack of 16): 11,520 (8.4%)</title>\n                </path>\n                \n                <text x="21.09595891654334" y="219.83290407400935" class="label" \n                      text-anchor="end">\n                    சிக் ஷாம்ப (8.4%)\n                </text>\n                \n                <path d="M 200 200 L 51.792149837555144 176.88218976143514 A 150 150 0 0 1 75.82270467771764 115.85726813061825 Z"\n                      fill="#64b5cd" class="slice">\n                    <title>மேரி கோல்ட் Marie Gold ₹5: 9,576 (7.0%)</title>\n                </path>\n                \n                <text x="32.51753800865595" y="134.0483137037574" class="label" \n                      text-anchor="end">\n                    மேரி கோல்ட (7.0%)\n                </text>\n                </svg>',
    },
    text: {
      content:
        "I've analyzed your data about give me a insights on top sales products?. Here's what I found:",
      type: "text",
    },
  },
  status: "success",
};
