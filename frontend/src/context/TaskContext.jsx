import { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext(undefined);

// Initial mock data
const initialTasks = [
  {
    id: 1,
    title: 'Revisar documentacao do projeto',
    description: 'Verificar e atualizar a documentacao tecnica',
    categoryId: 1,
    status: 'open',
    priority: 'high',
    dueDate: '2026-04-01',
    createdAt: '2026-03-20',
    shared: false,
    sharedWith: [],
  },
  {
    id: 2,
    title: 'Implementar testes unitarios',
    description: 'Adicionar testes para os componentes principais',
    categoryId: 2,
    status: 'open',
    priority: 'medium',
    dueDate: '2026-04-05',
    createdAt: '2026-03-21',
    shared: true,
    sharedWith: ['joao@email.com'],
  },
  {
    id: 3,
    title: 'Reuniao de planejamento',
    description: 'Discutir proximos passos do projeto',
    categoryId: 3,
    status: 'completed',
    priority: 'low',
    dueDate: '2026-03-25',
    createdAt: '2026-03-18',
    completedAt: '2026-03-25',
    shared: false,
    sharedWith: [],
  },
  {
    id: 4,
    title: 'Corrigir bugs reportados',
    description: 'Resolver issues do GitHub',
    categoryId: 2,
    status: 'completed',
    priority: 'high',
    dueDate: '2026-03-22',
    createdAt: '2026-03-15',
    completedAt: '2026-03-22',
    shared: true,
    sharedWith: ['maria@email.com', 'pedro@email.com'],
  },
];

const initialCategories = [
  { id: 1, name: 'Trabalho', color: '#0891b2' },
  { id: 2, name: 'Desenvolvimento', color: '#10b981' },
  { id: 3, name: 'Reunioes', color: '#f59e0b' },
  { id: 4, name: 'Pessoal', color: '#8b5cf6' },
];

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [filter, setFilter] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    search: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 6,
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  // Task operations
  const addTask = (task) => {
    const newTask = {
      ...task,
      id: Date.now(),
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
      shared: false,
      sharedWith: [],
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const toggleTaskStatus = (id) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const newStatus = task.status === 'open' ? 'completed' : 'open';
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null,
        };
      }
      return task;
    }));
  };

  const shareTask = (id, email) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        return {
          ...task,
          shared: true,
          sharedWith: [...task.sharedWith, email],
        };
      }
      return task;
    }));
  };

  // Category operations
  const addCategory = (category) => {
    const newCategory = {
      ...category,
      id: Date.now(),
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = (id, updates) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
  };

  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
    // Remove category from tasks
    setTasks(prev => prev.map(task => 
      task.categoryId === id ? { ...task, categoryId: null } : task
    ));
  };

  // Filtered tasks
  const getFilteredTasks = (statusFilter = null) => {
    return tasks.filter(task => {
      // Status filter
      if (statusFilter && task.status !== statusFilter) return false;
      if (filter.status !== 'all' && task.status !== filter.status) return false;
      
      // Category filter
      if (filter.category !== 'all' && task.categoryId !== parseInt(filter.category)) return false;
      
      // Priority filter
      if (filter.priority !== 'all' && task.priority !== filter.priority) return false;
      
      // Search filter
      if (filter.search) {
        const search = filter.search.toLowerCase();
        return task.title.toLowerCase().includes(search) || 
               task.description?.toLowerCase().includes(search);
      }
      
      return true;
    });
  };

  // Stats
  const getStats = () => {
    const openTasks = tasks.filter(t => t.status === 'open').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const sharedTasks = tasks.filter(t => t.shared).length;
    
    // Most demanding category
    const categoryCounts = {};
    tasks.forEach(task => {
      if (task.categoryId) {
        categoryCounts[task.categoryId] = (categoryCounts[task.categoryId] || 0) + 1;
      }
    });
    
    const topCategoryId = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0];
    
    const topCategory = categories.find(c => c.id === parseInt(topCategoryId));
    
    return {
      openTasks,
      completedTasks,
      sharedTasks,
      totalTasks: tasks.length,
      topCategory,
    };
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      categories,
      filter,
      setFilter,
      pagination,
      setPagination,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      shareTask,
      addCategory,
      updateCategory,
      deleteCategory,
      getFilteredTasks,
      getStats,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
