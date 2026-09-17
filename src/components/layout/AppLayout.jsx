import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Inbox, Users, UsersRound, Settings, LogOut, Slash } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const links = [
  { to: "/inbox", label: "Inbox", icon: Inbox, testid: "nav-inbox-link" },
  { to: "/contacts", label: "Contacts", icon: Users, testid: "nav-contacts-link" },
  { to: "/team", label: "Team", icon: UsersRound, testid: "nav-team-link" },
  { to: "/settings", label: "Settings", icon: Settings, testid: "nav-settings-link" },
];

export default function AppLayout() {
  const { user, tenant, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="h-screen flex overflow-hidden bg-[#0B0F12] text-slate-100">
      <aside className="w-16 md:w-60 flex-shrink-0 bg-[#0E1317] border-r border-[#1E2A32] flex flex-col">
        <div className="flex items-center gap-2.5 px-4 h-16 border-b border-[#1E2A32]">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
            <Slash className="h-4.5 w-4.5 h-5 w-5 text-emerald-400" />
          </div>
          <div className="hidden md:block min-w-0">
            <p className="font-extrabold tracking-tight text-slate-100 leading-none">Slash</p>
            <p className="text-[11px] text-emerald-400/90 font-medium truncate mt-1" data-testid="tenant-name-badge">
              {tenant?.company_name}
            </p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {links.map(({ to, label, icon: Icon, testid }) => (
            <NavLink
              key={to}
              to={to}
              data-testid={testid}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#131A1F]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-emerald-500" />}
                  <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                  <span className="hidden md:inline">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-[#1E2A32]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 text-xs font-bold flex-shrink-0">
              {user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 capitalize">{user?.role}</p>
            </div>
            <button
              data-testid="logout-button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
