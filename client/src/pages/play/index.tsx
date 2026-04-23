import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Lightbulb, ChevronRight, Trophy, Home, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Quest, Level, Progress as ProgressType } from "@shared/schema";

export default function PlayPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<"idle" | "wrong" | "correct">("idle");
  const [hintsShown, setHintsShown] = useState(0);
  const [finished, setFinished] = useState(false);

  // Redirect if not logged in
  useEffect(() => { if (!user) navigate("/login"); }, [user]);

  const { data: quest } = useQuery<Quest>({
    queryKey: ["/api/quests", id],
    queryFn: () => apiRequest("GET", `/api/quests/${id}`).then(r => r.json()),
  });

  const headers = { Authorization: `Bearer ${token}` };

  const { data: levels = [], isLoading: levelsLoading } = useQuery<Level[]>({
    queryKey: ["/api/quests", id, "levels"],
    queryFn: () => apiRequest("GET", `/api/quests/${id}/levels`, undefined, headers).then(r => r.json()),
    enabled: !!user && !!token,
  });

  const { data: prog, isLoading: progLoading } = useQuery<ProgressType>({
    queryKey: ["/api/progress", id],
    queryFn: () => apiRequest("GET", `/api/progress/${id}`, undefined, headers).then(r => r.json()),
    enabled: !!user && !!token,
  });

  const answerMutation = useMutation({
    mutationFn: (vars: { levelId: number; answer: string }) =>
      apiRequest("POST", `/api/progress/${id}/answer`, vars, headers).then(r => r.json()),
    onSuccess: (data) => {
      if (data.correct) {
        setAnswerState("correct");
        queryClient.invalidateQueries({ queryKey: ["/api/progress", id] });
        if (data.finished) {
          setTimeout(() => setFinished(true), 800);
        } else {
          setTimeout(() => {
            setAnswerState("idle");
            setAnswer("");
            setSelectedOption(null);
            setHintsShown(0);
          }, 600);
        }
      } else {
        setAnswerState("wrong");
        setTimeout(() => setAnswerState("idle"), 1500);
      }
    },
  });

  const hintMutation = useMutation({
    mutationFn: (levelId: number) =>
      apiRequest("POST", `/api/progress/${id}/hint`, { levelId }, headers).then(r => r.json()),
    onSuccess: () => setHintsShown(h => h + 1),
  });

  if (!user) return null;

  if (levelsLoading || progLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-3 w-80">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-10" />
        </div>
      </div>
    );
  }

  // Check access
  if (!prog && levels.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
        <div>
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Доступ закрыт</h2>
          <p className="text-muted-foreground mb-6">Сначала купите квест, чтобы начать игру.</p>
          <Button onClick={() => navigate(`/quest/${id}`)}>Купить квест</Button>
        </div>
      </div>
    );
  }

  if (finished || prog?.completedAt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Квест пройден!</h1>
          <p className="text-muted-foreground mb-2">
            Поздравляем! Ты прошёл квест «{quest?.title}» до конца.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Уровней пройдено: {levels.length}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
              <Home className="w-4 h-4" /> На главную
            </Button>
            <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={() => navigate("/catalog")}>
              Ещё квесты
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentOrder = prog?.currentLevel ?? 1;
  const currentLevel = levels.find(l => l.order === currentOrder);
  const totalLevels = levels.length;
  const progressPct = totalLevels > 0 ? ((currentOrder - 1) / totalLevels) * 100 : 0;

  if (!currentLevel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
        <div>
          <p className="text-muted-foreground">Уровень не найден. Что-то пошло не так.</p>
          <Button onClick={() => navigate("/catalog")} className="mt-4">В каталог</Button>
        </div>
      </div>
    );
  }

  const hintsUsed = JSON.parse(prog?.hintsUsed || "[]") as number[];
  const levelHints = [currentLevel.hint1, currentLevel.hint2, currentLevel.hint3].filter(Boolean) as string[];
  const totalHintsAvailable = levelHints.length;
  const currentHintsUsed = hintsShown + (hintsUsed.includes(currentLevel.id) ? 1 : 0);
  const options = currentLevel.taskOptions ? JSON.parse(currentLevel.taskOptions) as string[] : [];

  const handleSubmit = () => {
    const ans = currentLevel.taskType === "choice" ? (selectedOption ?? "") : answer;
    if (!ans.trim()) return;
    answerMutation.mutate({ levelId: currentLevel.id, answer: ans });
  };

  const handleHint = () => {
    if (hintsShown < totalHintsAvailable) {
      hintMutation.mutate(currentLevel.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-10 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Уровень {currentOrder} / {totalLevels}
            </span>
            <span className="text-sm font-bold text-primary">{quest?.title}</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>
      </div>

      {/* Level content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Story */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-primary font-bold text-sm">{currentOrder}</span>
            </div>
            <h2 className="text-lg font-bold">{currentLevel.title}</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{currentLevel.story}</p>
          {currentLevel.mediaUrl && (
            <img src={currentLevel.mediaUrl} alt="Уровень" className="mt-4 rounded-lg w-full object-cover max-h-64" />
          )}
        </div>

        {/* Task */}
        <div className={`bg-card border rounded-2xl p-6 mb-4 transition-all ${
          answerState === "correct" ? "border-emerald-500/50 bg-emerald-500/5" :
          answerState === "wrong" ? "border-red-500/50 bg-red-500/5" :
          "border-border"
        }`}>
          <p className="font-semibold mb-4">{currentLevel.taskQuestion}</p>

          {currentLevel.taskType === "choice" && options.length > 0 ? (
            <div className="space-y-2 mb-4">
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedOption(opt)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                    selectedOption === opt
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border hover:border-primary/40 text-muted-foreground"
                  }`}
                  data-testid={`option-${i}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <Input
              placeholder="Введи ответ..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
              className="bg-background border-border mb-4"
              data-testid="input-answer"
            />
          )}

          {answerState === "correct" && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-4">
              <CheckCircle2 className="w-4 h-4" /> Верно!
            </div>
          )}
          {answerState === "wrong" && (
            <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-4">
              <AlertCircle className="w-4 h-4" /> Неверно, попробуй ещё раз
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 gap-2"
              onClick={handleSubmit}
              disabled={answerMutation.isPending || answerState === "correct"}
              data-testid="button-submit-answer"
            >
              <ChevronRight className="w-4 h-4" />
              {answerMutation.isPending ? "Проверяем..." : "Ответить"}
            </Button>
            {totalHintsAvailable > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleHint}
                disabled={currentHintsUsed >= totalHintsAvailable}
                className="shrink-0"
                title={`Подсказка (${currentHintsUsed}/${totalHintsAvailable})`}
                data-testid="button-hint"
              >
                <Lightbulb className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Hints */}
        {(hintsShown > 0 || hintsUsed.includes(currentLevel.id)) && (
          <div className="space-y-2">
            {levelHints.slice(0, hintsShown || 1).map((hint, i) => (
              <div key={i} className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-200">{hint}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
