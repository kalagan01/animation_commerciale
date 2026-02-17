import type { JSX } from 'hono/jsx';

interface HeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
  showNotifications?: boolean;
  notificationCount?: number;
  className?: string;
}

export const Header = ({
  title,
  breadcrumbs,
  user,
  showNotifications = true,
  notificationCount = 0,
  className = ''
}: HeaderProps): JSX.Element => {
  
  const headerClasses = `
    header sticky top-0 z-30
    bg-white border-b border-gray-200
    px-6 py-4
    ${className}
  `;
  
  return (
    <header class={headerClasses}>
      <div class="flex items-center justify-between">
        {/* Left: Title & Breadcrumbs */}
        <div class="flex-1">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav class="flex items-center gap-2 text-sm text-gray-600 mb-1">
              {breadcrumbs.map((crumb, index) => (
                <>
                  {crumb.href ? (
                    <a 
                      href={crumb.href} 
                      class="hover:text-primary transition-colors"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span class="text-gray-900 font-medium">{crumb.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                  )}
                </>
              ))}
            </nav>
          )}
          {title && (
            <h1 class="text-2xl font-bold text-gray-900">{title}</h1>
          )}
        </div>
        
        {/* Right: Actions */}
        <div class="flex items-center gap-4">
          {/* Notifications */}
          {showNotifications && (
            <button 
              class="relative p-2 text-gray-600 hover:text-primary transition-colors rounded-lg hover:bg-gray-100"
              onclick="alert('Notifications à implémenter')"
              aria-label="Notifications"
            >
              <i class="fas fa-bell text-xl"></i>
              {notificationCount > 0 && (
                <span class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          )}
          
          {/* User Menu */}
          {user && (
            <div class="relative" id="user-menu-container">
              <button 
                onclick="toggleUserMenu()"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} class="w-full h-full rounded-full object-cover" />
                  ) : (
                    <i class="fas fa-user text-gray-600"></i>
                  )}
                </div>
                <div class="text-left hidden sm:block">
                  <p class="text-sm font-medium text-gray-900">{user.name}</p>
                  <p class="text-xs text-gray-500">{user.role}</p>
                </div>
                <i class="fas fa-chevron-down text-xs text-gray-600"></i>
              </button>
              
              {/* Dropdown Menu */}
              <div 
                id="user-menu"
                class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              >
                <a href="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <i class="fas fa-user mr-2"></i> Mon Profil
                </a>
                <a href="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <i class="fas fa-cog mr-2"></i> Paramètres
                </a>
                <hr class="my-1" />
                <a href="/logout" class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <i class="fas fa-sign-out-alt mr-2"></i> Déconnexion
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          function toggleUserMenu() {
            const menu = document.getElementById('user-menu');
            if (menu) {
              menu.classList.toggle('hidden');
            }
          }
          
          // Close menu when clicking outside
          document.addEventListener('click', (e) => {
            const container = document.getElementById('user-menu-container');
            const menu = document.getElementById('user-menu');
            if (container && menu && !container.contains(e.target)) {
              menu.classList.add('hidden');
            }
          });
        `
      }}></script>
    </header>
  );
};
