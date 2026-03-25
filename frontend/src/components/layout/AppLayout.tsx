import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  LogOut,
  Moon,
  Sun,
  UserCircle,
  UsersRound,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';

export const AppLayout = () => {
  const { user, logout } = useAuthStore();
  const isAdmin = user?.roles?.some((role) => role === 'admin' || role === 'ADMIN');
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-text flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-sidebar-hover">
          <Link to="/projects" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold font-display">Siren</span>
          </Link>
          <p className="text-xs text-text-muted mt-1">QA Engineering Platform</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/projects"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-hover transition-colors text-sm"
          >
            <FolderKanban className="w-4 h-4" />
            Projects
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-hover transition-colors text-sm"
          >
            <UserCircle className="w-4 h-4" />
            My Profile
          </Link>
          {isAdmin && (
            <Link
              to="/admin/users"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-hover transition-colors text-sm"
            >
              <UsersRound className="w-4 h-4" />
              Users
            </Link>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-hover space-y-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-hover transition-colors text-sm w-full"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                  {user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
              <div className="text-xs truncate">
                <p className="font-medium">{user?.fullName}</p>
                <p className="text-text-muted">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-sidebar-hover transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6 bg-bg">
        <Outlet />
      </main>
    </div>
  );
};
