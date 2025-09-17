
import { GoogleGenAI, Type } from "@google/genai";
import type { PreliminaryAnalysis, AnalysisReport } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SAMPLE_SIZE = 100;

function getSampleData(data: string): string {
  const lines = data.trim().split('\n');
  if (lines.length <= SAMPLE_SIZE + 1) {
    return data;
  }
  const header = lines[0];
  const sampleLines = lines.slice(1, SAMPLE_SIZE + 1);
  return [header, ...sampleLines].join('\n');
}

/**
 * Performs a preliminary analysis on the raw data locally to avoid hitting API token limits.
 * It counts the number of records and extracts the header fields.
 * @param data The raw string data (e.g., CSV content).
 * @returns A promise that resolves to a PreliminaryAnalysis object.
 */
export async function getPreliminaryAnalysis(data: string): Promise<PreliminaryAnalysis> {
    try {
        if (!data || data.trim() === '') {
            throw new Error("Input data is empty.");
        }

        const lines = data.trim().split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
            throw new Error("Data must have a header and at least one data row.");
        }

        const header = lines[0].trim();
        
        // Basic delimiter detection (checks for comma, then tab, then multiple spaces)
        const delimiter = header.includes(',') ? ',' : header.includes('\t') ? '\t' : /\s{2,}/.test(header) ? /\s{2,}/ : ' ';
        
        const fields = header.split(delimiter).map(f => f.trim().replace(/^"|"$/g, ''));

        if (fields.length === 0 || (fields.length === 1 && fields[0] === '')) {
            throw new Error("Could not parse header fields. Please check the data format.");
        }

        const recordCount = lines.length - 1;

        return Promise.resolve({ recordCount, fields });

    } catch (e: any) {
        console.error("Local preliminary analysis failed:", e);
        throw new Error(`Failed to parse data for preliminary analysis. Please ensure it's a valid text-based format (like CSV) with a header row. Details: ${e.message}`);
    }
}


const reportSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        keyMetrics: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.STRING },
                    description: { type: Type.STRING },
                },
                required: ['label', 'value', 'description'],
            },
        },
        charts: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['bar', 'pie'] },
                    data: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                value: { type: Type.NUMBER },
                            },
                             required: ['name', 'value'],
                        },
                    },
                },
                required: ['title', 'type', 'data'],
            },
        },
        contentAnalysis: {
            type: Type.OBJECT,
            properties: {
                sentiment: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        score: { type: Type.NUMBER },
                        description: { type: Type.STRING },
                    },
                    required: ['label', 'score', 'description'],
                },
                themes: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            theme: { type: Type.STRING },
                            count: { type: Type.INTEGER },
                            examples: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                         required: ['theme', 'count', 'examples'],
                    },
                },
            },
            required: ['sentiment', 'themes'],
        },
        visualElements: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['image', 'animated_graphic'] },
                    description: { type: Type.STRING },
                    visualization_of: { type: Type.STRING },
                },
                required: ['type', 'description', 'visualization_of'],
            },
        },
        interactiveElements: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING },
                    functionality: { type: Type.STRING },
                },
                required: ['description', 'functionality'],
            },
        },
    },
    required: ['title', 'summary', 'keyMetrics', 'charts', 'contentAnalysis', 'visualElements', 'interactiveElements'],
};


export async function generateReport(data: string, useSample: boolean): Promise<AnalysisReport> {
    const dataToAnalyze = useSample ? getSampleData(data) : data;
    const analysisScope = useSample ? `a representative sample of ${SAMPLE_SIZE} records` : 'the full dataset';
    
    const prompt = `
    Act as a professional data analyst. Analyze the following data from ${analysisScope} and generate a comprehensive report.
    The report must be a single JSON object conforming to the provided schema.
    
    **Analysis Tasks:**
    1.  **Summarize:** Provide a concise, insightful summary of the data.
    2.  **Key Metrics:** Identify and calculate at least 3-5 key metrics (e.g., averages, totals, counts, percentages). For each, provide a label, value, and brief description.
    3.  **Charts:** Generate data for 2-3 charts (bar or pie) to visualize key distributions or comparisons. Ensure chart data is suitable for plotting.
    4.  **Content Analysis:** If text fields (like feedback or reviews) are present, perform sentiment analysis (positive, neutral, negative) and identify 3-5 recurring themes with examples. If no text fields, state that this analysis is not applicable.
    5.  **Visuals:** Describe 2 visual elements (one static image, one animated graphic) that could be generated to enhance the report. Explain what data each would visualize.
    6.  **Interactivity:** Suggest 1-2 interactive elements that could be added to the report, describing their functionality (e.g., tooltips, filters).
    
    **Data to Analyze:**
    \`\`\`
    ${dataToAnalyze}
    \`\`\`
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: reportSchema,
        },
    });

    const jsonString = response.text.trim();
    try {
        return JSON.parse(jsonString) as AnalysisReport;
    } catch (e) {
        console.error("Failed to parse report JSON:", jsonString);
        throw new Error("Received invalid JSON from AI for the report.");
    }
}
