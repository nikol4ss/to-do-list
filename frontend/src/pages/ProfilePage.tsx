import { useState } from 'react'
import { Pencil, Trash2, Plus, Check, X, Mail } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { authService } from '../services/authService'
import { cn } from '../lib/utils'

const PRESET_COLORS = [
  '#0f4c75', '#1a8fa0', '#38a169', '#d69e2e',
  '#e53e3e', '#805ad5', '#dd6b20', '#319795',
  '#2b6cb0', '#c05621',
]

const SYSTEM_VERSION = '1.0.0'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { categories, createCategory, updateCategory, deleteCategory } = useTasks()
  const { addToast } = useToast()

  // Profile form
  const [profileName, setProfileName] = useState(user?.name ?? '')
  const [profileSurname, setProfileSurname] = useState(user?.surname ?? '')
  const [profileUsername, setProfileUsername] = useState(user?.username ?? '')
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '')
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled ?? false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileErrors, setProfileErrors] = useState<{ name?: string; email?: string }>({})

  // Category form
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#0f4c75')
  const [isAddingCat, setIsAddingCat] = useState(false)

  // Editing a category
  const [editCatId, setEditCatId] = useState<string | null>(null)
  const [editCatName, setEditCatName] = useState('')
  const [editCatColor, setEditCatColor] = useState('')

  function validateProfile() {
    const e: typeof profileErrors = {}
    if (!profileName.trim()) e.name = 'Nome obrigatório'
    if (!profileEmail) e.email = 'E-mail obrigatório'
    else if (!/\S+@\S+\.\S+/.test(profileEmail)) e.email = 'E-mail inválido'
    setProfileErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!validateProfile()) return
    setIsSavingProfile(true)
    try {
      const updated = await authService.updateProfile({
        name: profileName,
        surname: profileSurname,
        username: profileUsername,
        email: profileEmail,
        notificationsEnabled,
      })
      updateUser(updated)
      addToast('Perfil atualizado com sucesso!', 'success')
    } catch {
      // For demo mode, just update locally
      updateUser({
        name: profileName,
        surname: profileSurname,
        username: profileUsername,
        email: profileEmail,
        notificationsEnabled,
      })
      addToast('Perfil atualizado!', 'success')
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handleAddCategory() {
    if (!newCatName.trim()) return
    setIsAddingCat(true)
    await createCategory(newCatName.trim(), newCatColor)
    setNewCatName('')
    setNewCatColor('#0f4c75')
    setIsAddingCat(false)
  }

  function startEditCat(id: string, name: string, color: string) {
    setEditCatId(id)
    setEditCatName(name)
    setEditCatColor(color)
  }

  async function handleSaveCat(id: string) {
    if (!editCatName.trim()) return
    await updateCategory(id, editCatName.trim(), editCatColor)
    setEditCatId(null)
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl font-sans animate-fade-in"
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">Perfil</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Gerencie suas informações, categorias e preferências.</p>
      </div>

      {/* Profile section */}
      <section className="bg-card border border-border rounded-md p-6 shadow-sm">
        <h2 className="text-base font-semibold text-foreground mb-5">Informações pessoais</h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-xl">
              {(profileName || user?.name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} noValidate className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-foreground mb-1.5">
                Nome
              </label>
              <input
                id="profile-name"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className={cn(
                  'w-full px-3 py-2.5 rounded-md border text-sm bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
                  profileErrors.name ? 'border-destructive' : 'border-border'
                )}
              />
              {profileErrors.name && <p className="mt-1 text-xs text-destructive">{profileErrors.name}</p>}
            </div>
            <div>
              <label htmlFor="profile-surname" className="block text-sm font-medium text-foreground mb-1.5">
                Sobrenome
              </label>
              <input
                id="profile-surname"
                type="text"
                value={profileSurname}
                onChange={(e) => setProfileSurname(e.target.value)}
                className="w-full px-3 py-2.5 rounded-md border border-border text-sm bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="profile-username" className="block text-sm font-medium text-foreground mb-1.5">
                Usuário
              </label>
              <input
                id="profile-username"
                type="text"
                value={profileUsername}
                onChange={(e) => setProfileUsername(e.target.value)}
                className="w-full px-3 py-2.5 rounded-md border border-border text-sm bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-foreground mb-1.5">
                E-mail
              </label>
              <input
                id="profile-email"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className={cn(
                  'w-full px-3 py-2.5 rounded-md border text-sm bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
                  profileErrors.email ? 'border-destructive' : 'border-border'
                )}
              />
              {profileErrors.email && <p className="mt-1 text-xs text-destructive">{profileErrors.email}</p>}
            </div>
          </div>

          {/* Notifications toggle */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-md bg-muted/50 border border-border">
            <input
              id="notifications-enabled"
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-border cursor-pointer"
            />
            <label htmlFor="notifications-enabled" className="flex items-center gap-2 flex-1 text-sm font-medium text-foreground cursor-pointer">
              <Mail size={14} className="text-muted-foreground" />
              Receber notificações por e-mail
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <div className="text-xs text-muted-foreground">
              Versão do sistema: <span className="font-mono font-medium">{SYSTEM_VERSION}</span>
            </div>
            <button
              type="submit"
              disabled={isSavingProfile}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {isSavingProfile && (
                <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              )}
              Salvar alterações
            </button>
          </div>
        </form>
      </section>

      {/* Categories section */}
      <section className="bg-card border border-border rounded-md p-6 shadow-sm">
        <h2 className="text-base font-semibold text-foreground mb-5">Categorias</h2>

        {/* Add new category */}
        <div className="flex items-end gap-3 mb-5 p-4 bg-muted/50 rounded-md border border-border">
          <div className="flex-1">
            <label htmlFor="new-cat-name" className="block text-xs font-medium text-foreground mb-1">
              Nome da categoria
            </label>
            <input
              id="new-cat-name"
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              placeholder="Ex: Trabalho, Pessoal..."
              className="w-full px-3 py-2 rounded-md border border-border text-sm bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="new-cat-color" className="block text-xs font-medium text-foreground mb-1">
              Cor
            </label>
            <div className="flex items-center gap-2">
              <input
                id="new-cat-color"
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="w-10 h-10 rounded-md border border-border cursor-pointer bg-input"
                aria-label="Escolher cor"
              />
            </div>
          </div>
          <button
            onClick={handleAddCategory}
            disabled={isAddingCat || !newCatName.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed h-[38px]"
          >
            <Plus size={14} />
            Adicionar
          </button>
        </div>

        {/* Preset colors */}
        <div className="flex flex-wrap gap-2 mb-5">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setNewCatColor(color)}
              className={cn(
                'w-6 h-6 rounded-full transition-transform hover:scale-110',
                newCatColor === color && 'ring-2 ring-offset-2 ring-primary scale-110'
              )}
              style={{ backgroundColor: color }}
              aria-label={`Cor ${color}`}
            />
          ))}
        </div>

        {/* Category list */}
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma categoria criada ainda.
          </p>
        ) : (
          <ul className="flex flex-col gap-2" role="list">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center gap-3 px-4 py-3 rounded-md border border-border bg-background hover:bg-muted/30 transition-colors"
              >
                {editCatId === cat.id ? (
                  <>
                    <input
                      type="color"
                      value={editCatColor}
                      onChange={(e) => setEditCatColor(e.target.value)}
                      className="w-7 h-7 rounded-full border border-border cursor-pointer flex-shrink-0"
                      aria-label="Cor da categoria"
                    />
                    <input
                      type="text"
                      value={editCatName}
                      onChange={(e) => setEditCatName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveCat(cat.id)}
                      className="flex-1 px-2 py-1 rounded-md border border-border text-sm bg-input text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveCat(cat.id)}
                      className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                      aria-label="Salvar"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditCatId(null)}
                      className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                      aria-label="Cancelar"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      className="w-5 h-5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-sm font-medium text-foreground">{cat.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{cat.color}</span>
                    <button
                      onClick={() => startEditCat(cat.id, cat.name, cat.color)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                      aria-label={`Editar categoria ${cat.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      aria-label={`Excluir categoria ${cat.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
