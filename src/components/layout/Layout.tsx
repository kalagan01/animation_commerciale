import type { JSX } from 'hono/jsx';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../ui/Toast';

interface LayoutProps {
  children: any;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  activeNav?: string;
  showSidebar?: boolean;
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
  className?: string;
}

export const Layout = ({
  children,
  title,
  breadcrumbs,
  activeNav = 'dashboard',
  showSidebar = true,
  user,
  className = ''
}: LayoutProps): JSX.Element => {
  
  // Navigation items for sidebar
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: 'fas fa-home', active: activeNav === 'dashboard' },
    { label: 'Work Queue', href: '/work-queue', icon: 'fas fa-tasks', badge: 5, active: activeNav === 'work-queue' },
    { label: 'Visites', href: '/visits', icon: 'fas fa-calendar-check', active: activeNav === 'visits' },
    { label: 'Stores', href: '/stores', icon: 'fas fa-store', active: activeNav === 'stores' },
    { label: 'Marques', href: '/brands', icon: 'fas fa-tag', active: activeNav === 'brands' },
    { label: 'Enseignes', href: '/banners', icon: 'fas fa-flag', active: activeNav === 'banners' },
    { label: 'Incidents', href: '/incidents', icon: 'fas fa-exclamation-triangle', badge: 3, active: activeNav === 'incidents' },
    { label: 'Équipes', href: '/teams', icon: 'fas fa-users', active: activeNav === 'teams' },
    { label: 'Reporting', href: '/reporting', icon: 'fas fa-chart-line', active: activeNav === 'reporting' },
  ];
  
  // Default user if not provided
  const defaultUser = user || {
    name: 'Utilisateur',
    role: 'Agent',
    avatar: undefined
  };
  
  return (
    <div class="min-h-screen bg-gray-50">
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar 
          items={navItems}
          user={defaultUser}
        />
      )}
      
      {/* Main Content */}
      <main 
        id="main-content"
        class={`transition-all duration-300 ${showSidebar ? 'ml-64' : 'ml-0'}`}
      >
        {/* Header */}
        <Header 
          title={title}
          breadcrumbs={breadcrumbs}
          user={defaultUser}
          notificationCount={8}
        />
        
        {/* Page Content */}
        <div class={`p-6 ${className}`}>
          {children}
        </div>
      </main>
      
      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};
