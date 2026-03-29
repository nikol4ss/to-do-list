import { ConfirmDialog } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Perfil", icon: User },
];

interface SidebarProps {
  onClose?: () => void;
}

function SidebarContent({ onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav
      className="flex flex-col h-full py-5 px-4"
      aria-label="Navegação principal"
    >
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-2.5">
          <span className="text-sidebar-foreground font-semibold text-base">
            To-Do List Advice
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground p-1 lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <ul className="flex flex-col gap-1 flex-1" role="list">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 relative",
                isActive
                  ? "text-[var(--color-foreground-light)] font-semibold before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[var(--color-secondary)]"
                  : "text-[var(--color-foreground-light)] hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground",
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </ul>

      <div className="flex flex-col gap-2 border-t pt-4 border-[var(--color-divider)]">
        <button
          onClick={toggle}
          className="flex items-center gap-3 px-2.5 py-2.5 rounded-md text-sm font-medium text-[var(--color-foreground-light)] hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground transition-all w-full text-left"
          aria-label={`Mudar para modo ${theme === "light" ? "escuro" : "claro"}`}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          {theme === "light" ? "Modo escuro" : "Modo claro"}
        </button>

        {user && (
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 px-1.5 py-2.5 rounded-md hover:bg-sidebar-foreground/10 transition-all group"
          >
            <div
              className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0",
                theme === "light"
                  ? "bg-[var(--color-foreground-light)]"
                  : "bg-[#ee7810]",
              )}
            >
              <span
                className={cn(
                  "text-xs font-bold",
                  theme === "light"
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-foreground-light)]",
                )}
              >
                {user.first_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[var(--color-foreground-light)] text-sm font-medium truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-[var(--color-foreground-light)] text-xs truncate text-opacity-70">
                {user.email}
              </p>
            </div>
          </NavLink>
        )}

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex text-[var(--color-foreground-light)] items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/60 hover:text-red-500 transition-all"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Sair da conta"
        description="Tem certeza que deseja sair?"
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 bg-sidebar border-r border-sidebar-border flex-shrink-0 h-svh sticky top-0 animate-slide-in-left">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-sidebar text-sidebar-foreground shadow-md"
        aria-label="Abrir menu"
        aria-expanded={open}
      >
        <Menu size={20} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu lateral"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-64 bg-sidebar h-full shadow-xl animate-slide-in-left z-50">
            <SidebarContent onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarLayout() {
  return (
    <>
      <Sidebar />
      <MobileSidebar />
    </>
  );
}

export default SidebarLayout;
