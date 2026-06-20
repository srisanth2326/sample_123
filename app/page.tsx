"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Award, Shield, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (res.ok) router.push('/dashboard');
      })
      .catch(() => {});
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col justify-between">
      
      <header className="border-b border-[var(--border-color)] bg-[var(--bg-surface)] py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Leaf className="text-[var(--color-green)] w-8 h-8" />
          <span className="font-mono text-2xl font-bold uppercase tracking-tight">
            Eco<span className="text-[var(--color-green)]">Track</span>
          </span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="btn-secondary py-1.5 px-3.5 text-xs md:text-sm">
            Sign In
          </Link>
          <Link href="/signup" className="btn-primary py-1.5 px-3.5 text-xs md:text-sm font-semibold">
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto space-y-8 my-12">
        <div className="inline-flex items-center gap-2 bg-[var(--bg-surface-sec)] border border-[var(--border-color)] px-4 py-1.5 rounded-full text-xs font-mono text-[var(--color-green)] font-bold">
          <Leaf className="w-3.5 h-3.5 animate-pulse" />
          Carbon Footprint Tracking Reimagined
        </div>

        <h1 className="text-4xl md:text-6xl font-mono font-bold uppercase tracking-tight leading-tight">
          Understand, Reduce, and <br />
          <span className="text-[var(--color-green)]">Offset Your Footprint</span>
        </h1>

        <p className="text-[var(--text-secondary)] text-lg max-w-2xl">
          EcoTrack provides a transparent, scientifically-backed calculator to calculate your greenhouse emissions, log sustainable daily choices, and target personalized progress milestones.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xs sm:max-w-none pt-4">
          <Link href="/signup" className="btn-primary justify-center py-3.5 px-8 text-md font-bold">
            Create Free Account
          </Link>
          <Link href="/login" className="btn-secondary justify-center py-3.5 px-8 text-md font-bold">
            Sign In to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="custom-card bg-[var(--bg-surface-sec)]">
            <BarChart3 className="text-[var(--color-green)] w-8 h-8 mb-3" />
            <h3 className="font-mono font-bold uppercase text-sm mb-2 text-[var(--text-primary)]">Scientific Accuracy</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              We leverage official US EPA & UK DEFRA greenhouse gas reporting indices for precise, transparent math.
            </p>
          </div>

          <div className="custom-card bg-[var(--bg-surface-sec)]">
            <Award className="text-purple-500 w-8 h-8 mb-3" />
            <h3 className="font-mono font-bold uppercase text-sm mb-2 text-[var(--text-primary)]">Logging Streaks</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Form sustainable habits through streaks and milestones, building a real-time ledger of your daily carbon offsets.
            </p>
          </div>

          <div className="custom-card bg-[var(--bg-surface-sec)]">
            <Shield className="text-blue-500 w-8 h-8 mb-3" />
            <h3 className="font-mono font-bold uppercase text-sm mb-2 text-[var(--text-primary)]">Full Persistence</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Your profile, baseline values, goals, and logged history are securely persisted in a real database.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-surface)] py-6 text-center text-xs text-[var(--text-secondary)] font-mono">
        EcoTrack • Powered by Scientific Carbon Calculation Engine
      </footer>
    </div>
  );
}
