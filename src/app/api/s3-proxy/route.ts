import { NextRequest, NextResponse } from 'next/server';

const S3_DATASET_PREFIX = process.env.NEXT_PUBLIC_S3_DATASET_PREFIX || 's3://xlab-eks/datasets/';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
  }

  try {
    // Build S3 path
    const s3Prefix = S3_DATASET_PREFIX.replace(/\/$/, '');
    const s3Path = `${s3Prefix}/${path}`;
    
    // Use AWS SDK to fetch from S3
    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');
    
    // Parse S3 URL
    const s3Url = s3Path.startsWith('s3://') ? s3Path.substring(5) : s3Path;
    const [bucket, ...keyParts] = s3Url.split('/');
    const key = keyParts.join('/');

    const client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await client.send(command);
    
    if (!response.Body) {
      return NextResponse.json({ error: 'Empty response from S3' }, { status: 404 });
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Determine content type
    const contentType = response.ContentType || 'application/octet-stream';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('S3 proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch from S3' },
      { status: 500 }
    );
  }
}
