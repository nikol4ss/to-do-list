import { CheckSquare, Eye, EyeOff, LogIn, Tag, Users } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useToast } from "../../hooks";
import { handleApiError } from "../../lib/apiUtils";
import { cn } from "../../lib/utils";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  function handleFieldChange(field: "username" | "password", value: string) {
    if (field === "username") setUsername(value);
    else setPassword(value);

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (serverError) setServerError("");
  }

  function validate() {
    const e: typeof errors = {};
    if (!username.trim()) e.username = "Usuário obrigatório";
    if (!password) e.password = "Senha obrigatória";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;
    setServerError("");

    try {
      setIsLoading(true);
      await login(username, password);
      navigate("/dashboard");
    } catch (error) {
      setIsLoading(false);

      const { message, validationErrors } = handleApiError(error);
      setServerError(message);
      addToast(message, "error");

      if (validationErrors) {
        setErrors({
          username:
            validationErrors.username?.[0] || validationErrors.email?.[0],
          password: validationErrors.password?.[0],
        });
      }
    }
  }

  const demoLogin = () => {
    setUsername("testeusuario");
    setPassword("password123");
    setErrors({});
    setServerError("");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-start p-12 pt-8 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="mb-20 max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-tight text-white">
              Comece agora mesmo <br /> a organizar sua rotina
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mt-4">
              Controle tarefas pessoais e profissionais de forma simples e
              eficiente.
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
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-muted-foreground">
              Não tem uma conta?{" "}
              <Link
                to="/signup"
                className="text-primary font-medium hover:underline"
              >
                Cadastrar-se
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none flex gap-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => handleFieldChange("username", e.target.value)}
                className={cn(
                  "flex h-11 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary",
                  errors.username
                    ? "border-destructive ring-destructive/20"
                    : "border-input",
                )}
                placeholder="seu-username"
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-xs text-destructive font-medium mt-1">
                  {errors.username}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none flex gap-1">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) =>
                    handleFieldChange("password", e.target.value)
                  }
                  className={cn(
                    "flex h-11 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary pr-11",
                    errors.password
                      ? "border-destructive ring-destructive/20"
                      : "border-input",
                  )}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive font-medium mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 w-full h-11 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <button
              type="button"
              onClick={demoLogin}
              className="w-full text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Usar credenciais de demonstração
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
