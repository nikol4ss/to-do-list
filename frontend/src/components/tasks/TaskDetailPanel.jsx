import { useTasks } from '../../context/TaskContext';
import { 
  XIcon, 
  CalendarIcon, 
  TagIcon, 
  FlagIcon, 
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  EditIcon,
  TrashIcon
} from '../ui/Icons';
import { Button } from '../ui/Button';
import styles from './TaskDetailPanel.module.css';

export function TaskDetailPanel({ task, onClose, onEdit }) {
  const { categories, toggleTaskStatus, deleteTask } = useTasks();

  if (!task) return null;

  const category = categories.find(c => c.id === task.categoryId);
  const isCompleted = task.status === 'completed';

  const priorityLabels = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baixa',
  };

  const priorityColors = {
    high: '#dc2626',
    medium: '#ED7915',
    low: '#008F9D',
  };

  const handleToggleStatus = () => {
    toggleTaskStatus(task.id);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sem data definida';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Detalhes da Tarefa</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar painel"
          >
            <XIcon size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Status Badge */}
          <div className={styles.statusSection}>
            <span 
              className={`${styles.statusBadge} ${isCompleted ? styles.completed : styles.open}`}
            >
              {isCompleted ? (
                <>
                  <CheckCircleIcon size={16} />
                  Concluida
                </>
              ) : (
                <>
                  <ClockIcon size={16} />
                  Aberta
                </>
              )}
            </span>
          </div>

          {/* Title */}
          <div className={styles.titleSection}>
            <h3 className={`${styles.taskTitle} ${isCompleted ? styles.completedText : ''}`}>
              {task.title}
            </h3>
          </div>

          {/* Description */}
          <div className={styles.section}>
            <h4 className={styles.sectionLabel}>Descricao</h4>
            <p className={styles.description}>
              {task.description || 'Sem descricao adicionada.'}
            </p>
          </div>

          {/* Details Grid */}
          <div className={styles.detailsGrid}>
            {/* Due Date */}
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>
                <CalendarIcon size={18} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Data de Vencimento</span>
                <span className={styles.detailValue}>{formatDate(task.dueDate)}</span>
              </div>
            </div>

            {/* Category */}
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>
                <TagIcon size={18} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Categoria</span>
                {category ? (
                  <span 
                    className={styles.categoryBadge}
                    style={{ 
                      backgroundColor: `${category.color}20`, 
                      color: category.color,
                      borderColor: category.color
                    }}
                  >
                    <span 
                      className={styles.categoryDot}
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </span>
                ) : (
                  <span className={styles.detailValue}>Sem categoria</span>
                )}
              </div>
            </div>

            {/* Priority */}
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>
                <FlagIcon size={18} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Prioridade</span>
                <span 
                  className={styles.priorityBadge}
                  style={{ 
                    backgroundColor: `${priorityColors[task.priority]}15`,
                    color: priorityColors[task.priority]
                  }}
                >
                  {priorityLabels[task.priority]}
                </span>
              </div>
            </div>

            {/* Sharing */}
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>
                <UsersIcon size={18} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Compartilhamento</span>
                {task.shared && task.sharedWith?.length > 0 ? (
                  <div className={styles.sharedUsers}>
                    <span className={styles.sharedCount}>
                      Compartilhada com {task.sharedWith.length} pessoa(s)
                    </span>
                    <div className={styles.usersList}>
                      {task.sharedWith.map((email, index) => (
                        <span key={index} className={styles.userEmail}>{email}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className={styles.detailValue}>Nao compartilhada</span>
                )}
              </div>
            </div>
          </div>

          {/* Created Date */}
          {task.createdAt && (
            <div className={styles.metaInfo}>
              <span>Criada em {formatDate(task.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={handleToggleStatus}
            fullWidth
          >
            {isCompleted ? 'Reabrir Tarefa' : 'Marcar como Concluida'}
          </Button>
          
          {!isCompleted && (
            <Button
              variant="primary"
              onClick={() => {
                onEdit(task);
                onClose();
              }}
              fullWidth
            >
              <EditIcon size={16} />
              Editar Tarefa
            </Button>
          )}
          
          <Button
            variant="danger"
            onClick={handleDelete}
            fullWidth
          >
            <TrashIcon size={16} />
            Excluir Tarefa
          </Button>
        </div>
      </div>
    </>
  );
}
