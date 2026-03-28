import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { 
  UserIcon, 
  TagIcon, 
  EditIcon, 
  TrashIcon, 
  PlusIcon,
  MailIcon
} from '../components/ui/Icons';
import styles from './ProfilePage.module.css';

export function ProfilePage({ defaultTab = 'profile' }) {
  const { user, updateProfile } = useAuth();
  const { categories, addCategory, updateCategory, deleteCategory } = useTasks();
  const { success, error } = useToast();
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  const [categoryData, setCategoryData] = useState({
    name: '',
    color: '#000000',
  });
  
  const [errors, setErrors] = useState({});

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!profileData.name.trim()) newErrors.name = 'Nome e obrigatorio';
    if (!profileData.email.trim()) newErrors.email = 'Email e obrigatorio';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        success('Perfil atualizado com sucesso!');
      } else {
        error(result.error || 'Erro ao atualizar perfil');
      }
    } catch (err) {
      error('Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryData({ name: category.name, color: category.color });
    } else {
      setEditingCategory(null);
      setCategoryData({ name: '', color: '#000000' });
    }
    setIsCategoryModalOpen(true);
    setErrors({});
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryData({ name: '', color: '#000000' });
    setErrors({});
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    
    if (!categoryData.name.trim()) {
      setErrors({ categoryName: 'Nome e obrigatorio' });
      return;
    }
    
    if (editingCategory) {
      updateCategory(editingCategory.id, categoryData);
      success('Categoria atualizada!');
    } else {
      addCategory(categoryData);
      success('Categoria criada!');
    }
    
    handleCloseCategoryModal();
  };

  const handleDeleteCategory = (categoryId) => {
    deleteCategory(categoryId);
    success('Categoria removida!');
  };

  const predefinedColors = [
    '#0891b2', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <UserIcon size={18} />
          Perfil
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'categories' ? styles.active : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <TagIcon size={18} />
          Categorias
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'profile' ? (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Editar Perfil</h2>
              <p>Atualize suas informacoes pessoais</p>
            </div>
            
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3>{user?.name || 'Usuario'}</h3>
                <p>{user?.email || 'email@exemplo.com'}</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className={styles.form}>
              <Input
                label="Nome"
                name="name"
                value={profileData.name}
                onChange={(e) => {
                  setProfileData(prev => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                error={errors.name}
                icon={UserIcon}
              />
              
              <Input
                label="Email"
                name="email"
                type="email"
                value={profileData.email}
                onChange={(e) => {
                  setProfileData(prev => ({ ...prev, email: e.target.value }));
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                error={errors.email}
                icon={MailIcon}
              />
              
              <div className={styles.formActions}>
                <Button type="submit" loading={isLoading}>
                  Salvar Alteracoes
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Categorias</h2>
                <p>Organize suas tarefas com categorias personalizadas</p>
              </div>
              <Button onClick={() => handleOpenCategoryModal()}>
                <PlusIcon size={18} />
                Nova Categoria
              </Button>
            </div>

            <div className={styles.categoriesList}>
              {categories.length === 0 ? (
                <div className={styles.emptyState}>
                  <TagIcon size={48} />
                  <p>Nenhuma categoria criada</p>
                  <Button onClick={() => handleOpenCategoryModal()}>
                    Criar primeira categoria
                  </Button>
                </div>
              ) : (
                categories.map(category => (
                  <div key={category.id} className={styles.categoryItem}>
                    <div className={styles.categoryInfo}>
                      <div 
                        className={styles.categoryColor}
                        style={{ backgroundColor: category.color }}
                      />
                      <span className={styles.categoryName}>{category.name}</span>
                      <span className={styles.categoryHex}>{category.color}</span>
                    </div>
                    <div className={styles.categoryActions}>
                      <button
                        className={styles.iconButton}
                        onClick={() => handleOpenCategoryModal(category)}
                        aria-label="Editar categoria"
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        className={`${styles.iconButton} ${styles.deleteButton}`}
                        onClick={() => handleDeleteCategory(category.id)}
                        aria-label="Excluir categoria"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
        size="small"
      >
        <form onSubmit={handleCategorySubmit} className={styles.categoryForm}>
          <Input
            label="Nome da categoria"
            value={categoryData.name}
            onChange={(e) => {
              setCategoryData(prev => ({ ...prev, name: e.target.value }));
              if (errors.categoryName) setErrors(prev => ({ ...prev, categoryName: '' }));
            }}
            error={errors.categoryName}
            placeholder="Ex: Trabalho, Pessoal, Estudos..."
          />
          
          <div className={styles.colorPicker}>
            <label className={styles.colorLabel}>Cor da categoria</label>
            <div className={styles.colorOptions}>
              {predefinedColors.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`${styles.colorOption} ${categoryData.color === color ? styles.selected : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setCategoryData(prev => ({ ...prev, color }))}
                  aria-label={`Selecionar cor ${color}`}
                />
              ))}
            </div>
            <div className={styles.customColor}>
              <input
                type="color"
                value={categoryData.color}
                onChange={(e) => setCategoryData(prev => ({ ...prev, color: e.target.value }))}
                className={styles.colorInput}
              />
              <Input
                value={categoryData.color}
                onChange={(e) => setCategoryData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="#000000"
                className={styles.hexInput}
              />
            </div>
          </div>
          
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={handleCloseCategoryModal} type="button">
              Cancelar
            </Button>
            <Button type="submit">
              {editingCategory ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
