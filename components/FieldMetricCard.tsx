import React from 'react';
import type { FieldMetric } from '../types';

interface FieldMetricCardProps {
  metric: FieldMetric;
}

const FieldMetricCard: React.FC<FieldMetricCardProps> = ({ metric }) => {
  const { stats } = metric;

  return (
    <div className="bg-slate-50 overflow-hidden shadow-sm rounded-lg border border-slate-200 p-5 flex flex-col h-full">
      <h3 className="text-lg font-semibold text-slate-800 truncate" title={metric.fieldName}>{metric.fieldName}</h3>
      <p className="text-sm text-slate-600 mt-1 flex-grow">{metric.description}</p>
      
      {stats && stats.length > 0 ? (
        <dl className="mt-4 border-t border-slate-200 pt-4 space-y-2">
          {stats.map(({ key, value }) => (
            (value !== null && value !== undefined) && (
              <div key={key} className="flex justify-between text-sm">
                <dt className="text-slate-500 capitalize">{key}</dt>
                <dd className="font-medium text-slate-700 text-right">{String(value)}</dd>
              </div>
            )
          ))}
        </dl>
      ) : (
        <div className="mt-4 border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-500 italic">No quantitative stats available.</p>
        </div>
      )}
    </div>
  );
};

export default FieldMetricCard;