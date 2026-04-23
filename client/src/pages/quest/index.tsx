import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/App";
import Navbar from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Clock, MapPin, Users, Star, ShoppingCart, Play, ChevronLeft, CreditCard, Check } from "lucide-react";
import { useState } from "react";
import type { Quest } from "@shared/schema";

const formatLabels: Record<string, string> = {
  walking: "Прогулочный", detective: "Детективный",
  historical: "Исторический", family: "Семейный",
};

export default function QuestPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [payDialog, setPayDialog] = useState(false);
  const [payStep, setPayStep] = useState<"form" | "success">("form");

  const { data: quest, isLoading } = useQuery<Quest>({
    queryKey: ["/api/quests", id],
    queryFn: () => apiRequest("GET", `/api/quests/${id}`).then(r => r.json()),
  });

  const { data: ownership } = useQuery<{ owned: boolean }>({
    queryKey: ["/api/purchases/check", id],
    queryFn: () => apiRequest("GET", `/api/purchases/check/${id}`, undefined, token ? { Authorization: `Bearer ${token}` } : undefined).then(r => r.json()),
    enabled: !!user && !!token,
  });

  const purchaseMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/purchases", { questId: Number(id) }, { Authorization: `Bearer ${token}` }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases/check", id] });
      setPayStep("success");
    },
    onError: (e: any) => {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    },
  });

  const handleBuy = () => {
    if (!user) { navigate("/login"); return; }
    setPayDialog(true);
    setPayStep("form");
  };

  const handlePlay = () => navigate(`/play/${id}`);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold mb-2">Квест не найден</h2>
          <p className="text-muted-foreground mb-6">Проверьте ссылку или вернитесь в каталог.</p>
          <Button onClick={() => navigate("/catalog")}>В каталог</Button>
        </div>
      </div>
    );
  }

  const owned = ownership?.owned;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <button onClick={() => navigate("/catalog")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Назад в каталог
        </button>

        {/* Cover */}
        <div className={`rounded-2xl overflow-hidden mb-6 h-48 md:h-64 quest-gradient-${
          { walking: "blue", detective: "purple", historical: "orange", family: "green" }[quest.format] ?? "default"
        } relative`}>
          <div className="absolute inset-0 flex items-end p-6">
            <div>
              <Badge variant="outline" className="text-white/90 border-white/20 bg-white/10 mb-2">
                {formatLabels[quest.format]}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{quest.title}</h1>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
          {quest.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{quest.city}</span>}
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{quest.durationMin} минут</span>
          {quest.rating > 0 && <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />{quest.rating.toFixed(1)}</span>}
          {quest.completions > 0 && <span className="flex items-center gap-1"><Users className="w-4 h-4" />{quest.completions} прохождений</span>}
        </div>

        {/* Description */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="font-semibold mb-3">О квесте</h2>
          <p className="text-muted-foreground leading-relaxed">{quest.description}</p>
        </div>

        {/* Purchase / Play block */}
        <div className="bg-card border border-border rounded-xl p-6 glow-border">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-3xl font-bold mb-1">
                {quest.price === 0 ? "Бесплатно" : `${quest.price} ₽`}
              </div>
              {owned && (
                <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                  <Check className="w-4 h-4" /> Куплено
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {owned ? (
                <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={handlePlay} data-testid="button-play">
                  <Play className="w-4 h-4" /> Играть
                </Button>
              ) : (
                <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={handleBuy} data-testid="button-buy">
                  <ShoppingCart className="w-4 h-4" />
                  {quest.price === 0 ? "Получить бесплатно" : "Купить и играть"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={payDialog} onOpenChange={setPayDialog}>
        <DialogContent className="bg-card border-border max-w-sm">
          {payStep === "form" ? (
            <>
              <DialogHeader>
                <DialogTitle>Оплата квеста</DialogTitle>
                <DialogDescription>{quest.title}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="text-sm text-muted-foreground mb-1">Сумма к оплате</div>
                  <div className="text-3xl font-bold">{quest.price === 0 ? "Бесплатно" : `${quest.price} ₽`}</div>
                </div>
                {quest.price > 0 && (
                  <div className="space-y-3">
                    <input placeholder="Номер карты" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" defaultValue="•••• •••• •••• 4242" readOnly />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="MM/YY" className="bg-background border border-border rounded-md px-3 py-2 text-sm" defaultValue="12/27" readOnly />
                      <input placeholder="CVV" className="bg-background border border-border rounded-md px-3 py-2 text-sm" defaultValue="•••" readOnly />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">Это демо-форма. Реальная оплата не производится.</p>
                  </div>
                )}
                <Button
                  className="w-full bg-primary hover:bg-primary/90 gap-2"
                  onClick={() => purchaseMutation.mutate()}
                  disabled={purchaseMutation.isPending}
                  data-testid="button-confirm-payment"
                >
                  <CreditCard className="w-4 h-4" />
                  {purchaseMutation.isPending ? "Обработка..." : quest.price === 0 ? "Получить доступ" : "Оплатить"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Доступ получен!</DialogTitle>
              </DialogHeader>
              <div className="py-4 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-muted-foreground">Квест «{quest.title}» теперь доступен. Начни приключение прямо сейчас!</p>
                <Button className="w-full bg-primary hover:bg-primary/90 gap-2" onClick={() => { setPayDialog(false); handlePlay(); }}>
                  <Play className="w-4 h-4" /> Начать игру
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
