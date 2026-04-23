import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/App";
import Navbar from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ChevronLeft, Plus, Trash2, GripVertical, Save, Send,
  Type, ListChecks, Image, Lightbulb, ChevronDown, ChevronUp
} from "lucide-react";
import type { Quest, Level } from "@shared/schema";

interface QuestForm {
  title: string; description: string; city: string;
  format: string; durationMin: number; price: number; coverUrl: string;
}

interface LevelForm {
  title: string; story: string; taskType: string;
  taskQuestion: string; taskAnswer: string;
  taskOptions: string; mediaUrl: string;
  hint1: string; hint2: string; hint3: string;
}

export default function QuestEditorPage() {
  const { id } = useParams();
  const isNew = !id || id === "undefined";
  const [, navigate] = useLocation();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const headers = { Authorization: `Bearer ${token}` };

  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [questId, setQuestId] = useState<number | null>(isNew ? null : Number(id));

  useEffect(() => { if (!user) navigate("/login"); }, [user]);

  const { data: quest, isLoading: questLoading } = useQuery<Quest>({
    queryKey: ["/api/quests", questId],
    queryFn: () => apiRequest("GET", `/api/quests/${questId}`).then(r => r.json()),
    enabled: !!questId,
  });

  const { data: levels = [], isLoading: lvlLoading } = useQuery<Level[]>({
    queryKey: ["/api/creator/quests", questId, "levels"],
    queryFn: () => apiRequest("GET", `/api/creator/quests/${questId}/levels`, undefined, headers).then(r => r.json()),
    enabled: !!questId,
  });

  const questForm = useForm<QuestForm>({
    defaultValues: { title: "", description: "", city: "", format: "walking", durationMin: 60, price: 0, coverUrl: "" },
  });

  useEffect(() => {
    if (quest) questForm.reset({
      title: quest.title, description: quest.description, city: quest.city,
      format: quest.format, durationMin: quest.durationMin, price: quest.price, coverUrl: quest.coverUrl ?? "",
    });
  }, [quest]);

  const levelForms = useForm<Record<string, LevelForm>>();

  // Save quest meta
  const saveQuestMutation = useMutation({
    mutationFn: (data: QuestForm) => {
      if (questId) {
        return apiRequest("PUT", `/api/creator/quests/${questId}`, data, headers).then(r => r.json());
      } else {
        return apiRequest("POST", "/api/creator/quests", { ...data, creatorId: user?.id }, headers).then(r => r.json());
      }
    },
    onSuccess: (data) => {
      if (!questId) {
        setQuestId(data.id);
        navigate(`/creator/edit/${data.id}`, { replace: true });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/creator/quests"] });
      toast({ title: "Квест сохранён" });
    },
    onError: (e: any) => toast({ title: "Ошибка", description: e.message, variant: "destructive" }),
  });

  // Add level
  const addLevelMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/creator/quests/${questId}/levels`, {
      title: "Новый уровень", story: "", taskType: "text",
      taskQuestion: "Введите вопрос", taskAnswer: "", order: levels.length + 1,
    }, headers).then(r => r.json()),
    onSuccess: (lvl) => {
      queryClient.invalidateQueries({ queryKey: ["/api/creator/quests", questId, "levels"] });
      setActiveLevel(lvl.id);
    },
  });

  // Save level
  const saveLevelMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Level> }) =>
      apiRequest("PUT", `/api/creator/levels/${id}`, data, headers).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creator/quests", questId, "levels"] });
      toast({ title: "Уровень сохранён" });
    },
  });

  const deleteLevelMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/creator/levels/${id}`, undefined, headers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creator/quests", questId, "levels"] });
      setActiveLevel(null);
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/creator/quests/${questId}/submit`, {}, headers).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creator/quests"] });
      toast({ title: "Отправлено на проверку!" });
      navigate("/creator");
    },
    onError: (e: any) => toast({ title: "Ошибка", description: e.message, variant: "destructive" }),
  });

  if (!user) return null;

  const activeLvl = levels.find(l => l.id === activeLevel);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/creator")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{isNew ? "Новый квест" : (quest?.title || "Редактор квеста")}</h1>
            {quest && <p className="text-xs text-muted-foreground">Статус: {
              { draft: "Черновик", pending: "На проверке", published: "Опубликован", rejected: "Отклонён" }[quest.status]
            }</p>}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={questForm.handleSubmit(d => saveQuestMutation.mutate(d))}
              disabled={saveQuestMutation.isPending}
              className="gap-2"
              data-testid="button-save-quest"
            >
              <Save className="w-4 h-4" />
              {saveQuestMutation.isPending ? "Сохраняю..." : "Сохранить"}
            </Button>
            {questId && (quest?.status === "draft" || quest?.status === "rejected") && (
              <Button
                className="bg-primary hover:bg-primary/90 gap-2"
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                data-testid="button-submit-quest"
              >
                <Send className="w-4 h-4" />
                На проверку
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT — Quest meta */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold mb-4">Основная информация</h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Название *</Label>
                  <Input placeholder="Название квеста" className="bg-background" data-testid="input-quest-title"
                    {...questForm.register("title", { required: true })} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Описание *</Label>
                  <Textarea placeholder="Опиши сюжет квеста..." className="bg-background resize-none" rows={3}
                    data-testid="input-quest-description"
                    {...questForm.register("description", { required: true })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Город</Label>
                    <Input placeholder="Москва" className="bg-background" {...questForm.register("city")} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Длительность (мин)</Label>
                    <Input type="number" className="bg-background" {...questForm.register("durationMin", { valueAsNumber: true })} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Цена (₽)</Label>
                    <Input type="number" className="bg-background" {...questForm.register("price", { valueAsNumber: true })} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Формат</Label>
                    <Select value={questForm.watch("format")} onValueChange={v => questForm.setValue("format", v)}>
                      <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="walking">Прогулочный</SelectItem>
                        <SelectItem value="detective">Детективный</SelectItem>
                        <SelectItem value="historical">Исторический</SelectItem>
                        <SelectItem value="family">Семейный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Ссылка на обложку (URL)</Label>
                  <Input placeholder="https://..." className="bg-background" {...questForm.register("coverUrl")} />
                </div>
              </div>
            </div>

            {/* Levels list */}
            {questId && (
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Уровни ({levels.length})</h2>
                  <Button size="sm" variant="outline" className="gap-1"
                    onClick={() => addLevelMutation.mutate()}
                    disabled={addLevelMutation.isPending}
                    data-testid="button-add-level">
                    <Plus className="w-3 h-3" /> Добавить
                  </Button>
                </div>
                {lvlLoading ? <Skeleton className="h-24" /> : (
                  <div className="space-y-2">
                    {levels.map((lvl, i) => (
                      <div
                        key={lvl.id}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          activeLevel === lvl.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        }`}
                        onClick={() => setActiveLevel(activeLevel === lvl.id ? null : lvl.id)}
                        data-testid={`level-item-${lvl.id}`}
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Badge variant="outline" className="text-xs font-mono shrink-0">{i + 1}</Badge>
                        <span className="text-sm flex-1 truncate">{lvl.title}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {lvl.taskType === "choice" && <ListChecks className="w-3 h-3 text-muted-foreground" />}
                          {lvl.taskType === "text" && <Type className="w-3 h-3 text-muted-foreground" />}
                          <Button size="icon" variant="ghost" className="w-6 h-6"
                            onClick={e => { e.stopPropagation(); deleteLevelMutation.mutate(lvl.id); }}
                            data-testid={`button-delete-level-${lvl.id}`}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {levels.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Добавь хотя бы один уровень</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT — Level editor */}
          <div>
            {activeLvl ? (
              <LevelEditor
                level={activeLvl}
                onSave={(data) => saveLevelMutation.mutate({ id: activeLvl.id, data })}
                isSaving={saveLevelMutation.isPending}
              />
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-muted-foreground text-sm">
                  {questId ? "Выбери уровень слева, чтобы редактировать его" : "Сначала сохрани основную информацию о квесте"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Level Editor Sub-Component ───────────────────────────────────────────────
function LevelEditor({ level, onSave, isSaving }: { level: Level; onSave: (d: Partial<Level>) => void; isSaving: boolean }) {
  const { register, handleSubmit, watch, setValue, reset } = useForm<LevelForm>({
    defaultValues: {
      title: level.title, story: level.story, taskType: level.taskType,
      taskQuestion: level.taskQuestion, taskAnswer: level.taskAnswer,
      taskOptions: level.taskOptions ?? "", mediaUrl: level.mediaUrl ?? "",
      hint1: level.hint1 ?? "", hint2: level.hint2 ?? "", hint3: level.hint3 ?? "",
    },
  });

  useEffect(() => {
    reset({
      title: level.title, story: level.story, taskType: level.taskType,
      taskQuestion: level.taskQuestion, taskAnswer: level.taskAnswer,
      taskOptions: level.taskOptions ?? "", mediaUrl: level.mediaUrl ?? "",
      hint1: level.hint1 ?? "", hint2: level.hint2 ?? "", hint3: level.hint3 ?? "",
    });
  }, [level.id]);

  const taskType = watch("taskType");

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Редактор уровня</h2>
        <Button size="sm" className="bg-primary hover:bg-primary/90 gap-1"
          onClick={handleSubmit(onSave)} disabled={isSaving} data-testid="button-save-level">
          <Save className="w-3 h-3" />
          {isSaving ? "Сохраняю..." : "Сохранить"}
        </Button>
      </div>

      {/* Title */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1 block">Название уровня</Label>
        <Input className="bg-background" data-testid="input-level-title" {...register("title")} />
      </div>

      {/* Story */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
          <Type className="w-3 h-3" /> Нарратив / текст уровня
        </Label>
        <Textarea className="bg-background resize-none" rows={4}
          placeholder="Опиши что видит игрок, создай атмосферу..."
          data-testid="input-level-story"
          {...register("story")} />
      </div>

      {/* Media */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
          <Image className="w-3 h-3" /> Медиа (URL картинки)
        </Label>
        <Input className="bg-background" placeholder="https://..." data-testid="input-level-media" {...register("mediaUrl")} />
      </div>

      {/* Task type */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1 block">Тип задания</Label>
        <Select value={taskType} onValueChange={v => setValue("taskType", v)}>
          <SelectTrigger className="bg-background" data-testid="select-task-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text"><div className="flex items-center gap-2"><Type className="w-3 h-3" /> Открытый ответ</div></SelectItem>
            <SelectItem value="choice"><div className="flex items-center gap-2"><ListChecks className="w-3 h-3" /> Тест (варианты)</div></SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Question */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1 block">Вопрос / задание</Label>
        <Input className="bg-background" placeholder="Что нужно найти или ответить?" data-testid="input-task-question" {...register("taskQuestion")} />
      </div>

      {/* Options for choice type */}
      {taskType === "choice" && (
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Варианты ответов (через запятую)</Label>
          <Input className="bg-background" placeholder="Ответ 1, Ответ 2, Ответ 3" {...register("taskOptions")} />
          <p className="text-xs text-muted-foreground mt-1">Перечисли через запятую. Правильный ответ укажи ниже точно так же.</p>
        </div>
      )}

      {/* Answer */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1 block">Правильный ответ *</Label>
        <Input className="bg-background" placeholder="Правильный ответ" data-testid="input-task-answer" {...register("taskAnswer")} />
      </div>

      {/* Hints */}
      <div className="border border-border rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <Lightbulb className="w-3 h-3" /> Подсказки (до 3)
        </div>
        <Input className="bg-background text-sm" placeholder="Подсказка 1" {...register("hint1")} />
        <Input className="bg-background text-sm" placeholder="Подсказка 2" {...register("hint2")} />
        <Input className="bg-background text-sm" placeholder="Подсказка 3" {...register("hint3")} />
      </div>
    </div>
  );
}
