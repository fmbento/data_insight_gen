
export enum AppStep {
  FileUpload,
  AnalysisOptions,
  Loading,
  Report,
}

export interface PreliminaryAnalysis {
  recordCount: number;
  fields: string[];
}

export interface Metric {
  label: string;
  value: string;
  description: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface Chart {
  title: string;
  type: 'bar' | 'pie';
  data: ChartData[];
}

export interface ContentAnalysis {
    sentiment: {
        label: string;
        score: number;
        description: string;
    };
    themes: {
        theme: string;
        count: number;
        examples: string[];
    }[];
}

export interface InteractiveElement {
  description: string;
  functionality: string;
}

export interface CustomSection {
  title: string;
  content: string; // AI can format this with Markdown
}

export interface OutlierRecord {
  recordId: string | number;
  field: string;
  value: string;
  reason: string;
}

export interface OutlierAnalysis {
  summary: string;
  outliers: OutlierRecord[];
}

export interface AnalysisReport {
  title: string;
  summary: string;
  keyMetrics: Metric[];
  charts: Chart[];
  contentAnalysis: ContentAnalysis;
  interactiveElements: InteractiveElement[];
  customSections?: CustomSection[];
  outlierAnalysis?: OutlierAnalysis;
}