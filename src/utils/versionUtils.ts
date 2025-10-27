/**
 * Utility functions for checking dataset version compatibility
 */

const USE_HUGGINGFACE = process.env.NEXT_PUBLIC_USE_HUGGINGFACE === "true";
const S3_DATASET_PREFIX = process.env.NEXT_PUBLIC_S3_DATASET_PREFIX || "s3://xlab-eks/datasets/";
const DATASET_URL = USE_HUGGINGFACE 
  ? (process.env.DATASET_URL || "https://huggingface.co/datasets")
  : S3_DATASET_PREFIX;

/**
 * Fetch data from S3 directly (server-side) or via API proxy (client-side)
 */
export async function fetchFromS3(path: string): Promise<Response> {
  if (typeof window !== 'undefined') {
    // Client side - use API proxy
    return fetch(`${window.location.origin}/api/s3-proxy?path=${encodeURIComponent(path)}`);
  } else {
    // Server side - call S3 directly
    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');
    
    const s3Prefix = S3_DATASET_PREFIX.replace(/\/$/, '');
    const s3Path = `${s3Prefix}/${path}`;
    const s3Url = s3Path.startsWith('s3://') ? s3Path.substring(5) : s3Path;
    const [bucket, ...keyParts] = s3Url.split('/');
    const key = keyParts.join('/');

    const client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });

    try {
      const response = await client.send(command);
      if (!response.Body) {
        throw new Error('Empty response from S3');
      }

      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': response.ContentType || 'application/octet-stream',
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to fetch from S3: ${error.message}`);
    }
  }
}

/**
 * Dataset information structure from info.json
 */
interface DatasetInfo {
  codebase_version: string;
  robot_type: string | null;
  total_episodes: number;
  total_frames: number;
  total_tasks: number;
  chunks_size: number;
  data_files_size_in_mb: number;
  video_files_size_in_mb: number;
  fps: number;
  splits: Record<string, string>;
  data_path: string;
  video_path: string;
  features: Record<string, any>;
}

/**
 * Fetches dataset information from the main revision
 */
export async function getDatasetInfo(repoId: string): Promise<DatasetInfo> {
  try {
    let response: Response;
    
    if (USE_HUGGINGFACE) {
      const testUrl = `${DATASET_URL}/${repoId}/resolve/main/meta/info.json`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      response = await fetch(testUrl, { 
        method: "GET",
        cache: "no-store",
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
    } else {
      // Use direct S3 access or API proxy
      response = await fetchFromS3(`${repoId}/meta/info.json`);
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch dataset info: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if it has the required structure
    if (!data.features) {
      throw new Error("Dataset info.json does not have the expected features structure");
    }
    
    return data as DatasetInfo;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      `Dataset ${repoId} is not compatible with this visualizer. ` +
      "Failed to read dataset information from the main revision."
    );
  }
}


/**
 * Gets the dataset version by reading the codebase_version from the main revision's info.json
 */
export async function getDatasetVersion(repoId: string): Promise<string> {
  try {
    const datasetInfo = await getDatasetInfo(repoId);
    
    // Extract codebase_version
    const codebaseVersion = datasetInfo.codebase_version;
    if (!codebaseVersion) {
      throw new Error("Dataset info.json does not contain codebase_version");
    }
    
    // Validate that it's a supported version
    const supportedVersions = ["v3.0", "v2.1", "v2.0"];
    if (!supportedVersions.includes(codebaseVersion)) {
      throw new Error(
        `Dataset ${repoId} has codebase version ${codebaseVersion}, which is not supported. ` +
        "This tool only works with dataset versions 3.0, 2.1, or 2.0. " +
        "Please use a compatible dataset version."
      );
    }
    
    return codebaseVersion;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      `Dataset ${repoId} is not compatible with this visualizer. ` +
      "Failed to read dataset information from the main revision."
    );
  }
}

export function buildVersionedUrl(repoId: string, version: string, path: string): string {
  if (USE_HUGGINGFACE) {
    return `${DATASET_URL}/${repoId}/resolve/main/${path}`;
  } else {
    // Always return s3-proxy: marker - will be converted by fetch functions or client-side
    return `s3-proxy:${repoId}/${path}`;
  }
}

/**
 * Convert s3-proxy: URL to HTTP URL (client-side only)
 */
export function resolveS3ProxyUrl(url: string): string {
  if (url.startsWith('s3-proxy:') && typeof window !== 'undefined') {
    const path = url.replace('s3-proxy:', '');
    return `${window.location.origin}/api/s3-proxy?path=${encodeURIComponent(path)}`;
  }
  return url;
}

