import { CheckSquare, Eye, EyeOff, Tag, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useToast } from "../../hooks";
import { handleApiError } from "../../lib/apiUtils";
import { cn } from "../../lib/utils";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { addToast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<{
    first_name?: string;
    last_name?: string;
    username?: string;
    email?: string;
    password?: string;
  }>({});

  type ErrorKeys = keyof typeof errors;

  function handleFieldChange(field: ErrorKeys, value: string) {
    switch (field) {
      case "first_name":
        setFirstName(value);
        break;
      case "last_name":
        setLastName(value);
        break;
      case "username":
        setUsername(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
    }

    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (serverError) setServerError("");
  }

  function validate() {
    const e: typeof errors = {};
    if (!username.trim()) e.username = "Usuário obrigatório";
    if (!email.trim()) e.email = "E-mail obrigatório";
    if (!password) e.password = "Senha obrigatória";
    else if (password.length < 8) e.password = "Mínimo 8 caracteres";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;
    setServerError("");
    setIsLoading(true);

    try {
      await signup(firstName, lastName, username, email, password);
      navigate("/dashboard");
    } catch (error) {
      setIsLoading(false);
      const { message, validationErrors } = handleApiError(error);
      setServerError(message);
      addToast(message, "error");

      if (validationErrors) {
        setErrors((prev) => ({
          ...prev,
          first_name: validationErrors.first_name?.[0] ?? prev.first_name,
          last_name: validationErrors.last_name?.[0] ?? prev.last_name,
          username: validationErrors.username?.[0] ?? prev.username,
          email: validationErrors.email?.[0] ?? prev.email,
          password: validationErrors.password?.[0] ?? prev.password,
        }));
      }
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-start p-12 pt-8 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="mb-20 max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-tight text-white">
              Comece agora mesmo <br /> a organizar sua rotina
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mt-4">
              Crie sua conta gratuitamente e tenha controle total sobre suas
              tarefas pessoais e profissionais.
            </p>
          </div>
        </div>

        <div className="mt-auto space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
              <CheckSquare className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-white/90 font-bold text-base mb-1">
                Gestão de Tarefas
              </h3>
              <p className="text-white/90 text-sm">
                Crie, organize e acompanhe suas tarefas facilmente.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-white/90 font-bold text-base mb-1">
                Compartilhamento
              </h3>
              <p className="text-white/90 text-sm">
                Colabore com sua equipe em tempo real.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
              <Tag className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-white/90 font-bold text-base mb-1">
                Categorias
              </h3>
              <p className="text-white/90 text-sm">
                Organize suas tarefas por categorias personalizadas.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-[450px] animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Criar conta
            </h2>
            <p className="text-muted-foreground">
              Já tem uma conta?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Fazer login
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex gap-1">Nome</label>
                <input
                  value={firstName}
                  onChange={(e) =>
                    handleFieldChange("first_name", e.target.value)
                  }
                  disabled={isLoading}
                  className={cn(
                    "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    errors.first_name ? "border-destructive" : "border-input",
                  )}
                />
                {errors.first_name && (
                  <p className="text-[10px] text-destructive font-medium">
                    {errors.first_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex gap-1">
                  Sobrenome
                </label>
                <input
                  value={lastName}
                  onChange={(e) =>
                    handleFieldChange("last_name", e.target.value)
                  }
                  disabled={isLoading}
                  className={cn(
                    "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    errors.last_name ? "border-destructive" : "border-input",
                  )}
                />
                {errors.last_name && (
                  <p className="text-[10px] text-destructive font-medium">
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex gap-1">
                Nome de usuário <span className="text-destructive">*</span>
              </label>
              <input
                value={username}
                onChange={(e) => handleFieldChange("username", e.target.value)}
                disabled={isLoading}
                placeholder="user123"
                className={cn(
                  "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  errors.username ? "border-destructive" : "border-input",
                )}
              />
              {errors.username && (
                <p className="text-[10px] text-destructive font-medium">
                  {errors.username}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex gap-1">
                E-mail <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                disabled={isLoading}
                autoComplete="off"
                placeholder="seu@email.com"
                className={cn(
                  "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  errors.email ? "border-destructive" : "border-input",
                )}
              />
              {errors.email && (
                <p className="text-[10px] text-destructive font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex gap-1">
                Senha <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) =>
                    handleFieldChange("password", e.target.value)
                  }
                  disabled={isLoading}
                  className={cn(
                    "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    errors.password ? "border-destructive" : "border-input",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-destructive font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 w-full h-11 mt-4 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Criar minha conta</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
