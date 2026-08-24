type R2Module = {
  S3Client: new (config: Record<string, unknown>) => {
    send: (command: unknown) => Promise<unknown>;
  };
  HeadObjectCommand: new (input: Record<string, unknown>) => unknown;
  PutObjectCommand: new (input: Record<string, unknown>) => unknown;
};

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_URL,
  );
}

async function loadS3(): Promise<R2Module | null> {
  try {
    // Optional dependency — local .cache/audio works when the SDK is not installed.
    return (await import("@aws-sdk/client-s3")) as unknown as R2Module;
  } catch {
    return null;
  }
}

export async function r2Head(key: string): Promise<string | null> {
  if (!isR2Configured()) return null;
  const s3 = await loadS3();
  if (!s3) return null;

  const client = new s3.S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  try {
    await client.send(
      new s3.HeadObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      }),
    );
    return getR2PublicUrl(key);
  } catch {
    return null;
  }
}

export async function r2Put(key: string, buffer: Buffer): Promise<string | null> {
  if (!isR2Configured()) return null;
  const s3 = await loadS3();
  if (!s3) return null;

  const client = new s3.S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  await client.send(
    new s3.PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: "audio/mpeg",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return getR2PublicUrl(key);
}

export function getR2PublicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
  return `${base}/${key}`;
}
