'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: '/deep', label: 'Deep Research', icon: '🔬' },
  { href: '/context', label: 'Context Research', icon: '🧠' },
  { href: '/content', label: 'Content Generation', icon: '✍️' },
  { href: '/publishing', label: 'Publishing', icon: '🚀' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 text-slate-100">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-wide text-slate-400">Research Suite</p>
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
