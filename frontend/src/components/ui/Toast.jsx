import { useToast } from '../../context/ToastContext';
import { CheckCircleIcon, AlertCircleIcon, InfoIcon, XIcon } from './Icons';
import styles from './Toast.module.css';

const icons = {
  success: CheckCircleIcon,
  error: AlertCircleIcon,
  warning: AlertCircleIcon,
  info: InfoIcon,
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className={styles.container} role="region" aria-label="Notificacoes">
      {toasts.map(toast => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type]}`}
            role="alert"
          >
            <Icon size={18} className={styles.icon} />
            <span className={styles.message}>{toast.message}</span>
            <button
              className={styles.close}
              onClick={() => removeToast(toast.id)}
              aria-label="Fechar notificacao"
            >
              <XIcon size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
