import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

const PRESET_COLORS = [
  "#0f4c75",
  "#1a8fa0",
  "#38a169",
  "#d69e2e",
  "#e53e3e",
  "#805ad5",
  "#dd6b20",
  "#319795",
  "#2b6cb0",
  "#c05621",
];

const SYSTEM_VERSION = "1.0.0";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { categories, createCategory, updateCategory, deleteCategory } =
    useTasks();

  const { addToast } = useToast();

  const [profileFirstName, setProfileFirstName] = useState(
    user?.first_name ?? "",
  );
  const [profileLastName, setProfileLastName] = useState(user?.last_name ?? "");
  const [profileUsername, setProfileUsername] = useState(user?.username ?? "");
  const [profileEmail, setProfileEmail] = useState(user?.email ?? "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<{
    first_name?: string;
    email?: string;
  }>({});

  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#0f4c75");
  const [isAddingCat, setIsAddingCat] = useState(false);

  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatColor, setEditCatColor] = useState("");

  function validateProfile() {
    const e: typeof profileErrors = {};
    if (!profileFirstName.trim()) e.first_name = "Primeiro nome obrigatório";
    if (!profileEmail) e.email = "E-mail obrigatório";
    else if (!/\S+@\S+\.\S+/.test(profileEmail)) e.email = "E-mail inválido";
    setProfileErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!validateProfile()) return;
    setIsSavingProfile(true);
    try {
      await updateProfile({
        first_name: profileFirstName,
        last_name: profileLastName,
        username: profileUsername,
        email: profileEmail,
      });
    } catch {
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleAddCategory() {
    if (!newCatName.trim()) return;
    setIsAddingCat(true);
    try {
      await createCategory({ name: newCatName.trim(), color: newCatColor });
      setNewCatName("");
      setNewCatColor("#0f4c75");
    } catch {
    } finally {
      setIsAddingCat(false);
    }
  }

  function startEditCat(id: string, name: string, color: string) {
    setEditCatId(id);
    setEditCatName(name);
    setEditCatColor(color);
  }

  async function handleSaveCat(id: string) {
    if (!editCatName.trim()) return;
    try {
      await updateCategory(id, {
        name: editCatName.trim(),
        color: editCatColor,
      });
      setEditCatId(null);
    } catch {}
  }

  async function handleDeleteCategory(id: string) {
    try {
      await deleteCategory(id);
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error };
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl font-sans animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Perfil
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Gerencie suas informações, categorias e preferências.
        </p>
      </div>

      <section className="bg-card border border-border rounded-md p-6 shadow-sm">
        <h2 className="text-base font-semibold text-foreground mb-5">
          Informações pessoais
        </h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-xl">
              {(profileFirstName || user?.first_name || "U")
                .charAt(0)
                .toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <form
          onSubmit={handleSaveProfile}
          noValidate
          className="flex flex-col gap-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="profile-first-name"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Nome
              </label>
              <input
                id="profile-first-name"
                type="text"
                value={profileFirstName}
                onChange={(e) => {
                  setProfileFirstName(e.target.value);
                  if (profileErrors.first_name)
                    setProfileErrors((p) => ({ ...p, first_name: undefined }));
                }}
                className={cn(
                  "w-full px-3 py-2.5 rounded-md border text-sm bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors",
                  profileErrors.first_name
                    ? "border-destructive"
                    : "border-border",
                )}
              />
              {profileErrors.first_name && (
                <p className="mt-1 text-xs text-destructive">
                  {profileErrors.first_name}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="profile-last-name"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Sobrenome
              </label>
              <input
                id="profile-last-name"
                type="text"
                value={profileLastName}
                onChange={(e) => setProfileLastName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-md border border-border text-sm bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="profile-username"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Usuário
              </label>
              <input
                id="profile-username"
                type="text"
                value={profileUsername}
                onChange={(e) => setProfileUsername(e.target.value)}
                className="w-full px-3 py-2.5 rounded-md border border-border text-sm bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="profile-email"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                E-mail
              </label>
              <input
                id="profile-email"
                type="email"
                value={profileEmail}
                onChange={(e) => {
                  setProfileEmail(e.target.value);
                  if (profileErrors.email)
                    setProfileErrors((p) => ({ ...p, email: undefined }));
                }}
                className={cn(
                  "w-full px-3 py-2.5 rounded-md border text-sm bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors",
                  profileErrors.email ? "border-destructive" : "border-border",
                )}
              />
              {profileErrors.email && (
                <p className="mt-1 text-xs text-destructive">
                  {profileErrors.email}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Versão do sistema:{" "}
              <span className="font-mono font-medium">{SYSTEM_VERSION}</span>
            </p>
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

      <section className="bg-card border border-border rounded-md p-6 shadow-sm">
        <h2 className="text-base font-semibold text-foreground mb-5">
          Categorias
        </h2>

        <div className="flex items-end gap-3 mb-4 p-4 bg-muted/50 rounded-md border border-border">
          <div className="flex-1">
            <label
              htmlFor="new-cat-name"
              className="block text-xs font-medium text-foreground mb-1"
            >
              Nome da categoria
            </label>
            <input
              id="new-cat-name"
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              placeholder="Ex: Trabalho, Pessoal..."
              className="w-full px-3 py-2 rounded-md border border-border text-sm bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="new-cat-color"
              className="block text-xs font-medium text-foreground mb-1"
            >
              Cor
            </label>
            <input
              id="new-cat-color"
              type="color"
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
              className="w-10 h-10 rounded-md border border-border cursor-pointer bg-input"
              aria-label="Escolher cor"
            />
          </div>
          <button
            type="button"
            onClick={handleAddCategory}
            disabled={isAddingCat || !newCatName.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed h-[38px]"
          >
            <Plus size={14} />
            Adicionar
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setNewCatColor(color)}
              className={cn(
                "w-6 h-6 rounded-full transition-transform hover:scale-110",
                newCatColor === color &&
                  "ring-2 ring-offset-2 ring-primary scale-110",
              )}
              style={{ backgroundColor: color }}
              aria-label={`Cor ${color}`}
            />
          ))}
        </div>

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
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSaveCat(cat.id)
                      }
                      className="flex-1 px-2 py-1 rounded-md border border-border text-sm bg-input text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveCat(cat.id)}
                      className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                      aria-label="Salvar"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
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
                    <span className="flex-1 text-sm font-medium text-foreground">
                      {cat.name}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {cat.color}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEditCat(cat.id, cat.name, cat.color)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                      aria-label={`Editar categoria ${cat.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
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
  );
}
