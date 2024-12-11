export const GChatterIntro = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 overflow-hidden">
      <div className="max-w-2xl w-full text-center space-y-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M12 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9z"
                strokeWidth="2"
                className="stroke-gray-800"
              />
              <path
                d="M8 12l3 3 5-5"
                strokeWidth="2"
                className="stroke-emerald-500"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-semibold text-gray-900">
            Meet G-Chatter, your AI analyst
          </h1>
        </div>

        <div className="space-y-2">
          <p className="text-xl text-gray-600">
            G-Chatter is your AI analyst. It can answer questions you have about
            your data source and help you find insights quickly.
          </p>
          <p className="text-xl text-gray-600">
            To start analysing, upload your file and ask a business question
            about your data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GChatterIntro;
