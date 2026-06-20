import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ecotrack_session')?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded ? decoded.userId : null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { co2Saved, description } = body;

    const activity = await prisma.activity.findUnique({
      where: { id }
    });

    if (!activity || activity.userId !== userId) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        co2Saved: co2Saved !== undefined ? Number(co2Saved) : activity.co2Saved,
        description: description || activity.description,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update activity error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const activity = await prisma.activity.findUnique({
      where: { id }
    });

    if (!activity || activity.userId !== userId) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    await prisma.activity.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete activity error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
