import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import AnalysisOptions from './components/AnalysisOptions';
import ReportDisplay from './components/ReportDisplay';
import Loader from './components/Loader';
import { getPreliminaryAnalysis, generateReport, getSampleData } from './services/geminiService';
import type { PreliminaryAnalysis, AnalysisReport, SavedAnalysis } from './types';
import { AppStep } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.FileUpload);
  const [rawData, setRawData] = useState<string>('');
  const [preliminaryAnalysis, setPreliminaryAnalysis] = useState<PreliminaryAnalysis | null>(null);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wasSampleAnalyzed, setWasSampleAnalyzed] = useState(false);

  const handleDataSubmit = useCallback(async (data: string) => {
    setRawData(data);
    setError(null);
    setStep(AppStep.Loading);
    try {
      const analysis = await getPreliminaryAnalysis(data);
      setPreliminaryAnalysis(analysis);
      setStep(AppStep.AnalysisOptions);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to perform preliminary analysis. Please check your data format and try again.');
      setStep(AppStep.FileUpload);
    }
  }, []);

  const handleAnalysisStart = useCallback(async (useSample: boolean, customInstructions: string, detectOutliers: boolean) => {
    setError(null);

    // A safe character limit to stay well under the typical 1M token limit for prompts.
    // Let's set a conservative limit like 1.5M characters.
    const MAX_CHARS_FOR_FULL_ANALYSIS = 1_500_000;

    if (!useSample && rawData.length > MAX_CHARS_FOR_FULL_ANALYSIS) {
      setError(`The full dataset is too large to analyze directly (${(rawData.length / 1_000_000).toFixed(1)}M characters). Please choose 'Analyze Sample' or provide a smaller dataset for full analysis.`);
      // We don't change the step, so the user stays on the options screen with the new error message.
      return;
    }


    setStep(AppStep.Loading);
    setWasSampleAnalyzed(useSample);
    try {
      const report = await generateReport(rawData, useSample, customInstructions, detectOutliers);
      setAnalysisReport(report);
      setStep(AppStep.Report);

      // Save the report to localStorage
      try {
        const savedAnalysesRaw = localStorage.getItem('savedAnalyses');
        const savedAnalyses: SavedAnalysis[] = savedAnalysesRaw ? JSON.parse(savedAnalysesRaw) : [];
        const newSavedAnalysis: SavedAnalysis = {
          id: Date.now(),
          savedAt: new Date().toISOString(),
          report: report,
          wasSampleAnalyzed: useSample,
        };
        // Prepend new analysis and limit to 10 most recent
        const updatedAnalyses = [newSavedAnalysis, ...savedAnalyses].slice(0, 10);
        localStorage.setItem('savedAnalyses', JSON.stringify(updatedAnalyses));
      } catch (saveError) {
        console.warn("Could not save analysis to local storage:", saveError);
      }

    } catch (e) {
      console.error(e);
      setError('Failed to generate the report. The AI model may be overloaded or the data could not be processed.');
      setStep(AppStep.AnalysisOptions);
    }
  }, [rawData]);
  
  const handleLoadAnalysis = useCallback((analysis: SavedAnalysis) => {
    setAnalysisReport(analysis.report);
    setWasSampleAnalyzed(analysis.wasSampleAnalyzed);
    setStep(AppStep.Report);
    setError(null);
  }, []);

  const handleReset = () => {
    setStep(AppStep.FileUpload);
    setRawData('');
    setPreliminaryAnalysis(null);
    setAnalysisReport(null);
    setError(null);
    setWasSampleAnalyzed(false);
  };

  const handleDownloadSample = useCallback(() => {
    if (!rawData) return;
    const sampleData = getSampleData(rawData);
    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'sample_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [rawData]);


  const renderContent = () => {
    switch (step) {
      case AppStep.FileUpload:
        return <FileUpload onSubmit={handleDataSubmit} onLoadAnalysis={handleLoadAnalysis} error={error} />;
      case AppStep.AnalysisOptions:
        return preliminaryAnalysis ? (
          <AnalysisOptions
            recordCount={preliminaryAnalysis.recordCount}
            onStartAnalysis={handleAnalysisStart}
            error={error}
          />
        ) : null;
      case AppStep.Loading:
        return <Loader />;
      case AppStep.Report:
        return analysisReport ? (
          <ReportDisplay
            report={analysisReport}
            onReset={handleReset}
            wasSampleAnalyzed={wasSampleAnalyzed}
            onDownloadSample={handleDownloadSample}
          />
        ) : null;
      default:
        return <FileUpload onSubmit={handleDataSubmit} onLoadAnalysis={handleLoadAnalysis} error={error} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight">
            Data Insight <span className="text-indigo-600">Generator</span>
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            Your AI-powered data analysis and visualization partner.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            (c) 2025 Filipe MS Bento, <a href="https://www.linkedin.com/in/filipebento" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600">linkedin.com/in/filipebento</a>
          </p>
        </header>
        <main className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 transition-all duration-300">
          {renderContent()}
        </main>
        <footer className="text-center mt-8 text-sm text-slate-400">
            <p>Powered by React, Tailwind CSS, and Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
