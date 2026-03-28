import { useState, useEffect } from 'react';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, TextArea, Select } from '../ui/Input';
import styles from './TaskForm.module.css';

export function TaskForm({ isOpen, onClose, task = null, mode = 'create' }) {
  const { categories, addTask, updateTask, shareTask } = useTasks();
  const { success, error } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: 'medium',
    dueDate: '',
  });
  
  const [shareEmail, setShareEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (task && mode !== 'create') {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        categoryId: task.categoryId?.toString() || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        categoryId: categories[0]?.id?.toString() || '',
        priority: 'medium',
        dueDate: '',
      });
    }
    setShareEmail('');
    setErrors({});
  }, [task, mode, isOpen, categories]);

  const validate = () => {
    const newErrors = {};
    
    if (mode === 'share') {
      if (!shareEmail.trim()) {
        newErrors.email = 'Email e obrigatorio';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shareEmail)) {
        newErrors.email = 'Email invalido';
      }
    } else {
      if (!formData.title.trim()) {
        newErrors.title = 'Titulo e obrigatorio';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (mode === 'share') {
        shareTask(task.id, shareEmail);
        success('Tarefa compartilhada com sucesso!');
      } else if (mode === 'edit') {
        updateTask(task.id, {
          ...formData,
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        });
        success('Tarefa atualizada com sucesso!');
      } else {
        addTask({
          ...formData,
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        });
        success('Tarefa criada com sucesso!');
      }
      
      onClose();
    } catch (err) {
      error('Ocorreu um erro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const categoryOptions = [
    { value: '', label: 'Selecione uma categoria' },
    ...categories.map(c => ({ value: c.id.toString(), label: c.name }))
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
  ];

  const getTitle = () => {
    switch (mode) {
      case 'edit': return 'Editar Tarefa';
      case 'share': return 'Compartilhar Tarefa';
      default: return 'Nova Tarefa';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="medium">
      <form onSubmit={handleSubmit} className={styles.form}>
        {mode === 'share' ? (
          <>
            <div className={styles.shareInfo}>
              <p>Compartilhando: <strong>{task?.title}</strong></p>
              {task?.sharedWith?.length > 0 && (
                <div className={styles.sharedWith}>
                  <span>Ja compartilhado com:</span>
                  <ul>
                    {task.sharedWith.map((email, i) => (
                      <li key={i}>{email}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Input
              label="Email do destinatario"
              name="email"
              type="email"
              placeholder="email@exemplo.com"
              value={shareEmail}
              onChange={(e) => {
                setShareEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
              }}
              error={errors.email}
            />
          </>
        ) : (
          <>
            <Input
              label="Titulo"
              name="title"
              placeholder="Digite o titulo da tarefa"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
            />
            
            <TextArea
              label="Descricao"
              name="description"
              placeholder="Descreva a tarefa (opcional)"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
            
            <div className={styles.row}>
              <Select
                label="Categoria"
                name="categoryId"
                options={categoryOptions}
                value={formData.categoryId}
                onChange={handleChange}
              />
              
              <Select
                label="Prioridade"
                name="priority"
                options={priorityOptions}
                value={formData.priority}
                onChange={handleChange}
              />
            </div>
            
            <Input
              label="Data de vencimento"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </>
        )}
        
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading}>
            {mode === 'share' ? 'Compartilhar' : mode === 'edit' ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
