import { useTasks } from '../../context/TaskContext';
import { ClipboardIcon, CheckCircleIcon, UsersIcon, TrendingUpIcon } from '../ui/Icons';
import styles from './StatsOverview.module.css';

export function StatsOverview() {
  const { getStats } = useTasks();
  const stats = getStats();

  const statItems = [
    {
      label: 'Tarefas Abertas',
      value: stats.openTasks,
      icon: ClipboardIcon,
      color: '#014E83',
    },
    {
      label: 'Concluidas',
      value: stats.completedTasks,
      icon: CheckCircleIcon,
      color: '#008F9D',
    },
    {
      label: 'Compartilhadas',
      value: stats.sharedTasks,
      icon: UsersIcon,
      color: '#ED7915',
    },
    {
      label: 'Top Categoria',
      value: stats.topCategory?.name || '-',
      icon: TrendingUpIcon,
      color: stats.topCategory?.color || '#014E83',
      isText: true,
    },
  ];

  return (
    <div className={styles.container}>
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index} 
            className={styles.card}
            style={{ '--stat-color': stat.color }}
          >
            <div className={styles.iconWrapper}>
              <Icon size={22} />
            </div>
            <div className={styles.content}>
              <span className={styles.value}>{stat.value}</span>
              <span className={styles.label}>{stat.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
