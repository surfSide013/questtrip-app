import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/App";
import Navbar from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import {
  Shield, CheckCircle, XCircle, Clock, Users, BookOpen,
  ChevronDown, ChevronUp, Search, RefreshCw, UserCheck
} from "lucide-react";
import type { Quest } from "@shared/schema";

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export default function AdminPage() {
  const { user, token } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const headers = { Authorization: `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState<"quests" | "users">("quests");
  const [expandedQuest, setExpandedQuest] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [userSearch, setUserSearch] = useState("");

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== "admin") navigate("/");
  }, [user]);

  // Admin setup form (shown when not logged in as admin)
  const { data: pendingQuests = [], isLoading: questsLoading } = useQuery<Quest[]>({
    queryKey: ["/api/admin/quests", token],
    queryFn: ({ queryKey }) => {
      const tk = queryKey[1] as string;
      return apiRequest("GET", "/api/admin/quests", undefined, { Authorization: `Bearer ${tk}` }).then(r => r.json());
    },
    enabled: !!token && user?.role === "admin",
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users", token],
    queryFn: ({ queryKey }) => {
      const tk = queryKey[1] as string;
      return apiRequest("GET", "/api/admin/users", undefined, { Authorization: `Bearer ${tk}` }).then(r => r.json());
    },
    enabled: !!token && user?.role === "admin",
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("POST", `/api/admin/quests/${id}/approve`, {}, headers).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      toast({ title: "Квест одобрен и опубликован" });
    },
    onError: (e: any) => toast({ title: "Ошибка", description: e.message, variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      apiRequest("POST", `/api/admin/quests/${id}/reject`, { reason }, headers).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quests"] });
      setRejectReason("");
      toast({ title: "Квест отклонён" });
    },
    onError: (e: any) => toast({ title: "Ошибка", description: e.message, variant: "destructive" }),
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      apiRequest("POST", `/api/admin/users/${id}/role`, { role }, headers).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Роль изменена" });
    },
    onError: (e: any) => toast({ title: "Ошибка", description: e.message, variant: "destructive" }),
  });

  // Show login/setup screen if not admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
            </div>
            <h1 className="text-xl font-bold mb-1">Панель модерации</h1>
            <p className="text-sm text-muted-foreground">Доступ только для суперпользователя</p>
          </div>

          {/* Show message if logged in but not admin */}
          {user && user.role !== "admin" ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <XCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
              <p className="font-medium mb-1">Недостаточно прав</p>
              <p className="text-sm text-muted-foreground mb-4">
                Ваш аккаунт ({user.name}) не является администратором.
              </p>
              <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                Вернуться на главную
              </Button>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Войдите как администратор, чтобы продолжить
              </p>
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => navigate("/login")}>
                Войти в аккаунт
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const pendingCount = pendingQuests.filter(q => q.status === "pending").length;
  const allQuestCount = pendingQuests.length;

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      draft: { label: "Черновик", className: "bg-muted text-muted-foreground" },
      pending: { label: "На проверке", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
      published: { label: "Опубликован", className: "bg-green-500/20 text-green-400 border-green-500/30" },
      rejected: { label: "Отклонён", className: "bg-destructive/20 text-red-400 border-destructive/30" },
    };
    const s = map[status] || { label: status, className: "" };
    return <Badge variant="outline" className={`text-xs ${s.className}`}>{s.label}</Badge>;
  };

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      player: "bg-muted text-muted-foreground",
      creator: "bg-primary/20 text-primary border-primary/30",
      admin: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    };
    return <Badge variant="outline" className={`text-xs ${map[role] || ""}`}>{role}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Панель администратора</h1>
            <p className="text-xs text-muted-foreground">Добро пожаловать, {user.name}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Clock, label: "На проверке", value: pendingCount, color: "text-yellow-400" },
            { icon: BookOpen, label: "Всего квестов", value: allQuestCount, color: "text-primary" },
            { icon: Users, label: "Пользователей", value: allUsers.length, color: "text-green-400" },
            { icon: UserCheck, label: "Создателей", value: (allUsers as AdminUser[]).filter(u => u.role === "creator").length, color: "text-orange-400" },
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <stat.icon className={`w-4 h-4 mb-2 ${stat.color}`} />
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <Button
            variant={activeTab === "quests" ? "default" : "outline"}
            size="sm"
            className={activeTab === "quests" ? "bg-primary hover:bg-primary/90" : ""}
            onClick={() => setActiveTab("quests")}
            data-testid="tab-quests"
          >
            <BookOpen className="w-3 h-3 mr-1" /> Квесты
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-yellow-500 text-black text-xs rounded-full font-bold">
                {pendingCount}
              </span>
            )}
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            size="sm"
            className={activeTab === "users" ? "bg-primary hover:bg-primary/90" : ""}
            onClick={() => setActiveTab("users")}
            data-testid="tab-users"
          >
            <Users className="w-3 h-3 mr-1" /> Пользователи
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/admin/quests"] });
              queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            }}
          >
            <RefreshCw className="w-3 h-3 mr-1" /> Обновить
          </Button>
        </div>

        {/* QUESTS TAB */}
        {activeTab === "quests" && (
          <div className="space-y-3">
            {questsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
            ) : pendingQuests.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-10 text-center">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <p className="font-medium">Нет квестов для проверки</p>
                <p className="text-sm text-muted-foreground mt-1">Все квесты обработаны</p>
              </div>
            ) : (
              pendingQuests.map(quest => (
                <div key={quest.id} className="bg-card border border-border rounded-xl overflow-hidden"
                  data-testid={`quest-card-${quest.id}`}>
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/2"
                    onClick={() => setExpandedQuest(expandedQuest === quest.id ? null : quest.id)}
                  >
                    {quest.coverUrl ? (
                      <img src={quest.coverUrl} alt="" className="w-12 h-12 rounded-lg object-cover bg-muted shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{quest.title}</span>
                        {statusBadge(quest.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {quest.city} · {quest.durationMin} мин · {quest.price > 0 ? `${quest.price} ₽` : "Бесплатно"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {quest.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-500 text-white h-8 gap-1"
                            onClick={e => { e.stopPropagation(); approveMutation.mutate(quest.id); }}
                            disabled={approveMutation.isPending}
                            data-testid={`button-approve-${quest.id}`}
                          >
                            <CheckCircle className="w-3 h-3" /> Одобрить
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 gap-1"
                            onClick={e => { e.stopPropagation(); setExpandedQuest(quest.id); }}
                            data-testid={`button-reject-${quest.id}`}
                          >
                            <XCircle className="w-3 h-3" /> Отклонить
                          </Button>
                        </>
                      )}
                      {expandedQuest === quest.id
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      }
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedQuest === quest.id && (
                    <div className="border-t border-border p-4 bg-background/40 space-y-3">
                      <p className="text-sm text-muted-foreground">{quest.description}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>Формат: {quest.format}</span>
                        <span>ID: {quest.id}</span>
                      </div>

                      {/* Reject form */}
                      {quest.status === "pending" && (
                        <div className="space-y-2 pt-2 border-t border-border">
                          <Label className="text-xs text-muted-foreground">Причина отклонения</Label>
                          <div className="flex gap-2">
                            <Input
                              className="bg-card text-sm h-8"
                              placeholder="Опиши причину отклонения квеста..."
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                              data-testid={`input-reject-reason-${quest.id}`}
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 shrink-0"
                              onClick={() => rejectMutation.mutate({ id: quest.id, reason: rejectReason })}
                              disabled={rejectMutation.isPending}
                              data-testid={`button-confirm-reject-${quest.id}`}
                            >
                              Подтвердить
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9 bg-card"
                placeholder="Поиск по имени или email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                data-testid="input-user-search"
              />
            </div>

            {usersLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="divide-y divide-border">
                  {filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      Пользователи не найдены
                    </div>
                  ) : (
                    filteredUsers.map(u => (
                      <div key={u.id} className="flex items-center gap-3 p-4"
                        data-testid={`user-row-${u.id}`}>
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{u.name}</span>
                            {roleBadge(u.role)}
                            {u.id === user?.id && (
                              <span className="text-xs text-muted-foreground">(вы)</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                        {u.id !== user?.id && (
                          <Select
                            value={u.role}
                            onValueChange={role => changeRoleMutation.mutate({ id: u.id, role })}
                          >
                            <SelectTrigger
                              className="w-32 h-8 bg-background text-xs"
                              data-testid={`select-role-${u.id}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="player">player</SelectItem>
                              <SelectItem value="creator">creator</SelectItem>
                              <SelectItem value="admin">admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
