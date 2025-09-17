
import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onSubmit: (data: string) => void;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onSubmit, error }) => {
  const [data, setData] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  );
};

export default FileUpload;
