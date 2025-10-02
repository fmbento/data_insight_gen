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

export interface InsightfulQuestion {
  question: string;
  description: string;
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

export interface FieldMetric {
  fieldName: string;
  description: string;
  stats: {
    key: string;
    value: string;
  }[];
}

export interface GeoCoordinates {
    latitude: number;
    longitude: number;
}

export interface GeoAnalysis {
    summary: string;
    identifiedLatField: string;
    identifiedLonField: string;
    boundingBox: {
        topLeft: GeoCoordinates;
        topRight: GeoCoordinates;
        bottomRight: GeoCoordinates;
        bottomLeft: GeoCoordinates;
    };
}

export interface AnalysisReport {
  title: string;
  summary: string;
  datasetDescription?: string;
  sourceUrl?: string;
  keyMetrics: Metric[];
  charts: Chart[];
  contentAnalysis: ContentAnalysis;
  interactiveElements: InteractiveElement[];
  insightfulQuestions?: InsightfulQuestion[];
  customSections?: CustomSection[];
  outlierAnalysis?: OutlierAnalysis;
  fieldMetrics?: FieldMetric[];
  geoAnalysis?: GeoAnalysis;
}

export interface SavedAnalysis {
  id: number;
  savedAt: string;
  report: AnalysisReport;
  wasSampleAnalyzed: boolean;
}
