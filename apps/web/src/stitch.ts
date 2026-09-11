export type StitchServerInfo = {
  name?: string;
  version?: string;
};

export type StitchInitializeResult = {
  protocolVersion?: string;
  capabilities?: Record<string, unknown>;
  serverInfo?: StitchServerInfo;
};

export type StitchTool = {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
};

const STITCH_MCP_URL = 'https://stitch.googleapis.com/mcp';

async function sendStitchRequest<T>(method: string, params?: Record<string, unknown>): Promise<T | null> {
  const apiKey = import.meta.env.VITE_STITCH_API_KEY as string | undefined;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(STITCH_MCP_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: crypto.randomUUID(),
        method,
        params,
      }),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function initializeGoogleStitch(): Promise<StitchInitializeResult | null> {
  const data = await sendStitchRequest<{ result?: StitchInitializeResult }>('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'music-folder-web',
      version: '1.0.0',
    },
  });

  return data?.result ?? null;
}

export async function listGoogleStitchTools(): Promise<StitchTool[]> {
  const data = await sendStitchRequest<{ result?: { tools?: StitchTool[] } }>('tools/list');
  return data?.result?.tools ?? [];
}
