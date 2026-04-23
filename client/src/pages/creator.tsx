import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/App";
import Navbar from "@/components/shared/navbar";
import QuestCard from "@/components/shared/quest-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Plus, LayoutDashboard, BookOpen, TrendingUp, Edit, Trash2, Send, Users } from "lucide-react";
import type { Quest } from "@shared/schema";

export default function CreatorPage() {
  const { user, token, setAuth } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) navigate("/login");
    else if (user.role === "player") navigate("/");
  }, [user]);

  const headers = { Authorization: `Bearer ${token}` };

  const { data: quests = [], isLoading } = useQuery<Quest[]>({
    queryKey: ["/api/creator/quests"],
    queryFn: () => apiRequest("GET", "/api/creator/quests", undefined, headers).then(r => r.json()),
    enabled: !!user && user.role !== "player",
  });

  const becomeCreatorMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/become-creator", {}, headers).then(r => r.json()),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast({ title: "Теперь ты создатель!", description: "Можешь создавать и публиковать квесты." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/creator/quests/${id}`, undefined, headers),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/creator/quests"] }),
  });

  const submitMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/creator/quests/${id}/submit`, {}, headers).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creator/quests"] });
      toast({ title: "Отправлено на проверку", description: "Ждите решения модератора." });
    },
    onError: (e: any) => toast({ title: "Ошибка", description: e.message, variant: "destructive" }),
  });

  if (!user) return null;

  // If player — offer to become creator
  if (user.role === "player") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6">✍️</div>
          <h2 className="text-2xl font-bold mb-3">Стань создателем квестов</h2>
          <p className="text-muted-foreground mb-8">
            Создавай собственные сценарии, настраивай уровни и задания, публикуй квесты на платформе и зарабатывай на каждом прохождении.
          </p>
          <Button
            className="bg-primary hover:bg-primary/90 gap-2"
            onClick={() => becomeCreatorMutation.mutate()}
            disabled={becomeCreatorMutation.isPending}
            data-testid="button-become-creator"
          >
            {becomeCreatorMutation.isPending ? "Обновляем..." : "Стать создателем"}
          </Button>
        </div>
      </div>
    );
  }

  const published = quests.filter(q => q.status === "published");
  const pending = quests.filter(q => q.status === "pending");
  const drafts = quests.filter(q => q.status === "draft");
  const rejected = quests.filter(q => q.status === "rejected");

  const totalCompletions = quests.reduce((s, q) => s + q.completions, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold">Мои квесты</h1>
            </div>
            <p className="text-muted-foreground text-sm">Управляй своими квестами и отслеживай статистику</p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 gap-2"
            onClick={() => navigate("/creator/new")}
            data-testid="button-new-quest"
          >
            <Plus className="w-4 h-4" /> Новый квест
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Всего квестов", value: quests.length, icon: BookOpen },
            { label: "Опубликовано", value: published.length, icon: TrendingUp },
            { label: "На проверке", value: pending.length, icon: Send },
            { label: "Прохождений", value: totalCompletions, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <div className="text-2xl font-bold">{value}</div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : quests.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="font-semibold text-lg mb-2">Пока нет квестов</h3>
            <p className="text-muted-foreground text-sm mb-6">Создай свой первый квест — нажми кнопку выше.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {[
              { title: "Черновики", items: drafts },
              { title: "На проверке", items: pending },
              { title: "Отклонённые", items: rejected },
              { title: "Опубликованные", items: published },
            ].filter(g => g.items.length > 0).map(group => (
              <div key={group.title}>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">{group.title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {group.items.map(q => (
                    <div key={q.id} className="relative group">
                      <QuestCard quest={q} showStatus />
                      {/* Actions overlay */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="w-7 h-7"
                          onClick={e => { e.preventDefault(); navigate(`/creator/edit/${q.id}`); }}
                          data-testid={`button-edit-${q.id}`}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        {q.status === "draft" && (
                          <Button
                            size="icon"
                            className="w-7 h-7 bg-primary hover:bg-primary/90"
                            onClick={e => { e.preventDefault(); submitMutation.mutate(q.id); }}
                            title="Отправить на проверку"
                            data-testid={`button-submit-${q.id}`}
                          >
                            <Send className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="destructive"
                          className="w-7 h-7"
                          onClick={e => { e.preventDefault(); deleteMutation.mutate(q.id); }}
                          data-testid={`button-delete-${q.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
