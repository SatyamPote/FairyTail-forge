import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const imagePath = path.join(process.cwd(), '..', 'data', 'generated_images', filename);

  if (!fs.existsSync(imagePath)) {
    return new NextResponse('Image not found', { status: 404 });
  }

  const imageBuffer = fs.readFileSync(imagePath);
  const extension = path.extname(filename).toLowerCase();
  const contentType = extension === '.png' ? 'image/png' : 'image/jpeg';

  return new NextResponse(imageBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
