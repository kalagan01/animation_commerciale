import type { JSX } from 'hono/jsx';

interface ModalProps {
  id: string;
  title?: string;
  children: any;
  footer?: any;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeButton?: boolean;
  backdropClose?: boolean;
  className?: string;
}

export const Modal = ({
  id,
  title,
  children,
  footer,
  size = 'md',
  closeButton = true,
  backdropClose = true,
  className = ''
}: ModalProps): JSX.Element => {
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };
  
  const modalClasses = `
    modal fixed inset-0 z-50 flex items-center justify-center p-4
    bg-black bg-opacity-50 backdrop-blur-sm
    hidden opacity-0 transition-opacity duration-300
    ${className}
  `;
  
  const contentClasses = `
    modal-content bg-white rounded-lg shadow-2xl
    w-full ${sizeClasses[size]}
    transform transition-transform duration-300 scale-95
    max-h-[90vh] overflow-y-auto
  `;
  
  const backdropClickHandler = backdropClose 
    ? `if (event.target === event.currentTarget) closeModal('${id}')` 
    : undefined;
  
  return (
    <>
      <div 
        id={id}
        class={modalClasses}
        onclick={backdropClickHandler}
        data-modal="true"
      >
        <div class={contentClasses}>
          {/* Header */}
          {(title || closeButton) && (
            <div class="modal-header flex items-center justify-between p-4 border-b border-gray-200">
              {title && (
                <h3 class="text-xl font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              {closeButton && (
                <button
                  type="button"
                  onclick={`closeModal('${id}')`}
                  class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Fermer"
                >
                  <i class="fas fa-times text-xl"></i>
                </button>
              )}
            </div>
          )}
          
          {/* Body */}
          <div class="modal-body p-6">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div class="modal-footer flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
              {footer}
            </div>
          )}
        </div>
      </div>
      
      {/* JavaScript pour gérer le modal */}
      <script dangerouslySetInnerHTML={{
        __html: `
          function openModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
              modal.classList.remove('hidden');
              setTimeout(() => {
                modal.classList.remove('opacity-0');
                const content = modal.querySelector('.modal-content');
                if (content) content.classList.remove('scale-95');
              }, 10);
              document.body.style.overflow = 'hidden';
            }
          }
          
          function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
              modal.classList.add('opacity-0');
              const content = modal.querySelector('.modal-content');
              if (content) content.classList.add('scale-95');
              setTimeout(() => {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
              }, 300);
            }
          }
          
          // Close on Escape key
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              const openModals = document.querySelectorAll('.modal:not(.hidden)');
              openModals.forEach(modal => closeModal(modal.id));
            }
          });
        `
      }}></script>
    </>
  );
};
