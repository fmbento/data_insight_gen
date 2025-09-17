
import React from 'react';

interface AnalysisOptionsProps {
  recordCount: number;
  onStartAnalysis: (useSample: boolean) => void;
  error: string | null;
}

const AnalysisOptions: React.FC<AnalysisOptionsProps> = ({ recordCount, onStartAnalysis, error }) => {
  return (
    <div className="text-center transition-opacity duration-500 ease-in-out">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
        </div>
      <h2 className="text-2xl font-semibold text-slate-800">Data Upload Successful</h2>
      <p className="mt-2 text-slate-600">
        We've identified <strong className="text-indigo-600 font-bold">{recordCount.toLocaleString()}</strong> records in your dataset.
      </p>
      <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
        How would you like to proceed? A sample analysis is faster and cost-effective for large datasets, while a full analysis provides the most comprehensive insights.
      </p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => onStartAnalysis(true)}
          className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
        >
          Analyze Sample (Faster)
        </button>
        <button
          onClick={() => onStartAnalysis(false)}
          className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
        >
          Analyze Full Dataset
        </button>
      </div>
    </div>
  );
};

export default AnalysisOptions;
