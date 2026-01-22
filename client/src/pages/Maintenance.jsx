import React from "react";
import { Wrench } from "lucide-react";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-orange-100 p-4 rounded-full">
            <Wrench className="w-12 h-12 text-orange-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Site Under Maintenance
        </h1>
        <p className="text-gray-600 mb-6">
          We are currently performing scheduled maintenance. We apologize for
          the inconvenience and will be back shortly.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#727cf5] text-white px-6 py-2 rounded hover:bg-[#5c66e8] transition-colors"
        >
          Check Again
        </button>
      </div>
    </div>
  );
};

export default Maintenance;
