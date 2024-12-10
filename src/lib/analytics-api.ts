import axios from 'axios';
import { z } from 'zod';

const API_URL = 'https://pandasai-production.up.railway.app/analyze';

export const AnalysisResponse = z.object({
  executed_code: z.string(),
  result: z.object({
    type: z.enum(['text', 'chart', 'table']),
    data: z.any(),
  }),
});

export type AnalysisResponse = z.infer<typeof AnalysisResponse>;

export class AnalyticsError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

export async function analyzeData(s3Key: string, query: string): Promise<AnalysisResponse> {
  try {
    const response = await axios.post(
      API_URL,
      {
        s3_key: s3Key,
        query: query,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 30000, // 30 seconds
      }
    );

    const validatedResponse = AnalysisResponse.parse(response.data);
    return validatedResponse;
  } catch (error) {
    console.error('Analytics API error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new AnalyticsError('Request timed out. Please try again.');
      }
      if (error.response?.status === 400) {
        throw new AnalyticsError('Invalid query format');
      }
      if (error.response?.status === 500) {
        throw new AnalyticsError('Server error. Please try again later.');
      }
    }
    
    throw new AnalyticsError('Failed to analyze data');
  }
}