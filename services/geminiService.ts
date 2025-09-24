import { GoogleGenAI, Type } from "@google/genai";
import type { PreliminaryAnalysis, AnalysisReport } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const SAMPLE_SIZE = 100;

export function getSampleData(data: string): string {
  const lines = data.trim().split('\n');
  if (lines.length <= SAMPLE_SIZE + 1) { // +1 for the header
    return data;
  }
  
  const header = lines[0];
  const dataRows = lines.slice(1);

  // Fisher-Yates (aka Knuth) Shuffle for a random sample
  for (let i = dataRows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dataRows[i], dataRows[j]] = [dataRows[j], dataRows[i]];
  }

  const sampleLines = dataRows.slice(0, SAMPLE_SIZE);
  
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
        customSections: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "Title for the custom analysis section." },
                    content: { type: Type.STRING, description: "Content for the custom section, formatted as Markdown." },
                },
                required: ['title', 'content'],
            },
        },
        outlierAnalysis: {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING },
                outliers: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            recordId: { type: Type.STRING },
                            field: { type: Type.STRING },
                            value: { type: Type.STRING },
                            reason: { type: Type.STRING },
                        },
                        required: ['recordId', 'field', 'value', 'reason'],
                    },
                },
            },
            required: ['summary', 'outliers'],
        },
        fieldMetrics: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    fieldName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    stats: {
                        type: Type.ARRAY,
                        description: "An array of key-value pairs for statistics.",
                        items: {
                           type: Type.OBJECT,
                           properties: {
                               key: { type: Type.STRING, description: "The name of the statistic (e.g., 'Min', 'Max')." },
                               value: { type: Type.STRING, description: "The value of the statistic." },
                           },
                           required: ['key', 'value'],
                        }
                    },
                },
                required: ['fieldName', 'description', 'stats'],
            },
        },
        geoAnalysis: {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING },
                identifiedLatField: { type: Type.STRING },
                identifiedLonField: { type: Type.STRING },
                boundingBox: {
                    type: Type.OBJECT,
                    properties: {
                        topLeft: {
                            type: Type.OBJECT,
                            properties: { latitude: { type: Type.NUMBER }, longitude: { type: Type.NUMBER } },
                            required: ['latitude', 'longitude'],
                        },
                        topRight: {
                            type: Type.OBJECT,
                            properties: { latitude: { type: Type.NUMBER }, longitude: { type: Type.NUMBER } },
                            required: ['latitude', 'longitude'],
                        },
                        bottomRight: {
                            type: Type.OBJECT,
                            properties: { latitude: { type: Type.NUMBER }, longitude: { type: Type.NUMBER } },
                            required: ['latitude', 'longitude'],
                        },
                        bottomLeft: {
                            type: Type.OBJECT,
                            properties: { latitude: { type: Type.NUMBER }, longitude: { type: Type.NUMBER } },
                            required: ['latitude', 'longitude'],
                        },
                    },
                    required: ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'],
                },
            },
            required: ['summary', 'identifiedLatField', 'identifiedLonField', 'boundingBox'],
        },
    },
    required: ['title', 'summary', 'keyMetrics', 'charts', 'contentAnalysis', 'interactiveElements'],
};


