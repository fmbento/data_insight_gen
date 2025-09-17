
import React from 'react';
import type { Metric } from '../types';

interface MetricCardProps {
  metric: Metric;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-slate-500 truncate">{metric.label}</dt>
              <dd className="flex items-baseline">
                <p className="text-2xl font-semibold text-slate-900">{metric.value}</p>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 px-5 py-3">
        <div className="text-sm">
          <p className="text-slate-600">{metric.description}</p>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
