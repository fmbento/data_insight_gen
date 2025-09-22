import React, { useState, useEffect } from 'react';

interface AnalysisOptionsProps {
  recordCount: number;
  onStartAnalysis: (useSample: boolean, customInstructions: string, detectOutliers: boolean) => void;
  error: string | null;
}

const AnalysisOptions: React.FC<AnalysisOptionsProps> = ({ recordCount, onStartAnalysis, error }) => {
  const [customInstructions, setCustomInstructions] = useState('');
  const [analysisType, setAnalysisType] = useState<'sample' | 'full'>('sample');
  const [detectOutliers, setDetectOutliers] = useState(false);

  useEffect(() => {
    // If user switches back to sample analysis, disable and uncheck outlier detection
    if (analysisType === 'sample') {
      setDetectOutliers(false);
    }
  }, [analysisType]);

  const handleStart = () => {
    onStartAnalysis(analysisType === 'sample', customInstructions, detectOutliers);
  };

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

      <div className="mt-6 max-w-2xl mx-auto text-left space-y-6">
          <div>
            <label htmlFor="custom-instructions" className="block text-sm font-medium text-slate-700">
              Additional Instructions (Optional)
            </label>
            <div className="mt-1">
              <textarea
                id="custom-instructions"
                name="custom-instructions"
                rows={3}
                className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                placeholder="e.g., 'Focus on user feedback sentiment.'"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                aria-describedby="instructions-description"
              />
            </div>
            <p className="mt-2 text-sm text-slate-500" id="instructions-description">
              Provide specific requests for the AI to consider during its analysis.
            </p>
          </div>
          
          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Analysis Type</legend>
            <p className="mt-2 text-sm text-slate-500">
                A sample analysis is faster, while a full analysis provides more comprehensive insights and enables outlier detection.
            </p>
            <div className="mt-4 space-y-4">
                <div className="flex items-center">
                    <input id="sample" name="analysis-type" type="radio" value="sample" checked={analysisType === 'sample'} onChange={(e) => setAnalysisType(e.target.value as 'sample' | 'full')} className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                    <label htmlFor="sample" className="ml-3 block text-sm font-medium text-slate-700">Analyze Sample (Faster)</label>
                </div>
                 <div className="flex items-center">
                    <input id="full" name="analysis-type" type="radio" value="full" checked={analysisType === 'full'} onChange={(e) => setAnalysisType(e.target.value as 'sample' | 'full')} className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                    <label htmlFor="full" className="ml-3 block text-sm font-medium text-slate-700">Analyze Full Dataset</label>
                </div>
            </div>
          </fieldset>

          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id="detect-outliers"
                aria-describedby="outliers-description"
                name="detect-outliers"
                type="checkbox"
                checked={detectOutliers}
                onChange={(e) => setDetectOutliers(e.target.checked)}
                disabled={analysisType === 'sample'}
                className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 disabled:cursor-not-allowed disabled:text-slate-400"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="detect-outliers" className={`font-medium ${analysisType === 'sample' ? 'text-slate-400' : 'text-slate-700'}`}>
                Detect and Analyze Outliers
              </label>
              <p id="outliers-description" className="text-slate-500">
                Looks for abnormal values within records. Only available for full dataset analysis.
              </p>
            </div>
          </div>
      </div>
     
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8">
        <button
          onClick={handleStart}
          className="w-full sm:w-auto inline-flex justify-center items-center px-12 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
        >
          Start Analysis
        </button>
      </div>
    </div>
  );
};

export default AnalysisOptions;