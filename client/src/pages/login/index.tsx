import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";

interface LoginForm { email: string; password: string; }

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { setAuth } = useAuth();
  const { toast } = useToast();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const mutation = useMutation({
    mutationFn: (data: LoginForm) =>
      apiRequest("POST", "/api/auth/login", data).then(r => r.json()),
    onSuccess: (data) => {
      if (data.error) { toast({ title: "Ошибка", description: data.error, variant: "destructive" }); return; }
      setAuth(data.user, data.token);
      navigate("/");
    },
    onError: () => toast({ title: "Ошибка входа", description: "Проверьте email и пароль", variant: "destructive" }),
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
                <path d="M10 18 L18 10 L26 18 L18 26 Z" fill="none" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
                <circle cx="18" cy="18" r="3" fill="white"/>
              </svg>
            </div>
            <span className="font-bold text-xl">QuestTrip</span>
          </Link>
          <h1 className="text-2xl font-bold mb-1">Добро пожаловать</h1>
          <p className="text-muted-foreground text-sm">Войдите в свой аккаунт</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium mb-1.5 block">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-background border-border"
                data-testid="input-email"
                {...register("email", { required: "Введите email" })}
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium mb-1.5 block">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-background border-border pr-10"
                  data-testid="input-password"
                  {...register("password", { required: "Введите пароль" })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 gap-2"
              disabled={mutation.isPending} data-testid="button-login">
              <LogIn className="w-4 h-4" />
              {mutation.isPending ? "Входим..." : "Войти"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
