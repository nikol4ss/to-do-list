import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  HomeIcon, 
  TagIcon, 
  UserIcon, 
  LogoutIcon, 
  SunIcon, 
  MoonIcon,
  ClipboardIcon,
  MenuIcon,
  XIcon
} from '../ui/Icons';
import styles from './Sidebar.module.css';

export function Sidebar({ currentPage, onNavigate, isOpen, onToggle }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'categories', label: 'Categorias', icon: TagIcon },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className={styles.overlay} 
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
      
      {/* Mobile toggle button */}
      <button
        className={styles.mobileToggle}
        onClick={onToggle}
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {isOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <ClipboardIcon size={28} />
            <span className={styles.logoText}>To-Do List</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${currentPage === item.id ? styles.active : ''}`}
                onClick={() => {
                  onNavigate(item.id);
                  if (window.innerWidth < 768) onToggle();
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
          >
            {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
            <span>{theme === 'light' ? 'Modo escuro' : 'Modo claro'}</span>
          </button>

          <div className={styles.divider} />

          <button
            className={`${styles.navItem} ${currentPage === 'profile' ? styles.active : ''}`}
            onClick={() => {
              onNavigate('profile');
              if (window.innerWidth < 768) onToggle();
            }}
          >
            <div className={styles.avatar}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name || 'Usuario'}</span>
              <span className={styles.userEmail}>{user?.email || 'email@exemplo.com'}</span>
            </div>
          </button>

          <button
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            <LogoutIcon size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
