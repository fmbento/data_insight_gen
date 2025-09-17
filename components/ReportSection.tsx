
import React from 'react';

interface ReportSectionProps {
  title: string;
  children: React.ReactNode;
}

const ReportSection: React.FC<ReportSectionProps> = ({ title, children }) => {
  return (
    <section>
      <div className="pb-5 border-b border-slate-200 mb-6">
        <h2 className="text-2xl font-semibold leading-6 text-slate-900">{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
};

export default ReportSection;
