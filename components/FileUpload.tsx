import React, { useState, useRef, useEffect } from 'react';
import type { SavedAnalysis } from '../types';

interface FileUploadProps {
  onSubmit: (data: string) => void;
  onLoadAnalysis: (analysis: SavedAnalysis) => void;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onSubmit, onLoadAnalysis, error }) => {
  const [data, setData] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [editingAnalysisId, setEditingAnalysisId] = useState<number | null>(null);
  const [editingAnalysisName, setEditingAnalysisName] = useState<string>('');


  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedAnalyses');
      if (saved) {
        setSavedAnalyses(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load saved analyses from localStorage:", e);
      setSavedAnalyses([]);
    }
  }, []);

  const handleDeleteAnalysis = (idToDelete: number) => {
    if (window.confirm("Are you sure you want to delete this saved analysis?")) {
        const updatedAnalyses = savedAnalyses.filter(a => a.id !== idToDelete);
        setSavedAnalyses(updatedAnalyses);
        try {
            localStorage.setItem('savedAnalyses', JSON.stringify(updatedAnalyses));
        } catch (e) {
            console.error("Failed to update localStorage:", e);
        }
    }
  };

  const handleStartEdit = (analysis: SavedAnalysis) => {
    setEditingAnalysisId(analysis.id);
    setEditingAnalysisName(analysis.report.title);
  };

  const handleCancelEdit = () => {
    setEditingAnalysisId(null);
    setEditingAnalysisName('');
  };

  const handleConfirmEdit = () => {
    if (!editingAnalysisId || !editingAnalysisName.trim()) {
      handleCancelEdit(); // Cancel if name is empty
      return;
    }

    const updatedAnalyses = savedAnalyses.map(a =>
      a.id === editingAnalysisId
        ? { ...a, report: { ...a.report, title: editingAnalysisName.trim() } }
        : a
    );

    setSavedAnalyses(updatedAnalyses);
    try {
      localStorage.setItem('savedAnalyses', JSON.stringify(updatedAnalyses));
    } catch (e) {
      console.error("Failed to update localStorage:", e);
    }
    handleCancelEdit(); // Reset state after saving
  };


  const handleFile = (file: File) => {
    if (file) {
      if (!file.type.includes('csv') && !file.type.includes('tab-separated-values') && !/\.(csv|tsv)$/i.test(file.name)) {
          alert('Please upload a valid CSV or TSV file.');
          return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setData(text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); 
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
      }
    }
  };

  const handleRemoveFile = () => {
    setData('');
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.trim()) {
      onSubmit(data);
    }
  };

  return (
    <>
        <div className="text-center transition-opacity duration-500 ease-in-out">
        <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
            <svg
                className="h-8 w-8 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
            </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-800">Provide Your Data</h2>
            <p className="mt-2 text-slate-500">
            Upload a CSV or TSV file, or paste your data into the text area below to begin.
            </p>
        </div>

        <form onSubmit={handleSubmit}>
            <div 
            className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            aria-label="File upload drop zone"
            >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv, .tsv, text/csv, text/tab-separated-values"
                className="hidden"
            />
            {fileName ? (
                <div className="flex flex-col items-center justify-center">
                    <svg className="h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                <p className="mt-2 font-medium text-slate-700">{fileName}</p>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation(); 
                        handleRemoveFile();
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 font-semibold"
                >
                    Remove
                </button>
                </div>
            ) : (
                <div className="flex flex-col items-center pointer-events-none">
                <svg className="h-12 w-12 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <p className="mt-2 text-sm text-slate-600">
                    <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">CSV or TSV file</p>
                </div>
            )}
            </div>
            
            <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-white px-2 text-sm text-slate-500">OR</span>
            </div>
            </div>
            
            <textarea
            value={data}
            onChange={(e) => {
                setData(e.target.value);
                if (fileName) {
                    handleRemoveFile();
                }
            }}
            placeholder="Paste your data here...
id,name,feedback,rating
1,John Doe,Great product!,5
2,Jane Smith,Could be better.,3
..."
            className="w-full h-48 p-4 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
            aria-label="Paste your data"
            />

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            
            <button
            type="submit"
            disabled={!data.trim()}
            className="mt-6 w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
            Analyze Data
            </button>
        </form>
        </div>
        
        {savedAnalyses.length > 0 && (
            <div className="mt-16">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-300" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-lg font-medium text-slate-600">
                            Or Load a Previous Analysis
                        </span>
                    </div>
                </div>
                <ul role="list" className="mt-8 space-y-4">
                    {savedAnalyses.map((analysis) => (
                    <li key={analysis.id} className="bg-slate-50 rounded-lg p-4 shadow-sm border border-slate-200 flex items-center justify-between space-x-4">
                        {editingAnalysisId === analysis.id ? (
                            <>
                                <div className="flex-1 min-w-0">
                                    <input
                                        type="text"
                                        value={editingAnalysisName}
                                        onChange={(e) => setEditingAnalysisName(e.target.value)}
                                        className="block w-full px-3 py-1.5 text-md text-slate-900 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        autoFocus
                                        onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleConfirmEdit();
                                        if (e.key === 'Escape') handleCancelEdit();
                                        }}
                                    />
                                </div>
                                <div className="flex-shrink-0 flex items-center space-x-2">
                                    <button
                                        onClick={handleConfirmEdit}
                                        aria-label="Confirm new name"
                                        className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                    >
                                        <svg className="h-5 w-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        aria-label="Cancel editing"
                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    >
                                        <svg className="h-5 w-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-md font-semibold text-slate-800 truncate">{analysis.report.title}</p>
                                    <p className="text-sm text-slate-500">
                                        Saved on {new Date(analysis.savedAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 flex items-center space-x-2">
                                    <button
                                        onClick={() => handleStartEdit(analysis)}
                                        aria-label={`Edit title for ${analysis.report.title}`}
                                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                    >
                                        <svg className="h-5 w-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onLoadAnalysis(analysis)}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                    >
                                        Load
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAnalysis(analysis.id)}
                                        aria-label={`Delete analysis titled ${analysis.report.title}`}
                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    >
                                        <svg className="h-5 w-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09.92-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </>
                        )}
                    </li>
                    ))}
                </ul>
            </div>
        )}
    </>
  );
};

export default FileUpload;