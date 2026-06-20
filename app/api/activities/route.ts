import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';
import { ACTION_LIBRARY } from '@/lib/carbon';

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

    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Fetch activities error:', error);
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
    const { actionId } = body;

    const action = ACTION_LIBRARY.find(a => a.id === actionId);
    if (!action) {
      return NextResponse.json({ error: 'Invalid action ID' }, { status: 400 });
    }

    // Create the activity log
    const activity = await prisma.activity.create({
      data: {
        userId,
        actionId: action.id,
        category: action.category,
        title: action.title,
        description: action.description,
        co2Saved: action.co2SavedPerOccurrence,
      }
    });

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await prisma.streak.findUnique({
      where: { userId }
    });

    if (!streak) {
      await prisma.streak.create({
        data: {
          userId,
          currentStreak: 1,
          maxStreak: 1,
          lastLoggedDate: today
        }
      });
    } else {
      let current = streak.currentStreak;
      let max = streak.maxStreak;
      const last = streak.lastLoggedDate ? new Date(streak.lastLoggedDate) : null;

      if (last) {
        last.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - last.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          current += 1;
          max = Math.max(max, current);
        } else if (diffDays > 1) {
          current = 1;
        }
      } else {
        current = 1;
        max = Math.max(max, current);
      }

      await prisma.streak.update({
        where: { userId },
        data: {
          currentStreak: current,
          maxStreak: max,
          lastLoggedDate: today
        }
      });
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Create activity error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
