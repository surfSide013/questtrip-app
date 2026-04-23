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
import { Eye, EyeOff, UserPlus } from "lucide-react";

interface RegisterForm { email: string; password: string; name: string; }

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const { setAuth } = useAuth();
  const { toast } = useToast();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();

  const mutation = useMutation({
    mutationFn: (data: RegisterForm) =>
      apiRequest("POST", "/api/auth/register", data).then(r => r.json()),
    onSuccess: (data) => {
      if (data.error) { toast({ title: "Ошибка", description: data.error, variant: "destructive" }); return; }
      setAuth(data.user, data.token);
      navigate("/");
    },
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
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
          <h1 className="text-2xl font-bold mb-1">Создать аккаунт</h1>
          <p className="text-muted-foreground text-sm">Присоединяйся к QuestTrip</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Имя</Label>
              <Input
                placeholder="Твоё имя"
                className="bg-background border-border"
                data-testid="input-name"
                {...register("name", { required: "Введите имя" })}
              />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                className="bg-background border-border"
                data-testid="input-email"
                {...register("email", { required: "Введите email" })}
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Пароль</Label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder="Минимум 6 символов"
                  className="bg-background border-border pr-10"
                  data-testid="input-password"
                  {...register("password", { required: "Введите пароль", minLength: { value: 6, message: "Минимум 6 символов" } })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 gap-2"
              disabled={mutation.isPending} data-testid="button-register">
              <UserPlus className="w-4 h-4" />
              {mutation.isPending ? "Создаём аккаунт..." : "Создать аккаунт"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">Войти</Link>
        </p>
      </div>
    </div>
  );
}
