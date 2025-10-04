'use client';

import { useState } from 'react';
import { executeWorkflow } from '@/lib/mastra-client';

export default function WorkflowsPage() {
  const [workflowId, setWorkflowId] = useState('onboarding-flow');
  const [input, setInput] = useState('{}');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    try {
      const parsedInput = JSON.parse(input);
      const response = await executeWorkflow(workflowId, parsedInput);
      setResult(response);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Workflow Execution</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Workflow ID</label>
          <select
            value={workflowId}
            onChange={(e) => setWorkflowId(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="onboarding-flow">Onboarding Flow</option>
            <option value="data-processing">Data Processing</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Input (JSON)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-2 border rounded-lg font-mono text-sm"
            rows={6}
            placeholder='{"key": "value"}'
          />
        </div>

        <button
          onClick={handleExecute}
          disabled={loading}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Executing...' : 'Execute Workflow'}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
