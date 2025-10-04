// Health check endpoint
export async function healthCheck(req: Request, res: Response) {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
}
