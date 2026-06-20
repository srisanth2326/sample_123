"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, Target, TrendingDown, AlertTriangle, ArrowRight, Zap, Info, Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { EmissionsBreakdownChart, CarbonSavingsTrendChart } from '@/components/Charts';
import Link from 'next/link';

interface Profile {
  onboardingCompleted: boolean;
  baselineTransport: number;
  baselineHome: number;
  baselineFood: number;
  baselineGoods: number;
  baselineTotal: number;
}

interface Streak {
  currentStreak: number;
  maxStreak: number;
}

interface Goal {
  targetReductionPct: number;
  targetCo2: number;
  isActive: boolean;
}

interface Activity {
  id: string;
  actionId: string;
  category: string;
  title: string;
  description: string;
  co2Saved: number;
  timestamp: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newGoalPct, setNewGoalPct] = useState('20');
  const [settingGoal, setSettingGoal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        
        if (!meData.user.profile?.onboardingCompleted) {
          router.push('/onboarding');
          return;
        }

        setProfile(meData.user.profile);
        setStreak(meData.user.streaks);

        const activitiesRes = await fetch('/api/activities');
        if (activitiesRes.ok) {
          const actData = await activitiesRes.json();
          setActivities(actData);
        }

        const goalsRes = await fetch('/api/goals');
        if (goalsRes.ok) {
          const goalData = await goalsRes.json();
          setGoals(goalData);
        }

        setLoading(false);
      } catch (err) {
        console.error('Fetch dashboard error:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSetGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingGoal(true);
    setError('');

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetReductionPct: Number(newGoalPct) })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update goal');

      setGoals(prev => [data, ...prev.map(g => ({ ...g, isActive: false }))]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSettingGoal(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center font-mono text-[var(--text-secondary)]">
        <div className="flex flex-col items-center gap-3">
          <Leaf className="w-10 h-10 text-[var(--color-green)] animate-spin" />
          <span>Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  const totalSaved = activities.reduce((sum, act) => sum + act.co2Saved, 0);
  const annualPace = Math.max(0, profile.baselineTotal - totalSaved);
  const annualPaceTonnes = annualPace / 1000;
  const monthlyPace = annualPace / 12;

  const activeGoal = goals.find(g => g.isActive);
  const targetSavings = activeGoal ? (profile.baselineTotal * (activeGoal.targetReductionPct / 100)) : 0;
  const goalProgress = targetSavings > 0 ? Math.min(100, Math.round((totalSaved / targetSavings) * 100)) : 0;

  const categories = [
    { name: 'Transport', value: profile.baselineTransport },
    { name: 'Home Energy', value: profile.baselineHome },
    { name: 'Diet/Food', value: profile.baselineFood },
    { name: 'Consumption', value: profile.baselineGoods }
  ];
  const highestCategory = categories.reduce((prev, current) => (prev.value > current.value) ? prev : current);

  const getRecommendations = (cat: string) => {
    switch (cat) {
      case 'Transport':
        return [
          { action: 'Shift to Public Transit', saving: '~1.8 kg CO₂e / 15km trip', effort: 'medium' },
          { action: 'Cycle/Walk short distances', saving: '~0.85 kg CO₂e / 5km trip', effort: 'easy' },
          { action: 'Replace flights with virtual options', saving: '~250 - 1100 kg CO₂e', effort: 'hard' }
        ];
      case 'Home Energy':
        return [
          { action: 'Lower your thermostat target by 1°C', saving: '~1.2 kg CO₂e / day', effort: 'easy' },
          { action: 'Air-dry clothes instead of heat drying', saving: '~1.8 kg CO₂e / load', effort: 'easy' },
          { action: 'Unplug idle standby electrical switches', saving: '~0.4 kg CO₂e / day', effort: 'easy' }
        ];
      case 'Diet/Food':
        return [
          { action: 'Swap a meat meal for plant-based foods', saving: '~1.5 kg CO₂e / meal', effort: 'easy' },
          { action: 'Commit to meat-free weekdays', saving: '~30 kg CO₂e / month', effort: 'medium' }
        ];
      case 'Consumption':
      default:
        return [
          { action: 'Use reusable coffee cups and shopping bags', saving: '~0.2 kg CO₂e / use', effort: 'easy' },
          { action: 'Shop second-hand items over new goods', saving: '~50% - 90% CO₂e reduction', effort: 'medium' }
        ];
    }
  };

  const recommendations = getRecommendations(highestCategory.name);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)]">
      <Navbar />

      <main className="flex-1 p-6 md:p-12 max-w-7xl w-full mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-mono font-bold uppercase text-[var(--text-primary)]">
              Dashboard
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Track and optimize your carbon footprint in real-time.
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/actions" className="btn-primary">
              <Plus className="w-4 h-4" /> Log an Action
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="custom-card bg-[var(--bg-surface-sec)] flex flex-col justify-between min-h-[140px]">
            <span className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">
              Annual Projected Pace
            </span>
            <div className="my-2">
              <span className="text-4xl font-mono font-bold text-[var(--text-primary)]">
                {annualPaceTonnes.toFixed(2)}
              </span>
              <span className="text-sm font-mono text-[var(--text-secondary)] ml-1">tonnes / yr</span>
            </div>
            <span className="text-xs text-[var(--text-secondary)]">
              Baseline: {(profile.baselineTotal / 1000).toFixed(2)} tonnes
            </span>
          </div>

          <div className="custom-card bg-[var(--bg-surface-sec)] flex flex-col justify-between min-h-[140px]">
            <span className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">
              This Month Pace
            </span>
            <div className="my-2">
              <span className="text-4xl font-mono font-bold text-[var(--text-primary)]">
                {Math.round(monthlyPace)}
              </span>
              <span className="text-sm font-mono text-[var(--text-secondary)] ml-1">kg CO₂e</span>
            </div>
            <span className="text-xs text-[var(--text-secondary)]">
              Adjusted for all-time savings
            </span>
          </div>

          <div className="custom-card bg-[var(--bg-surface-sec)] flex flex-col justify-between min-h-[140px]">
            <span className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">
              Total Carbon Offset
            </span>
            <div className="my-2">
              <span className="text-4xl font-mono font-bold text-[var(--color-green)]">
                {totalSaved.toFixed(1)}
              </span>
              <span className="text-sm font-mono text-[var(--color-green)] ml-1">kg saved</span>
            </div>
            <span className="text-xs text-[var(--text-secondary)]">
              Across {activities.length} completed actions
            </span>
          </div>
        </div>

        <div className="custom-card">
          <h2 className="text-lg font-mono font-bold uppercase text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-[var(--color-green)]" />
            Comparison Scale
          </h2>
          
          <div className="relative pt-6 pb-2">
            <div className="h-4 bg-[var(--bg-surface-sec)] rounded-full border border-[var(--border-color)] overflow-hidden relative">
              <div 
                className="h-full bg-[var(--color-green)] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (annualPaceTonnes / 10) * 100)}%` }}
              />
              
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 z-10" 
                style={{ left: '20%' }}
              />
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10" 
                style={{ left: '45%' }}
              />
            </div>

            <div className="flex justify-between text-[10px] font-mono text-[var(--text-secondary)] mt-2">
              <span>0.0t</span>
              <span className="text-yellow-500 font-bold">2.0t aligned target</span>
              <span className="text-blue-500 font-bold">4.5t global avg</span>
              <span>10.0t+</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-[var(--bg-surface-sec)] border border-[var(--border-color)] rounded-lg flex items-center gap-3 text-sm">
            {annualPaceTonnes > 4.5 ? (
              <>
                <AlertTriangle className="text-[var(--color-amber)] w-5 h-5 shrink-0" />
                <span className="text-[var(--text-secondary)]">
                  Your carbon footprint is **above** the global average. Limiting global warming to under 1.5°C requires adjusting habits towards the **2.0 tonnes** annual budget.
                </span>
              </>
            ) : (
              <>
                <Info className="text-[var(--color-green)] w-5 h-5 shrink-0" />
                <span className="text-[var(--text-secondary)]">
                  Great job! Your carbon footprint is **below** the global average of 4.5t. Continue logging actions to approach the **2.0 tonnes** sustainability target!
                </span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="custom-card flex flex-col justify-between">
            <h2 className="text-lg font-mono font-bold uppercase text-[var(--text-primary)] mb-4">
              Baseline Emissions Breakdown
            </h2>
            <EmissionsBreakdownChart data={{
              transport: profile.baselineTransport,
              home: profile.baselineHome,
              food: profile.baselineFood,
              goods: profile.baselineGoods
            }} />
          </div>

          <div className="custom-card flex flex-col justify-between">
            <h2 className="text-lg font-mono font-bold uppercase text-[var(--text-primary)] mb-4">
              Offset Savings Trend (Last 7 Days)
            </h2>
            <CarbonSavingsTrendChart activities={activities} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="custom-card flex flex-col justify-between space-y-6">
            <div>
              <h2 className="text-lg font-mono font-bold uppercase text-[var(--text-primary)] mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-[var(--color-green)]" />
                Reduction Target
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-6">
                Set a footprint reduction goal to keep you focused.
              </p>

              {activeGoal ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-mono">
                    <span className="font-semibold text-[var(--text-secondary)]">
                      {activeGoal.targetReductionPct}% Annual Reduction
                    </span>
                    <span className="text-[var(--color-green)] font-bold">{goalProgress}% Complete</span>
                  </div>

                  <div className="h-3 bg-[var(--bg-surface-sec)] rounded-full border border-[var(--border-color)] overflow-hidden">
                    <div 
                      className="h-full bg-[var(--color-green)] rounded-full transition-all duration-300"
                      style={{ width: `${goalProgress}%` }}
                    />
                  </div>

                  <div className="text-xs text-[var(--text-secondary)] font-mono space-y-1">
                    <div>Target annual footprint limit: <strong className="text-[var(--text-primary)]">{activeGoal.targetCo2.toFixed(0)} kg</strong></div>
                    <div>Target offset to save: <strong className="text-[var(--text-primary)]">{targetSavings.toFixed(0)} kg</strong></div>
                    <div>Current cumulative savings: <strong className="text-[var(--color-green)]">{totalSaved.toFixed(0)} kg</strong></div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[var(--bg-surface-sec)] border border-dashed border-[var(--border-color)] rounded-lg text-center text-sm text-[var(--text-secondary)]">
                  No active goals set. Start a new target below!
                </div>
              )}
            </div>

            <form onSubmit={handleSetGoal} className="border-t border-[var(--border-color)] pt-4">
              <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">Set Reduction Goal (%)</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={newGoalPct}
                  onChange={e => setNewGoalPct(e.target.value)}
                  className="flex-1 bg-[var(--bg-surface-sec)] border border-[var(--border-color)] rounded-lg p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-green)] font-mono text-sm"
                />
                <button
                  type="submit"
                  disabled={settingGoal}
                  className="btn-primary py-2.5 px-4 text-sm"
                >
                  {settingGoal ? 'Setting...' : 'Activate Goal'}
                </button>
              </div>
              {error && <span className="text-red-500 text-xs mt-2 block font-mono">{error}</span>}
            </form>
          </div>

          <div className="custom-card flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-mono font-bold uppercase text-[var(--text-primary)] mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Biggest Opportunity
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-6">
                Dynamically calculated based on your highest impact category: <strong className="text-[var(--text-primary)] font-mono">{highestCategory.name}</strong>.
              </p>

              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="bg-[var(--bg-surface-sec)] border border-[var(--border-color)] p-4 rounded-lg flex justify-between items-center gap-3">
                    <div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">{rec.action}</div>
                      <div className="text-xs text-[var(--color-green)] font-mono font-semibold mt-1">{rec.saving}</div>
                    </div>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[var(--border-color)] ${
                      rec.effort === 'easy' ? 'text-green-400 bg-green-400/10' :
                      rec.effort === 'medium' ? 'text-yellow-400 bg-yellow-400/10' :
                      'text-red-400 bg-red-400/10'
                    }`}>
                      {rec.effort}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/actions" className="text-xs font-semibold text-[var(--color-green)] hover:underline flex items-center gap-1 justify-end mt-4">
              Browse Action Library <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
