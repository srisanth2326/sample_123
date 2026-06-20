"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Flame, Leaf, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

interface User {
  email: string;
  streaks?: {
    currentStreak: number;
  };
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(data => setUser(data.user))
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Actions & History', href: '/actions' },
  ];

  return (
    <header className="border-b border-[var(--border-color)] bg-[var(--bg-surface)] py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
      <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
        <Leaf className="text-[var(--color-green)] w-8 h-8" />
        <span className="font-mono text-2xl font-bold uppercase tracking-tight">
          Eco<span className="text-[var(--color-green)]">Track</span>
        </span>
      </Link>

      {user ? (
        <>
          <nav className="hidden md:flex gap-8 font-mono text-sm uppercase font-semibold">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hover:text-[var(--text-primary)] transition-all ${
                    isActive ? 'text-[var(--color-green)] border-b-2 border-[var(--color-green)] pb-1' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 md:gap-6">
            {user.streaks && user.streaks.currentStreak > 0 && (
              <div className="flex items-center gap-1 bg-[var(--bg-surface-sec)] px-3 py-1 rounded-full border border-[var(--border-color)] text-orange-400" title="Logging Streak">
                <Flame className="w-4 h-4 fill-orange-400" />
                <span className="font-mono text-xs font-bold">{user.streaks.currentStreak} Day Streak</span>
              </div>
            )}

            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs text-[var(--text-secondary)] font-mono">Logged in as</span>
              <span className="text-sm font-semibold truncate max-w-[150px]">{user.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="btn-secondary py-1.5 px-3 text-xs md:text-sm"
              aria-label="Log Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </>
      ) : (
        <div className="flex gap-4">
          <Link href="/login" className="btn-secondary py-1.5 px-3 text-xs md:text-sm">
            Login
          </Link>
          <Link href="/signup" className="btn-primary py-1.5 px-3 text-xs md:text-sm">
            Sign Up
          </Link>
        </div>
      )}
    </header>
  );
}
