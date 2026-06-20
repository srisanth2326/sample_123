import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';
import { calculateFootprint, FootprintInputs } from '@/lib/carbon';

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

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Fetch profile error:', error);
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
    const {
      carType,
      carKmPerWeek,
      publicTransitKmWeek,
      shortFlightsPerYear,
      longFlightsPerYear,
      homeSize,
      heatingSource,
      renewableTariff,
      dietType,
      shoppingFrequency,
      recyclingHabits
    } = body;

    const inputs: FootprintInputs = {
      carType: carType || 'none',
      carKmPerWeek: Number(carKmPerWeek) || 0,
      publicTransitKmWeek: Number(publicTransitKmWeek) || 0,
      shortFlightsPerYear: Number(shortFlightsPerYear) || 0,
      longFlightsPerYear: Number(longFlightsPerYear) || 0,
      homeSize: Number(homeSize) || 0,
      heatingSource: heatingSource || 'electricity',
      renewableTariff: !!renewableTariff,
      dietType: dietType || 'mixed',
      shoppingFrequency: shoppingFrequency || 'moderate',
    };

    const calculated = calculateFootprint(inputs);

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        onboardingCompleted: true,
        carType: inputs.carType,
        carKmPerWeek: inputs.carKmPerWeek,
        publicTransitKmWeek: inputs.publicTransitKmWeek,
        shortFlightsPerYear: inputs.shortFlightsPerYear,
        longFlightsPerYear: inputs.longFlightsPerYear,
        homeSize: inputs.homeSize,
        heatingSource: inputs.heatingSource,
        renewableTariff: inputs.renewableTariff,
        dietType: inputs.dietType,
        shoppingFrequency: shoppingFrequency || 'moderate',
        recyclingHabits: recyclingHabits || 'some',
        baselineTransport: calculated.transport,
        baselineHome: calculated.home,
        baselineFood: calculated.food,
        baselineGoods: calculated.goods,
        baselineTotal: calculated.total,
      },
      create: {
        userId,
        onboardingCompleted: true,
        carType: inputs.carType,
        carKmPerWeek: inputs.carKmPerWeek,
        publicTransitKmWeek: inputs.publicTransitKmWeek,
        shortFlightsPerYear: inputs.shortFlightsPerYear,
        longFlightsPerYear: inputs.longFlightsPerYear,
        homeSize: inputs.homeSize,
        heatingSource: inputs.heatingSource,
        renewableTariff: inputs.renewableTariff,
        dietType: inputs.dietType,
        shoppingFrequency: shoppingFrequency || 'moderate',
        recyclingHabits: recyclingHabits || 'some',
        baselineTransport: calculated.transport,
        baselineHome: calculated.home,
        baselineFood: calculated.food,
        baselineGoods: calculated.goods,
        baselineTotal: calculated.total,
      },
    });

    return NextResponse.json({ profile, calculated });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
