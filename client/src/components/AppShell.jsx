import {
  CalendarDotsIcon,
  ChartBarIcon,
  HouseIcon,
  SoccerBallIcon,
  TrophyIcon,
  UserListIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", icon: HouseIcon, end: true },
  { to: "/live", label: "Live", icon: SoccerBallIcon },
  { to: "/fixtures", label: "Fixtures", icon: CalendarDotsIcon },
  { to: "/standings", label: "Standings", icon: ChartBarIcon },
  { to: "/bracket", label: "Bracket", icon: TrophyIcon },
  { to: "/teams", label: "Teams", icon: UsersThreeIcon },
  { to: "/players", label: "Players", icon: UserListIcon },
];

export function AppShell() {
  return (
    <div className="min-h-[100dvh] bg-stone-950 text-stone-100">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-full bg-lime-300 px-4 py-2 font-bold text-stone-950 transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <header className="border-b border-white/10 bg-stone-950/95">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <NavLink to="/" className="group flex items-center gap-3" aria-label="CupPulse home">
            <span className="grid size-10 place-items-center rounded-full bg-lime-300 text-stone-950 transition-transform group-active:scale-[0.96]">
              <span className="size-3 rounded-full bg-stone-950" />
            </span>
            <span>
              <strong className="block text-lg tracking-[-0.04em]">CupPulse</strong>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                World Cup 2026
              </span>
            </span>
          </NavLink>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-white text-stone-950"
                      : "text-stone-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <span className="hidden rounded-full border border-lime-300/30 bg-lime-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-lime-300 sm:inline-flex">
            Public beta
          </span>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-8 sm:px-6 md:pb-12 lg:px-10 lg:pt-12"
      >
        <Outlet />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-stone-950/95 px-2 py-2 backdrop-blur md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto grid max-w-lg grid-cols-7">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold ${
                  isActive ? "bg-white/10 text-lime-300" : "text-stone-500"
                }`
              }
            >
              <Icon size={19} weight="bold" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
