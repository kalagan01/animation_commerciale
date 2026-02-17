import type { JSX } from 'hono/jsx';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  active?: boolean;
}

interface SidebarProps {
  items: NavItem[];
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
  collapsed?: boolean;
  className?: string;
}

export const Sidebar = ({
  items,
  user,
  collapsed = false,
  className = ''
}: SidebarProps): JSX.Element => {
  
  const sidebarClasses = `
    sidebar fixed left-0 top-0 h-screen
    bg-gray-900 text-white
    transition-all duration-300 ease-in-out
    z-40 flex flex-col
    ${collapsed ? 'w-16' : 'w-64'}
    ${className}
  `;
  
  return (
    <aside class={sidebarClasses} id="sidebar">
      {/* Logo */}
      <div class="sidebar-header p-4 border-b border-gray-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="fas fa-rocket text-white text-xl"></i>
          </div>
          {!collapsed && (
            <div class="flex-1 min-w-0">
              <h2 class="text-lg font-bold text-white truncate">NeoImpact</h2>
              <p class="text-xs text-gray-400 truncate">Animation</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav class="sidebar-nav flex-1 overflow-y-auto p-2">
        <ul class="space-y-1">
          {items.map((item) => {
            const isActive = item.active || false;
            const itemClasses = `
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              transition-colors duration-200
              ${isActive 
                ? 'bg-primary text-white' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }
            `;
            
            return (
              <li>
                <a href={item.href} class={itemClasses}>
                  {item.icon && (
                    <i class={`${item.icon} text-lg w-5 flex-shrink-0`}></i>
                  )}
                  {!collapsed && (
                    <>
                      <span class="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span class="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* User Profile */}
      {user && (
        <div class="sidebar-footer p-3 border-t border-gray-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} class="w-full h-full rounded-full object-cover" />
              ) : (
                <i class="fas fa-user text-gray-400"></i>
              )}
            </div>
            {!collapsed && (
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">{user.name}</p>
                <p class="text-xs text-gray-400 truncate">{user.role}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Toggle Button */}
      <button
        onclick="toggleSidebar()"
        class="absolute -right-3 top-20 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors"
        aria-label="Toggle sidebar"
      >
        <i class={`fas ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-white text-xs`}></i>
      </button>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('main-content');
            if (sidebar && mainContent) {
              sidebar.classList.toggle('w-16');
              sidebar.classList.toggle('w-64');
              mainContent.classList.toggle('ml-16');
              mainContent.classList.toggle('ml-64');
            }
          }
        `
      }}></script>
    </aside>
  );
};
