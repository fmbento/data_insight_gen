
import React from 'react';
import type { AnalysisReport, Chart } from '../types';
import ReportSection from './ReportSection';
import MetricCard from './MetricCard';
import BarChartComponent from './BarChartComponent';
import PieChartComponent from './PieChartComponent';
import ImagePlaceholder from './ImagePlaceholder';

interface ReportDisplayProps {
  report: AnalysisReport;
  onReset: () => void;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, onReset }) => {
  const { title, summary, keyMetrics, charts, contentAnalysis, visualElements, interactiveElements } = report;

  const renderChart = (chart: Chart, index: number) => {
    switch (chart.type) {
      case 'bar':
        return <BarChartComponent key={index} data={chart.data} />;
      case 'pie':
        return <PieChartComponent key={index} data={chart.data} />;
      default:
        return <p key={index} className="text-red-500">Unknown chart type: {chart.type}</p>;
    }
  };

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-slate-600">{summary}</p>
      </div>

      <ReportSection title="Key Metrics">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {keyMetrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      </ReportSection>

      <ReportSection title="Visualizations">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {charts.map((chart, index) => (
            <div key={index}>
                <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">{chart.title}</h3>
                {renderChart(chart, index)}
            </div>
          ))}
        </div>
      </ReportSection>

      <ReportSection title="Content Analysis">
        <div className="bg-slate-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-slate-800">Sentiment</h3>
          <p className="mt-1 text-slate-600">{contentAnalysis.sentiment.description}</p>
          <div className="w-full bg-slate-200 rounded-full h-4 mt-3">
             <div className="bg-indigo-600 h-4 rounded-full" style={{ width: `${(contentAnalysis.sentiment.score + 1) * 50}%` }} title={`Score: ${contentAnalysis.sentiment.score.toFixed(2)}`}></div>
          </div>
          <p className="text-center font-medium text-indigo-700 mt-2">{contentAnalysis.sentiment.label}</p>
        </div>
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-slate-800">Common Themes</h3>
          <ul className="mt-4 space-y-4">
            {contentAnalysis.themes.map((theme, index) => (
                <li key={index} className="p-4 bg-slate-50 rounded-lg">
                    <p className="font-semibold text-slate-700">{theme.theme} <span className="text-sm font-normal text-slate-500">({theme.count} mentions)</span></p>
                    <blockquote className="mt-2 pl-4 border-l-4 border-slate-200 text-slate-600 italic">"{theme.examples[0]}"</blockquote>
                </li>
            ))}
          </ul>
        </div>
      </ReportSection>

      <ReportSection title="Generated Visual Concepts">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {visualElements.map((el, index) => (
                <ImagePlaceholder key={index} element={el} />
            ))}
         </div>
      </ReportSection>
      
      <ReportSection title="Suggested Interactive Elements">
        <div className="space-y-4">
            {interactiveElements.map((el, index) => (
                <div key={index} className="p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg">
                    <h4 className="font-semibold text-indigo-800">{el.description}</h4>
                    <p className="text-indigo-700 mt-1">{el.functionality}</p>
                </div>
            ))}
        </div>
      </ReportSection>


      <div className="text-center pt-8 border-t border-slate-200">
        <button
          onClick={onReset}
          className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
        >
          Analyze New Data
        </button>
      </div>
    </div>
  );
};

export default ReportDisplay;
