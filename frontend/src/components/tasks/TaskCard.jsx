import { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import { 
  CheckIcon, 
  TrashIcon, 
  EditIcon, 
  ShareIcon,
  CalendarIcon,
  UsersIcon,
  EyeIcon
} from '../ui/Icons';
import styles from './TaskCard.module.css';

export function TaskCard({ task, onEdit, onViewDetails }) {
  const { categories, toggleTaskStatus, deleteTask } = useTasks();
  const { success } = useToast();
  const [isAnimating, setIsAnimating] = useState(false);

  const category = categories.find(c => c.id === task.categoryId);
  const isCompleted = task.status === 'completed';

  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => {
      toggleTaskStatus(task.id);
      success(isCompleted ? 'Tarefa reaberta!' : 'Tarefa concluida!');
      setIsAnimating(false);
    }, 300);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    success('Tarefa removida!');
  };

  const priorityColors = {
    high: '#dc2626',
    medium: '#ED7915',
    low: '#008F9D',
  };

  const priorityLabels = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baixa',
  };

  return (
    <div 
      className={`${styles.card} ${isCompleted ? styles.completed : ''} ${isAnimating ? styles.animating : ''}`}
    >
      <div className={styles.header}>
        <button
          className={`${styles.checkbox} ${isCompleted ? styles.checked : ''}`}
          onClick={handleToggle}
          aria-label={isCompleted ? 'Marcar como pendente' : 'Marcar como concluida'}
        >
          {isCompleted && <CheckIcon size={14} />}
        </button>
        
        <div className={styles.content}>
          <h3 className={styles.title}>{task.title}</h3>
          {task.description && (
            <p className={styles.description}>{task.description}</p>
          )}
        </div>

        {/* View Details Button */}
        <button
          className={styles.viewDetailsButton}
          onClick={() => onViewDetails(task)}
          aria-label="Ver detalhes da tarefa"
        >
          <EyeIcon size={18} />
        </button>
      </div>

      <div className={styles.meta}>
        {category && (
          <span 
            className={styles.category}
            style={{ backgroundColor: `${category.color}20`, color: category.color }}
          >
            {category.name}
          </span>
        )}
        
        <span 
          className={styles.priority}
          style={{ backgroundColor: `${priorityColors[task.priority]}15`, color: priorityColors[task.priority] }}
        >
          {priorityLabels[task.priority]}
        </span>

        {task.shared && (
          <span className={styles.shared}>
            <UsersIcon size={12} />
            {task.sharedWith.length}
          </span>
        )}
      </div>

      <div className={styles.footer}>
        {task.dueDate && (
          <div className={styles.dueDate}>
            <CalendarIcon size={14} />
            <span>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
          </div>
        )}

        <div className={styles.actions}>
          {!isCompleted && (
            <>
              <button
                className={styles.actionButton}
                onClick={() => onEdit(task)}
                aria-label="Editar tarefa"
              >
                <EditIcon size={16} />
              </button>
              <button
                className={styles.actionButton}
                onClick={() => onEdit(task, 'share')}
                aria-label="Compartilhar tarefa"
              >
                <ShareIcon size={16} />
              </button>
            </>
          )}
          <button
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={handleDelete}
            aria-label="Excluir tarefa"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
