"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, Navigation, Home, Apple, ShoppingBag, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Form states
  const [carType, setCarType] = useState('none');
  const [carKmPerWeek, setCarKmPerWeek] = useState(0);
  const [publicTransitKmWeek, setPublicTransitKmWeek] = useState(0);
  const [shortFlightsPerYear, setShortFlightsPerYear] = useState(0);
  const [longFlightsPerYear, setLongFlightsPerYear] = useState(0);

  const [homeSize, setHomeSize] = useState(80);
  const [heatingSource, setHeatingSource] = useState('electricity');
  const [renewableTariff, setRenewableTariff] = useState(false);

  const [dietType, setDietType] = useState('mixed');

  const [shoppingFrequency, setShoppingFrequency] = useState('moderate');
  const [recyclingHabits, setRecyclingHabits] = useState('some');

  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then(data => {
        setCheckingAuth(false);
        if (data.user.profile?.onboardingCompleted) {
          router.push('/dashboard');
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-3">
          <Leaf className="w-10 h-10 text-[var(--color-green)] animate-spin" />
          <span>Verifying credentials...</span>
        </div>
      </div>
    );
  }

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit onboarding quiz');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-8 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--bg-surface-sec)]">
            <div 
              className="h-full bg-[var(--color-green)] transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
              Step {step} of 6
            </span>
            <span className="text-xs font-mono text-[var(--color-green)] font-bold">
              {Math.round((step / 6) * 100)}% Complete
            </span>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm font-mono">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Leaf className="w-16 h-16 text-[var(--color-green)] mx-auto mb-4" />
                <h1 className="text-3xl font-mono font-bold uppercase tracking-tight mb-2 text-[var(--text-primary)]">
                  Welcome to EcoTrack
                </h1>
                <p className="text-[var(--text-secondary)]">
                  Let's calculate your annual carbon footprint. This short 2-minute quiz captures your habits across transportation, energy, food, and consumption.
                </p>
              </div>

              <div className="bg-[var(--bg-surface-sec)] border border-[var(--border-color)] rounded-lg p-4 space-y-3 text-sm text-[var(--text-secondary)]">
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-green)] shrink-0" />
                  <span>Calculations based on US EPA & UK DEFRA scientific factors.</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-green)] shrink-0" />
                  <span>Compare your results to world averages and the 2°C target.</span>
                </div>
              </div>

              <button onClick={handleNext} className="btn-primary w-full justify-center py-3">
                Start Calculator <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-3">
                <Navigation className="text-blue-500 w-6 h-6" />
                <h2 className="text-xl font-mono font-bold uppercase text-[var(--text-primary)]">Transportation</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">Car Engine / Fuel Type</label>
                  <select 
                    value={carType} 
                    onChange={e => setCarType(e.target.value)}
                    className="w-full bg-[var(--bg-surface-sec)] border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-green)]"
                  >
                    <option value="none">No Car (Walk/Bike/Transit Only)</option>
                    <option value="petrol">Petrol / Gasoline Car</option>
                    <option value="diesel">Diesel Car</option>
                    <option value="hybrid">Hybrid Car</option>
                    <option value="ev">Electric Vehicle (EV)</option>
                  </select>
                </div>

                {carType !== 'none' && (
                  <div>
                    <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">Weekly Driving Distance (km)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={carKmPerWeek}
                      onChange={e => setCarKmPerWeek(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-[var(--bg-surface-sec)] border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-green)]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">Weekly Public Transit (Bus/Train) (km)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={publicTransitKmWeek}
                    onChange={e => setPublicTransitKmWeek(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[var(--bg-surface-sec)] border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-green)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">Short Flights / Year (&lt;3 hours)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={shortFlightsPerYear}
                      onChange={e => setShortFlightsPerYear(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-[var(--bg-surface-sec)] border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-green)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">Long Flights / Year (&gt;3 hours)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={longFlightsPerYear}
                      onChange={e => setLongFlightsPerYear(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-[var(--bg-surface-sec)] border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-green)]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-4 mt-6">
                <button onClick={handlePrev} className="btn-secondary flex-1 justify-center"><ArrowLeft className="w-4 h-4" /> Back</button>
                <button onClick={handleNext} className="btn-primary flex-1 justify-center">Next <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-3">
                <Home className="text-purple-500 w-6 h-6" />
                <h2 className="text-xl font-mono font-bold uppercase text-[var(--text-primary)]">Home Energy</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">Home Size (m²)</label>
                  <input 
                    type="number" 
                    min="10"
                    value={homeSize}
                    onChange={e => setHomeSize(Math.max(10, Number(e.target.value)))}
                    className="w-full bg-[var(--bg-surface-sec)] border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-green)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">Primary Heating Source</label>
                  <select 
                    value={heatingSource} 
                    onChange={e => setHeatingSource(e.target.value)}
                    className="w-full bg-[var(--bg-surface-sec)] border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-green)]"
                  >
                    <option value="electricity">Electric Heater / Heat Pump</option>
                    <option value="gas">Natural Gas Furnace</option>
                    <option value="oil">Oil / Petroleum Heating</option>
                    <option value="renewable">Solar Thermal / Biomass / District Heating</option>
                  </select>
                </div>

                <div className="flex items-center justify-between bg-[var(--bg-surface-sec)] border border-[var(--border-color)] rounded-lg p-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">Renewable Electricity Tariff</label>
                    <span className="text-xs text-[var(--text-secondary)]">I buy 100% certified solar, wind, or hydro electricity.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={renewableTariff}
                    onChange={e => setRenewableTariff(e.target.checked)}
                    className="w-6 h-6 rounded border-[var(--border-color)] text-[var(--color-green)] focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-between gap-4 mt-6">
                <button onClick={handlePrev} className="btn-secondary flex-1 justify-center"><ArrowLeft className="w-4 h-4" /> Back</button>
                <button onClick={handleNext} className="btn-primary flex-1 justify-center">Next <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-3">
                <Apple className="text-green-500 w-6 h-6" />
                <h2 className="text-xl font-mono font-bold uppercase text-[var(--text-primary)]">Dietary Habits</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">Diet Type</label>
                  <select 
                    value={dietType} 
                    onChange={e => setDietType(e.target.value)}
                    className="w-full bg-[var(--bg-surface-sec)] border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-green)]"
                  >
                    <option value="highMeat">High Meat (Eat red meat daily)</option>
                    <option value="mixed">Mixed (Average meat, poultry, fish)</option>
                    <option value="lowMeat">Low Meat (Eat meat occasionally, prefer poultry/fish)</option>
                    <option value="vegetarian">Vegetarian (No meat/fish, eat dairy/eggs)</option>
                    <option value="vegan">Vegan (100% plant-based diet)</option>
                  </select>
                </div>
                
                <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
                  Diet is one of the most substantial daily choices. Shifting from high meat to vegetarian or vegan cuts dietary footprint by over 50%, saving up to 1.5 tonnes of CO₂e annually.
                </p>
              </div>

              <div className="flex justify-between gap-4 mt-6">
                <button onClick={handlePrev} className="btn-secondary flex-1 justify-center"><ArrowLeft className="w-4 h-4" /> Back</button>
                <button onClick={handleNext} className="btn-primary flex-1 justify-center">Next <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-3">
                <ShoppingBag className="text-pink-500 w-6 h-6" />
                <h2 className="text-xl font-mono font-bold uppercase text-[var(--text-primary)]">Consumption & Goods</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">Shopping Frequency (New clothes, electronics, household items)</label>
                  <select 
                    value={shoppingFrequency} 
                    onChange={e => setShoppingFrequency(e.target.value)}
                    className="w-full bg-[var(--bg-surface-sec)] border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-green)]"
                  >
                    <option value="low">Minimalist (Buy second-hand, only buy necessities)</option>
                    <option value="moderate">Moderate (Buy new goods occasionally, average waste)</option>
                    <option value="high">High (Frequent new purchases, tech upgrades, high waste)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">Waste & Recycling Habits</label>
                  <select 
                    value={recyclingHabits} 
                    onChange={e => setRecyclingHabits(e.target.value)}
                    className="w-full bg-[var(--bg-surface-sec)] border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-green)]"
                  >
                    <option value="none">Throw everything in trash (No recycling)</option>
                    <option value="some">Recycle cardboard/plastic/glass occasionally</option>
                    <option value="all">Comprehensive recycling & composting (Zero food waste)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between gap-4 mt-6">
                <button onClick={handlePrev} className="btn-secondary flex-1 justify-center"><ArrowLeft className="w-4 h-4" /> Back</button>
                <button onClick={handleNext} className="btn-primary flex-1 justify-center">Next <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6 text-center text-[var(--text-primary)]">
              <CheckCircle2 className="w-16 h-16 text-[var(--color-green)] mx-auto mb-2 animate-bounce" />
              <h2 className="text-2xl font-mono font-bold uppercase">Ready to Calculate!</h2>
              <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                We've gathered all your information. Click below to view your personalized carbon footprint analysis and start tracking.
              </p>

              <div className="flex justify-between gap-4 mt-6">
                <button 
                  onClick={handlePrev} 
                  className="btn-secondary flex-1 justify-center"
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button 
                  onClick={handleSubmit} 
                  className="btn-primary flex-1 justify-center py-3"
                  disabled={loading}
                >
                  {loading ? 'Calculating...' : 'Calculate Footprint'}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
