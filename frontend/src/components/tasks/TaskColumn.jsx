import { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { TaskCard } from './TaskCard';
import { Select } from '../ui/Input';
import { ChevronLeftIcon, ChevronRightIcon, FilterIcon } from '../ui/Icons';
import styles from './TaskColumn.module.css';

export function TaskColumn({ 
  title, 
  icon: Icon, 
  statusFilter, 
  filterByShared = false,
  onEditTask,
  onViewDetails,
  color = 'var(--primary)'
}) {
  const { tasks, categories, filter } = useTasks();
  const [currentPage, setCurrentPage] = useState(1);
  const [localFilter, setLocalFilter] = useState({
    category: 'all',
    priority: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const perPage = 4;

  // Filter tasks
  let filteredTasks = tasks.filter(task => {
    // Status filter
    if (statusFilter && task.status !== statusFilter) return false;
    
    // Shared filter
    if (filterByShared && !task.shared) return false;
    
    // Category filter
    if (localFilter.category !== 'all' && task.categoryId !== parseInt(localFilter.category)) return false;
    
    // Priority filter
    if (localFilter.priority !== 'all' && task.priority !== localFilter.priority) return false;
    
    // Search filter from global
    if (filter.search) {
      const search = filter.search.toLowerCase();
      if (!task.title.toLowerCase().includes(search) && !task.description?.toLowerCase().includes(search)) {
        return false;
      }
    }
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / perPage);
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * perPage, currentPage * perPage);

  const categoryOptions = [
    { value: 'all', label: 'Todas categorias' },
    ...categories.map(c => ({ value: c.id.toString(), label: c.name }))
  ];

  const priorityOptions = [
    { value: 'all', label: 'Todas prioridades' },
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Media' },
    { value: 'low', label: 'Baixa' },
  ];

  const handleFilterChange = (key, value) => {
    setLocalFilter(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconWrapper} style={{ backgroundColor: `${color}15`, color }}>
            <Icon size={18} />
          </div>
          <h2 className={styles.title}>{title}</h2>
          <span className={styles.count}>{filteredTasks.length}</span>
        </div>
        
        <button
          className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Mostrar filtros"
        >
          <FilterIcon size={16} />
        </button>
      </div>

      {showFilters && (
        <div className={styles.filters}>
          <Select
            options={categoryOptions}
            value={localFilter.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          />
          <Select
            options={priorityOptions}
            value={localFilter.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          />
        </div>
      )}

      <div className={styles.tasks}>
        {paginatedTasks.length === 0 ? (
          <div className={styles.empty}>
            <p>Nenhuma tarefa encontrada</p>
          </div>
        ) : (
          paginatedTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={onEditTask}
              onViewDetails={onViewDetails}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Pagina anterior"
          >
            <ChevronLeftIcon size={16} />
          </button>
          <span className={styles.pageInfo}>
            {currentPage} / {totalPages}
          </span>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Proxima pagina"
          >
            <ChevronRightIcon size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
