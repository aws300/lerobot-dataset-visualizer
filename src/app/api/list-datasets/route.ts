import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

export async function GET() {
  try {
    const prefix = process.env.NEXT_PUBLIC_S3_DATASET_PREFIX || '';
    const match = prefix.match(/^s3:\/\/([^\/]+)\/(.*)$/);
    
    if (!match) {
      return NextResponse.json({ datasets: [] });
    }

    const [, bucket, basePrefix] = match;
    const datasets: Array<{ path: string; lastModified: Date }> = [];

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: basePrefix,
      Delimiter: '/',
    });

    const response = await s3Client.send(command);
    
    if (response.CommonPrefixes) {
      for (const prefix of response.CommonPrefixes) {
        const orgDir = prefix.Prefix?.replace(basePrefix, '').replace('/', '');
        if (!orgDir || orgDir === 's3') continue;

        const subCommand = new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: `${basePrefix}${orgDir}/`,
          Delimiter: '/',
        });

        const subResponse = await s3Client.send(subCommand);
        
        if (subResponse.CommonPrefixes) {
          for (const subPrefix of subResponse.CommonPrefixes) {
            const datasetPath = subPrefix.Prefix?.replace(basePrefix, '').replace(/\/$/, '');
            if (datasetPath) {
              const objCommand = new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: subPrefix.Prefix,
                MaxKeys: 1,
              });
              const objResponse = await s3Client.send(objCommand);
              const lastModified = objResponse.Contents?.[0]?.LastModified || new Date(0);
              datasets.push({ path: datasetPath, lastModified });
            }
          }
        }
      }
    }

    const sortedDatasets = datasets
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
      .slice(0, 10)
      .map(d => d.path);

    return NextResponse.json({ datasets: sortedDatasets });
  } catch (error) {
    console.error('Error listing datasets:', error);
    return NextResponse.json({ datasets: [] });
  }
}