export async function generateReport(data: string, useSample: boolean, customInstructions: string, detectOutliers: boolean): Promise<AnalysisReport> {
    const dataToAnalyze = useSample ? getSampleData(data) : data;
    
    const recordCount = dataToAnalyze.trim().split('\n').filter(line => line.trim() !== '').length - 1;

    const analysisScope = useSample 
      ? `a representative random sample of ${recordCount} records` 
      : `the full dataset, which contains ${recordCount} records`;

    const customInstructionsSection = (customInstructions && customInstructions.trim() !== '') 
        ? `
**User-Provided Instructions (High Priority):**
The user has provided the following instructions that you MUST address: "${customInstructions.trim()}"

**How to Handle Custom Instructions:**
- If the instruction asks for a specific analysis that doesn't fit into the standard report sections, you MUST generate a new section for it in the 'customSections' array.
- For each distinct request, create a separate object in the 'customSections' array with a clear 'title' and Markdown-formatted 'content'.
- If the instructions are clarifications, apply this focus to the relevant existing sections AND add a custom section confirming you followed the instruction.
`
        : '';

    const outlierAnalysisSection = (detectOutliers && !useSample)
        ? `
**Outlier and Anomaly Detection (High Priority):**
You MUST perform an outlier analysis on the full dataset, which contains exactly ${recordCount} records. This is a critical task.
- For each column, determine a likely data type and expected range or pattern for its values. For geographic coordinates, check if they fall within standard lat/long ranges (-90 to +90 for latitude, -180 to +180 for longitude).
- Identify any values that deviate significantly from the norm.
- Populate the 'outlierAnalysis' section of your JSON response with your findings.
- The 'summary' MUST begin by stating that the analysis was performed on the full dataset of ${recordCount} records. For example: "The outlier analysis of all ${recordCount} records revealed...".
- For each outlier found, provide a detailed entry in the 'outliers' array. Use a primary key from the data (e.g., 'id') for 'recordId' if available; otherwise, use the 1-based row number.
- If NO outliers are found after a thorough check, you MUST state this clearly in the summary (e.g., "A thorough analysis of all ${recordCount} records found no significant outliers.") and return an empty 'outliers' array.
`
        : '';
    
    const systemInstruction = `You are a professional data analyst. Your task is to analyze the provided data and generate a comprehensive report. The report must be a single, complete JSON object that strictly conforms to the provided schema. Do not include any text or formatting before or after the JSON object.`;

    const prompt = `
Please analyze the data provided below and generate the report.

${customInstructionsSection}
${outlierAnalysisSection}
    
**Analysis Context:**
- The data you are analyzing is ${analysisScope}.
- It is a critical requirement that any mention of the number of records in your analysis (in summaries, descriptions, etc.) MUST correctly state the total of ${recordCount} records. Do not miscount or estimate the number of records.

**Analysis Tasks to Perform:**
1.  **Summarize:** Provide a concise, insightful summary of the data.
2.  **Key Metrics:** Identify and calculate at least 3-5 high-level key metrics (e.g., averages, totals, counts) for the overall dataset.
3.  **Field-level Analysis:** For EACH column/field, provide a brief 'description' of what the data represents. For numeric fields, calculate key statistics like 'Min', 'Max', 'Average', and 'Standard Deviation'. For text or categorical fields, you can omit numeric stats or provide stats like 'Unique Values'. Populate your findings into the 'fieldMetrics' array. Each statistic MUST be an object with 'key' and 'value' properties (e.g., { "key": "Min", "value": "10" }).
4.  **Charts:** Generate data for 2-3 charts (bar or pie) to visualize key distributions.
5.  **Content Analysis:** If text fields are present, perform sentiment analysis and identify recurring themes.
6.  **Interactivity:** Suggest 1-2 interactive elements that could enhance the report.
7.  **Geospatial Analysis:** Scrutinize the data fields to identify any that contain geographic latitude and longitude coordinates. If found:
    - Identify the names of the latitude and longitude fields.
    - Calculate the geographic bounding box by determining the minimum and maximum latitude and longitude values.
    - Construct the four corner points: 'topLeft', 'topRight', 'bottomRight', and 'bottomLeft'.
    - Provide a 'summary' of the geographic area covered.
    - Populate all this information into the 'geoAnalysis' object.
    - If no geographic data is found, you MUST omit the 'geoAnalysis' object entirely from your response.
8.  **Outlier Analysis:** If requested, perform the outlier detection as described in the 'Outlier and Anomaly Detection' section.
9.  **Custom Analysis:** If user instructions were provided, address them by creating sections in the 'customSections' array.
    
**Data to Analyze:**
\`\`\`
${dataToAnalyze}
\`\`\`
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
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