import { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Sidebar } from '../components/layout/Sidebar';
import { StatsOverview } from '../components/tasks/StatsOverview';
import { TaskColumn } from '../components/tasks/TaskColumn';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskDetailPanel } from '../components/tasks/TaskDetailPanel';
import { ProfilePage } from './ProfilePage';
import { Button } from '../components/ui/Button';
import { 
  PlusIcon, 
  SearchIcon, 
  ClipboardIcon, 
  CheckCircleIcon, 
  UsersIcon 
} from '../components/ui/Icons';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const { filter, setFilter } = useTasks();
  const [currentPage, setCurrentPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formMode, setFormMode] = useState('create');
  const [selectedTask, setSelectedTask] = useState(null);

  const handleOpenForm = () => {
    setEditingTask(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEditTask = (task, mode = 'edit') => {
    setEditingTask(task);
    setFormMode(mode);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
    setFormMode('create');
  };

  const handleViewTaskDetails = (task) => {
    setSelectedTask(task);
  };

  const handleCloseTaskDetails = () => {
    setSelectedTask(null);
  };

  const handleSearch = (e) => {
    setFilter(prev => ({ ...prev, search: e.target.value }));
  };

  const renderContent = () => {
    if (currentPage === 'profile' || currentPage === 'categories') {
      return <ProfilePage defaultTab={currentPage === 'categories' ? 'categories' : 'profile'} />;
    }

    return (
      <>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Gerencie suas tarefas de forma eficiente</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.searchWrapper}>
              <SearchIcon size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                value={filter.search}
                onChange={handleSearch}
                className={styles.searchInput}
              />
            </div>
            <Button onClick={handleOpenForm}>
              <PlusIcon size={18} />
              Nova Tarefa
            </Button>
          </div>
        </div>

        <StatsOverview />

        <div className={styles.kanban}>
          <TaskColumn
            title="Tarefas Abertas"
            icon={ClipboardIcon}
            statusFilter="open"
            onEditTask={handleEditTask}
            onViewDetails={handleViewTaskDetails}
            color="#014E83"
          />
          <TaskColumn
            title="Concluidas"
            icon={CheckCircleIcon}
            statusFilter="completed"
            onEditTask={handleEditTask}
            onViewDetails={handleViewTaskDetails}
            color="#008F9D"
          />
          <TaskColumn
            title="Compartilhadas"
            icon={UsersIcon}
            filterByShared={true}
            onEditTask={handleEditTask}
            onViewDetails={handleViewTaskDetails}
            color="#ED7915"
          />
        </div>

        <TaskForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          task={editingTask}
          mode={formMode}
        />

        {selectedTask && (
          <TaskDetailPanel
            task={selectedTask}
            onClose={handleCloseTaskDetails}
            onEdit={handleEditTask}
          />
        )}
      </>
    );
  };

  return (
    <div className={styles.container}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <main className={styles.main}>
        <div className={styles.content}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
