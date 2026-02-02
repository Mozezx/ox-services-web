interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) => {
  if (!isOpen) return null

  const variantStyles = {
    danger: {
      icon: 'warning',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: 'error',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
    },
    info: {
      icon: 'info',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
  }

  const styles = variantStyles[variant]

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog - modal-panel garante texto escuro em fundo branco */}
      <div className="modal-panel relative w-full max-w-md bg-surface rounded-xl shadow-2xl p-6 animate-modal-enter">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className={`w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center mb-4`}>
            <span className={`material-symbols-outlined text-3xl ${styles.iconColor}`}>
              {styles.icon}
            </span>
          </div>
          
          {/* Title */}
          <h3 id="confirm-title" className="text-xl font-semibold text-text mb-2">
            {title}
          </h3>
          
          {/* Message */}
          <p id="confirm-message" className="text-text-light mb-6">
            {message}
          </p>
          
          {/* Actions */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 btn btn-outline"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 btn text-white ${styles.buttonBg} disabled:opacity-50`}
            >
              {isLoading ? (
                <>
                  <div className="spinner !w-4 !h-4 !border-white/30 !border-t-white" />
                  Aguarde...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
