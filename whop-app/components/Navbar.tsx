'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/pulse/dashboard', label: 'Dashboard' },
    { href: '/pulse/feed', label: 'Feed' },
    { href: '/pulse/analytics', label: 'Analytics' },
    { href: '/pulse/settings', label: 'Settings' },
  ];

  return (
    <nav className="bg-[#0A0A0A] border-b border-white/[0.08] sticky top-0 z-50 backdrop-blur-xl bg-opacity-80">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <Link href="/pulse/dashboard" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            {/* Waveform Logo */}
            <div className="flex items-center gap-1">
              <div className="w-1 h-[11px] bg-white rounded-full"></div>
              <div className="w-1 h-[18px] bg-white rounded-full"></div>
              <div className="w-1 h-[29px] bg-white rounded-full"></div>
              <div className="w-1 h-[22px] bg-white rounded-full"></div>
              <div className="w-1 h-[14px] bg-white rounded-full"></div>
            </div>
            <span className="text-2xl font-bold text-white">
              Pulse
            </span>
          </Link>
          
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-5 py-2.5 rounded-xl text-base font-medium transition-all cursor-pointer ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-white hover:bg-white/[0.05]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
