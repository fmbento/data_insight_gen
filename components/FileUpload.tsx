
import React, { useState } from 'react';

interface FileUploadProps {
  onSubmit: (data: string) => void;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onSubmit, error }) => {
  const [data, setData] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.trim()) {
      onSubmit(data);
    }
  };

  return (
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
        <h2 className="text-2xl font-semibold text-slate-800">Upload Your Data</h2>
        <p className="mt-2 text-slate-500">
          Please paste your data (e.g., CSV, TSV) into the text area below to begin the analysis.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="id,name,feedback,rating
1,John Doe,Great product!,5
2,Jane Smith,Could be better.,3
..."
          className="w-full h-64 p-4 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
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
  );
};

export default FileUpload;
