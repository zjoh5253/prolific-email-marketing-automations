import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Pipeline', icon: '◈' },
  { to: '/organizations', label: 'Organizations', icon: '◻' },
  { to: '/people', label: 'People', icon: '◉' },
  { to: '/closed-deals', label: 'Closed Deals', icon: '◆' },
];

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-56 flex-shrink-0 bg-[#1a1a2e] text-white flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <h1 className="text-lg font-bold tracking-tight">CRM Pipeline</h1>
        </div>
        <nav className="flex-1 py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-indigo-600/30 text-white border-r-2 border-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
