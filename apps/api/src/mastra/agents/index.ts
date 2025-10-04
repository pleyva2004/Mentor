import { Agent } from '@mastra/core';
import { defaultModel } from '../config/models';
import { z } from 'zod';

// Example Customer Support Agent
export const customerSupportAgent = new Agent({
  name: 'customer-support',
  model: defaultModel,
  instructions: `You are a helpful customer support agent.
  Assist users with their questions and issues in a friendly and professional manner.`,
  tools: {
    // Add tools here
  },
});

// Example Data Analyst Agent
export const dataAnalystAgent = new Agent({
  name: 'data-analyst',
  model: defaultModel,
  instructions: `You are a data analyst AI assistant.
  Help users analyze data, create visualizations, and derive insights.`,
  tools: {
    // Add tools here
  },
});

// Export all agents
export const agents = {
  customerSupportAgent,
  dataAnalystAgent,
};
