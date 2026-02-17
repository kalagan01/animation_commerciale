import type { JSX } from 'hono/jsx';

export const ToastContainer = (): JSX.Element => {
  return (
    <>
      <div 
        id="toast-container" 
        class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      ></div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          function showToast(message, type = 'info', duration = 5000) {
            const container = document.getElementById('toast-container');
            if (!container) return;
            
            const icons = {
              success: 'fa-check-circle',
              error: 'fa-exclamation-circle',
              warning: 'fa-exclamation-triangle',
              info: 'fa-info-circle'
            };
            
            const colors = {
              success: 'bg-green-500',
              error: 'bg-red-500',
              warning: 'bg-yellow-500',
              info: 'bg-blue-500'
            };
            
            const toastId = 'toast-' + Date.now();
            const icon = icons[type] || icons.info;
            const color = colors[type] || colors.info;
            
            const toast = document.createElement('div');
            toast.id = toastId;
            toast.className = \`
              \${color} text-white px-4 py-3 rounded-lg shadow-lg
              flex items-center gap-3 min-w-[300px] max-w-md
              pointer-events-auto
              transform translate-x-[400px] transition-transform duration-300
            \`;
            
            toast.innerHTML = \`
              <i class="fas \${icon} text-xl"></i>
              <span class="flex-1 text-sm font-medium">\${message}</span>
              <button 
                onclick="closeToast('\${toastId}')" 
                class="text-white hover:text-gray-200 transition-colors"
                aria-label="Fermer"
              >
                <i class="fas fa-times"></i>
              </button>
            \`;
            
            container.appendChild(toast);
            
            // Animate in
            setTimeout(() => {
              toast.style.transform = 'translateX(0)';
            }, 10);
            
            // Auto remove
            if (duration > 0) {
              setTimeout(() => {
                closeToast(toastId);
              }, duration);
            }
          }
          
          function closeToast(toastId) {
            const toast = document.getElementById(toastId);
            if (toast) {
              toast.style.transform = 'translateX(400px)';
              setTimeout(() => {
                toast.remove();
              }, 300);
            }
          }
          
          // Expose globally
          window.showToast = showToast;
          window.closeToast = closeToast;
        `
      }}></script>
    </>
  );
};
