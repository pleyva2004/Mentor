import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

// Welcome Email Step
const welcomeEmailStep = createStep({
  id: 'welcome-email',
  inputSchema: z.object({
    userId: z.string(),
    email: z.string().email(),
    name: z.string(),
  }),
  outputSchema: z.object({
    sent: z.boolean(),
  }),
  execute: async ({ inputData }) => {
    // Send welcome email
    console.log(`Sending welcome email to ${inputData.email}`);
    return { sent: true };
  },
});

// Setup Profile Step
const setupProfileStep = createStep({
  id: 'setup-profile',
  inputSchema: z.object({
    userId: z.string(),
    email: z.string().email(),
    name: z.string(),
  }),
  outputSchema: z.object({
    profileCreated: z.boolean(),
  }),
  execute: async ({ inputData }) => {
    // Setup user profile
    console.log(`Setting up profile for ${inputData.name}`);
    return { profileCreated: true };
  },
});

// Example Onboarding Workflow
export const onboardingWorkflow = createWorkflow({
  id: 'onboarding-flow',
  description: 'User onboarding workflow',
  inputSchema: z.object({
    userId: z.string(),
    email: z.string().email(),
    name: z.string(),
  }),
  outputSchema: z.object({
    profileCreated: z.boolean(),
  }),
})
  .then(welcomeEmailStep)
  .then(setupProfileStep)
  .commit();

// Fetch Data Step
const fetchDataStep = createStep({
  id: 'fetch-data',
  inputSchema: z.object({
    dataSource: z.string(),
    format: z.enum(['csv', 'json', 'xml']),
  }),
  outputSchema: z.object({
    data: z.array(z.any()),
  }),
  execute: async ({ inputData }) => {
    // Fetch data from source
    console.log(`Fetching data from ${inputData.dataSource}`);
    return { data: [] };
  },
});

// Process Data Step
const processDataStep = createStep({
  id: 'process-data',
  inputSchema: z.object({
    data: z.array(z.any()),
    format: z.enum(['csv', 'json', 'xml']),
  }),
  outputSchema: z.object({
    processed: z.boolean(),
  }),
  execute: async ({ inputData }) => {
    // Process the data
    console.log(`Processing data in ${inputData.format} format`);
    return { processed: true };
  },
});

// Example Data Processing Workflow
export const dataProcessingWorkflow = createWorkflow({
  id: 'data-processing',
  description: 'Data processing workflow',
  inputSchema: z.object({
    dataSource: z.string(),
    format: z.enum(['csv', 'json', 'xml']),
  }),
  outputSchema: z.object({
    processed: z.boolean(),
  }),
})
  .then(fetchDataStep)
  .map(({ inputData, getStepResult }) => ({
    data: getStepResult(fetchDataStep).data,
    format: inputData.format,
  }))
  .then(processDataStep)
  .commit();

// Export all workflows
export const workflows = {
  onboardingWorkflow,
  dataProcessingWorkflow,
};
