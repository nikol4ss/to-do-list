import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MailIcon, LockIcon, UserIcon, SunIcon, MoonIcon, ClipboardIcon } from '../components/ui/Icons';
import styles from './AuthPage.module.css';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  
  const { login, signup } = useAuth();
  const { success, error } = useToast();
  const { theme, toggleTheme } = useTheme();

  const validate = () => {
    const newErrors = {};
    
    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Nome e obrigatorio';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email e obrigatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha e obrigatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas nao coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await signup(formData.name, formData.email, formData.password);
      }
      
      if (result.success) {
        success(isLogin ? 'Login realizado com sucesso!' : 'Conta criada com sucesso!');
      } else {
        error(result.error || 'Ocorreu um erro');
      }
    } catch (err) {
      error('Ocorreu um erro inesperado');
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

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <div className={styles.container}>
      <button 
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
      >
        {theme === 'light' ? <MoonIcon size={20} /> : <SunIcon size={20} />}
      </button>
      
      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <div className={styles.branding}>
            <div className={styles.logo}>
              <ClipboardIcon size={40} />
            </div>
            <h1 className={styles.brandTitle}>To-Do List</h1>
            <p className={styles.brandDescription}>
              Organize suas tarefas de forma simples e eficiente. 
              Aumente sua produtividade com nossa plataforma intuitiva.
            </p>
          </div>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <div>
                <h3>Gestao de Tarefas</h3>
                <p>Crie, organize e acompanhe suas tarefas</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h3>Compartilhamento</h3>
                <p>Colabore com sua equipe em tempo real</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <div>
                <h3>Categorias</h3>
                <p>Organize por categorias personalizadas</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h2>{isLogin ? 'Bem-vindo de volta' : 'Criar conta'}</h2>
              <p>
                {isLogin 
                  ? 'Entre com suas credenciais para acessar' 
                  : 'Preencha os dados para criar sua conta'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              {!isLogin && (
                <Input
                  label="Nome"
                  name="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  icon={UserIcon}
                />
              )}
              
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={MailIcon}
              />
              
              <Input
                label="Senha"
                name="password"
                type="password"
                placeholder="Sua senha"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                icon={LockIcon}
              />
              
              {!isLogin && (
                <Input
                  label="Confirmar Senha"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  icon={LockIcon}
                />
              )}
              
              <Button 
                type="submit" 
                fullWidth 
                loading={isLoading}
                className={styles.submitButton}
              >
                {isLogin ? 'Entrar' : 'Criar conta'}
              </Button>
            </form>
            
            <div className={styles.formFooter}>
              <span>
                {isLogin ? 'Nao tem uma conta?' : 'Ja tem uma conta?'}
              </span>
              <button 
                type="button"
                className={styles.toggleButton}
                onClick={toggleMode}
              >
                {isLogin ? 'Criar conta' : 'Fazer login'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
