import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ecotrack_session')?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded ? decoded.userId : null;
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Fetch goals error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetReductionPct } = body;

    if (!targetReductionPct || targetReductionPct <= 0 || targetReductionPct > 100) {
      return NextResponse.json({ error: 'Invalid target reduction percentage' }, { status: 400 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile || !profile.onboardingCompleted) {
      return NextResponse.json({ error: 'Please complete onboarding first' }, { status: 400 });
    }

    const baselineTotal = profile.baselineTotal;
    const targetCo2 = baselineTotal * (1 - targetReductionPct / 100);

    // Deactivate previous active goals
    await prisma.goal.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    const goal = await prisma.goal.create({
      data: {
        userId,
        targetReductionPct: Number(targetReductionPct),
        targetCo2,
        endDate: oneYearFromNow,
        isActive: true,
      }
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Create goal error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
