"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, Trash2, Edit2, X, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { ACTION_LIBRARY, ActionLibraryItem } from '@/lib/carbon';

interface Activity {
  id: string;
  actionId: string;
  category: string;
  title: string;
  description: string;
  co2Saved: number;
  timestamp: string;
}

export default function ActionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  
  const [editCo2Saved, setEditCo2Saved] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  const [loggingActionId, setLoggingActionId] = useState<string | null>(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) {
          router.push('/login');
          return;
        }
        return fetch('/api/activities');
      })
      .then(res => res?.json())
      .then(data => {
        if (data) setActivities(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [router]);

  const handleLogAction = async (action: ActionLibraryItem) => {
    setLoggingActionId(action.id);
    setError('');
    
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId: action.id })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to log action');

      setActivities(prev => [data, ...prev]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoggingActionId(null);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity log?')) return;
    setError('');

    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete activity');
      }

      setActivities(prev => prev.filter(act => act.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStartEdit = (act: Activity) => {
    setEditingActivity(act);
    setEditCo2Saved(act.co2Saved.toString());
    setEditDescription(act.description);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;
    setSubmittingEdit(true);
    setError('');

    try {
      const res = await fetch(`/api/activities/${editingActivity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          co2Saved: Number(editCo2Saved),
          description: editDescription
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update activity');

      setActivities(prev => prev.map(act => act.id === data.id ? data : act));
      setEditingActivity(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const categories = ['All', 'Transport', 'Home', 'Food', 'Goods'];

  const filteredLibrary = filterCategory === 'All'
    ? ACTION_LIBRARY
    : ACTION_LIBRARY.filter(act => act.category === filterCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center font-mono text-[var(--text-secondary)]">
        <div className="flex flex-col items-center gap-3">
          <Leaf className="w-10 h-10 text-[var(--color-green)] animate-spin" />
          <span>Loading Actions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)]">
      <Navbar />

      <main className="flex-1 p-6 md:p-12 max-w-7xl w-full mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-mono font-bold uppercase text-[var(--text-primary)]">
            Actions & History
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Check off daily eco-friendly actions or edit your running logs.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-2 text-sm font-mono">
            <AlertCircle className="w-5 h-5 animate-pulse" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-[var(--border-color)]">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[var(--color-green)] border-[var(--color-green)] text-white'
                  : 'bg-[var(--bg-surface-sec)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-mono font-bold uppercase text-[var(--text-primary)]">
              Action Library
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLibrary.map(item => {
                const isLogging = loggingActionId === item.id;
                return (
                  <div key={item.id} className="custom-card flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-mono uppercase bg-[var(--bg-surface-sec)] px-2 py-0.5 rounded border border-[var(--border-color)] text-[var(--text-secondary)]">
                          {item.category}
                        </span>
                        <span className="text-xs font-mono text-[var(--color-green)] font-bold">
                          +{item.co2SavedPerOccurrence} kg Saved
                        </span>
                      </div>
                      <h3 className="text-md font-bold text-[var(--text-primary)] mt-2">{item.title}</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{item.description}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-[var(--border-color)]">
                      <div className="flex gap-1.5 text-[9px] font-mono uppercase">
                        <span className={`px-1.5 py-0.5 rounded ${
                          item.effort === 'easy' ? 'text-green-400 bg-green-400/10' :
                          item.effort === 'medium' ? 'text-yellow-400 bg-yellow-400/10' :
                          'text-red-400 bg-red-400/10'
                        }`}>
                          {item.effort}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded ${
                          item.cost === 'saves money' ? 'text-green-400 bg-green-400/10' :
                          item.cost === 'neutral' ? 'text-blue-400 bg-blue-400/10' :
                          'text-yellow-400 bg-yellow-400/10'
                        }`}>
                          {item.cost}
                        </span>
                      </div>

                      <button
                        onClick={() => handleLogAction(item)}
                        disabled={isLogging}
                        className="btn-primary py-1 px-3 text-xs"
                      >
                        {isLogging ? 'Logging...' : 'Log Choice'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-mono font-bold uppercase text-[var(--text-primary)]">
              Activity History
            </h2>

            {activities.length === 0 ? (
              <div className="p-8 bg-[var(--bg-surface)] border border-dashed border-[var(--border-color)] rounded-xl text-center text-sm text-[var(--text-secondary)]">
                No actions logged yet. Log an option from the Action Library to get started!
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {activities.map(act => (
                  <div key={act.id} className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-4 rounded-xl flex justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                          {new Date(act.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-xs font-mono font-bold text-[var(--color-green)]">
                          -{act.co2Saved} kg
                        </span>
                      </div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">{act.title}</div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{act.description}</p>
                    </div>

                    <div className="flex flex-col gap-2 justify-center border-l border-[var(--border-color)] pl-3">
                      <button
                        onClick={() => handleStartEdit(act)}
                        className="text-[var(--text-secondary)] hover:text-white p-1 rounded"
                        title="Edit Activity"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(act.id)}
                        className="text-red-500 hover:text-red-400 p-1 rounded"
                        title="Delete Activity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>

      {editingActivity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setEditingActivity(null)}
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-mono font-bold uppercase mb-4 text-[var(--text-primary)]">
              Edit Activity Log
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">CO₂ Offset (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editCo2Saved}
                  onChange={e => setEditCo2Saved(e.target.value)}
                  className="w-full bg-[var(--bg-surface-sec)] border border-[var(--border-color)] rounded-lg p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-green)] font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">Notes / Description</label>
                <textarea
                  required
                  rows={3}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full bg-[var(--bg-surface-sec)] border border-[var(--border-color)] rounded-lg p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-green)] text-sm"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="btn-secondary flex-1 justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="btn-primary flex-1 justify-center"
                >
                  {submittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
