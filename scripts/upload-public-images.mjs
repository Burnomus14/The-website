import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const publicDirectory = fileURLToPath(new URL('../public/', import.meta.url));
const imageExtension = /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|tif?f|webp)$/i;

function signParameters(parameters, apiSecret) {
  const payload = Object.keys(parameters)
    .sort()
    .map((key) => `${key}=${parameters[key]}`)
    .join('&');

  return createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');
}

async function findImages(directory) {
  const files = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findImages(filePath));
    } else if (entry.isFile() && imageExtension.test(entry.name)) {
      files.push(filePath);
    }
  }

  return files;
}

async function uploadImage(filePath, cloudName, apiKey, apiSecret) {
  const relativePath = path.relative(publicDirectory, filePath).split(path.sep).join('/');
  const publicId = relativePath.replace(imageExtension, '');
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const parameters = { invalidate: 'true', overwrite: 'true', public_id: publicId, timestamp };
  const signature = signParameters(parameters, apiSecret);
  const form = new FormData();

  form.set('file', new Blob([await readFile(filePath)]), path.basename(filePath));
  form.set('api_key', apiKey);
  form.set('signature', signature);
  for (const [key, value] of Object.entries(parameters)) form.set(key, value);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message = typeof result?.error?.message === 'string' ? result.error.message : response.statusText;
    throw new Error(`Cloudinary upload failed for ${relativePath} (${response.status}): ${message}`);
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!dryRun && (!cloudName || !apiKey || !apiSecret)) {
    throw new Error('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET before uploading.');
  }
  if (cloudName && !/^[a-z0-9_-]+$/i.test(cloudName)) {
    throw new Error('CLOUDINARY_CLOUD_NAME must be a valid Cloudinary cloud name.');
  }

  const files = (await findImages(publicDirectory)).sort();
  const publicIds = new Set();
  for (const filePath of files) {
    const relativePath = path.relative(publicDirectory, filePath).split(path.sep).join('/');
    const publicId = relativePath.replace(imageExtension, '');
    if (publicIds.has(publicId)) throw new Error(`Multiple image files map to Cloudinary public ID "${publicId}".`);
    publicIds.add(publicId);
  }

  if (files.length === 0) throw new Error('No supported image files were found in public/.');

  if (dryRun) {
    console.log(`Dry run: ${files.length} public images are ready to upload.`);
    return;
  }

  for (let index = 0; index < files.length; index += 1) {
    const relativePath = path.relative(publicDirectory, files[index]).split(path.sep).join('/');
    await uploadImage(files[index], cloudName, apiKey, apiSecret);
    console.log(`Uploaded ${index + 1}/${files.length}: ${relativePath}`);
  }

  console.log(`Uploaded ${files.length} public images to Cloudinary.`);
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Cloudinary upload failed.');
  process.exitCode = 1;
}
