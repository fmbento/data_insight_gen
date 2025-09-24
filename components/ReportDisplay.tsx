import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { AnalysisReport, Chart } from '../types';
import ReportSection from './ReportSection';
import MetricCard from './MetricCard';
import BarChartComponent from './BarChartComponent';
import PieChartComponent from './PieChartComponent';
import FieldMetricCard from './FieldMetricCard';

interface ReportDisplayProps {
  report: AnalysisReport;
  onReset: () => void;
  wasSampleAnalyzed: boolean;
  onDownloadSample: () => void;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, onReset, wasSampleAnalyzed, onDownloadSample }) => {
  const { title, summary, keyMetrics, charts, contentAnalysis, interactiveElements, customSections, outlierAnalysis, fieldMetrics, geoAnalysis } = report;
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleExportPDF = async () => {
    const reportElement = reportRef.current;
    if (!reportElement) {
      console.error("Report element not found");
      return;
    }
    setIsExportingPDF(true);

    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2, // Higher scale improves quality
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = -heightLeft;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`Data-Insight-Report-${title.replace(/\s/g, '-')}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("An error occurred while generating the PDF. Please try again.");
    } finally {
      setIsExportingPDF(false);
    }
  };


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
  
  const generateMapUrl = () => {
    if (!geoAnalysis) return { embedUrl: '', interactiveUrl: '' };

    // OSM Bbox format is: min longitude, min latitude, max longitude, max latitude
    const { topLeft, topRight, bottomLeft, bottomRight } = geoAnalysis.boundingBox;
    
    // Determine the min/max lat/lon from all four corners to be robust
    const minLon = Math.min(topLeft.longitude, topRight.longitude, bottomLeft.longitude, bottomRight.longitude);
    const minLat = Math.min(topLeft.latitude, topRight.latitude, bottomLeft.latitude, bottomRight.latitude);
    const maxLon = Math.max(topLeft.longitude, topRight.longitude, bottomLeft.longitude, bottomRight.longitude);
    const maxLat = Math.max(topLeft.latitude, topRight.latitude, bottomLeft.latitude, bottomRight.latitude);

    const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;
    
    const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
    const interactiveUrl = `https://www.openstreetmap.org/?minlon=${minLon}&minlat=${minLat}&maxlon=${maxLon}&maxlat=${maxLat}&box=yes`;

    return { embedUrl, interactiveUrl };
  };

  const { embedUrl: mapEmbedUrl, interactiveUrl: interactiveMapUrl } = generateMapUrl();

  return (
    <>
      <div className="space-y-12" ref={reportRef}>
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

        {fieldMetrics && fieldMetrics.length > 0 && (
          <ReportSection title="Field-level Analysis">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fieldMetrics.map((metric, index) => (
                      <FieldMetricCard key={index} metric={metric} />
                  ))}
              </div>
          </ReportSection>
        )}

        {geoAnalysis && (
            <ReportSection title="Geospatial Analysis">
                <div className="bg-slate-50 p-6 rounded-lg">
                    <p className="text-slate-600 mb-4">{geoAnalysis.summary}</p>
                    <p className="text-sm text-slate-500 mb-4">Identified Fields: <code className="bg-slate-200 text-slate-700 p-1 rounded">{geoAnalysis.identifiedLatField}</code> (Lat), <code className="bg-slate-200 text-slate-700 p-1 rounded">{geoAnalysis.identifiedLonField}</code> (Lon)</p>
                    <div className="w-full border border-slate-200 rounded-lg overflow-hidden shadow-md">
                        <iframe
                            width="100%"
                            height="400"
                            src={mapEmbedUrl}
                            className="border-0"
                            title={`Map showing data points with top-left corner at ${geoAnalysis.boundingBox.topLeft.latitude.toFixed(4)}, ${geoAnalysis.boundingBox.topLeft.longitude.toFixed(4)} and bottom-right corner at ${geoAnalysis.boundingBox.bottomRight.latitude.toFixed(4)}, ${geoAnalysis.boundingBox.bottomRight.longitude.toFixed(4)}`}
                            aria-label={`Map showing data points with top-left corner at ${geoAnalysis.boundingBox.topLeft.latitude.toFixed(4)}, ${geoAnalysis.boundingBox.topLeft.longitude.toFixed(4)} and bottom-right corner at ${geoAnalysis.boundingBox.bottomRight.latitude.toFixed(4)}, ${geoAnalysis.boundingBox.bottomRight.longitude.toFixed(4)}`}
                            loading="lazy"
                        ></iframe>
                    </div>
                    <div className="text-right mt-2">
                        <a href={interactiveMapUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                            View larger map on OpenStreetMap
                        </a>
                    </div>
                    <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <h4 className="text-sm font-semibold text-slate-600">Top Left</h4>
                            <p className="text-xs text-slate-500 mt-1">{geoAnalysis.boundingBox.topLeft.latitude.toFixed(4)}, {geoAnalysis.boundingBox.topLeft.longitude.toFixed(4)}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <h4 className="text-sm font-semibold text-slate-600">Top Right</h4>
                            <p className="text-xs text-slate-500 mt-1">{geoAnalysis.boundingBox.topRight.latitude.toFixed(4)}, {geoAnalysis.boundingBox.topRight.longitude.toFixed(4)}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <h4 className="text-sm font-semibold text-slate-600">Bottom Right</h4>
                            <p className="text-xs text-slate-500 mt-1">{geoAnalysis.boundingBox.bottomRight.latitude.toFixed(4)}, {geoAnalysis.boundingBox.bottomRight.longitude.toFixed(4)}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <h4 className="text-sm font-semibold text-slate-600">Bottom Left</h4>
                            <p className="text-xs text-slate-500 mt-1">{geoAnalysis.boundingBox.bottomLeft.latitude.toFixed(4)}, {geoAnalysis.boundingBox.bottomLeft.longitude.toFixed(4)}</p>
                        </div>
                    </div>
                </div>
            </ReportSection>
        )}

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
        
        {outlierAnalysis && (
          <ReportSection title="Outlier Analysis">
            <p className="mb-6 text-slate-600">{outlierAnalysis.summary}</p>
            {outlierAnalysis.outliers.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Record ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Field</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Anomalous Value</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {outlierAnalysis.outliers.map((outlier, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{outlier.recordId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{outlier.field}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800"><code className="bg-slate-100 p-1 rounded">{outlier.value}</code></td>
                        <td className="px-6 py-4 text-sm text-slate-600">{outlier.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
                <p>No significant outliers were detected in the dataset after a thorough analysis.</p>
              </div>
            )}
          </ReportSection>
        )}

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

        {customSections && customSections.length > 0 &&
          customSections.map((section, index) => (
            <ReportSection key={`custom-${index}`} title={section.title}>
              <div className="prose prose-slate max-w-none p-4 bg-slate-50 rounded-lg text-slate-700">
                <p className="whitespace-pre-wrap font-sans text-base">{section.content}</p>
              </div>
            </ReportSection>
          ))
        }

      </div>

      <div className="text-center pt-8 mt-12 border-t border-slate-200">
        <div className="flex flex-wrap justify-center items-center gap-4">
            <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all"
                aria-live="polite"
            >
                {isExportingPDF ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Exporting PDF...
                    </>
                ) : 'Export as PDF'}
            </button>
            {wasSampleAnalyzed && (
                <button
                    onClick={onDownloadSample}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                >
                    Download Sample Data
                </button>
            )}
            <button
              onClick={onReset}
              className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
            >
              Analyze New Data
            </button>
        </div>
      </div>
    </>
  );
};

export default ReportDisplay;