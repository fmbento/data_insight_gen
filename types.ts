
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

export interface VisualElement {
  type: 'image' | 'animated_graphic';
  description: string;
  visualization_of: string;
}

export interface InteractiveElement {
  description: string;
  functionality: string;
}

export interface AnalysisReport {
  title: string;
  summary: string;
  keyMetrics: Metric[];
  charts: Chart[];
  contentAnalysis: ContentAnalysis;
  visualElements: VisualElement[];
  interactiveElements: InteractiveElement[];
}
