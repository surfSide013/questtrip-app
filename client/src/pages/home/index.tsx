import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Compass, Zap, Clock, Trophy, Shield, Star } from "lucide-react";
import { useEffect } from "react";

import PageWrapper from "@/components/shared/page-wrapper";
import Footer from "@/components/shared/footer";
import SectionHeader from "@/components/shared/section-header";
import QuestGrid from "@/components/shared/quest-grid";
import EmptyState from "@/components/shared/empty-state";
import type { Quest } from "@shared/schema";

// ─── Данные для секций ───────────────────────────────────────────────────────

const FEATURES = [
  { icon: Zap,    title: "Купил и сразу играешь",  desc: "Выбрал → оплатил → нажал «Играть». Весь путь занимает меньше двух минут." },
  { icon: Clock,  title: "Без спешки",              desc: "Можно начать, сделать паузу и вернуться позже. Прогресс сохраняется." },
  { icon: Trophy, title: "Понятный финал",          desc: "Каждый квест заканчивается финальным экраном с результатом." },
  { icon: Shield, title: "Проверенные квесты",      desc: "Каждый квест проходит модерацию перед публикацией." },
];

const STEPS = [
  { n: "01", title: "Выбери квест",    desc: "Фильтруй по городу и формату" },
  { n: "02", title: "Оплати доступ",   desc: "Быстрая оплата, подтверждение мгновенно" },
  { n: "03", title: "Нажми «Играть»", desc: "Открывается прямо в браузере" },
  { n: "04", title: "Своим темпом",   desc: "Уровни, подсказки, прогресс" },
];

// ─── Компоненты секций ───────────────────────────────────────────────────────

function HeroSection({ onCatalog, onRegister }: { onCatalog: () => void; onRegister: () => void }) {
  return (
    <section className="hero-gradient relative overflow-hidden py-20 md:py-28">
      {/* Фоновые блоб-элементы */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
          <Star className="w-3 h-3 fill-primary" />
          Онлайн-квесты нового поколения
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          Покупаешь историю —<br />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            входишь в игру
          </span>
        </h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Яркий сюжетный формат для тех, кто хочет быстро выбрать квест, купить доступ и сразу пройти его до эмоционального финала.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2 text-base" onClick={onCatalog} data-testid="button-start">
            <Compass className="w-5 h-5" /> Начать приключение
          </Button>
          <Button size="lg" variant="outline" onClick={onRegister} className="text-base">
            Создать квест
          </Button>
        </div>

        {/* Статистика */}
        <div className="flex flex-col [@media(min-width:501px)]:flex-row items-center justify-center gap-4 [@media(min-width:501px)]:gap-8 text-sm">
          {[
            { value: "Бесплатно", label: "регистрация" },
            { value: "Смешанный", label: "формат" },
            { value: "PWA",       label: "на телефоне" },
          ].map(({ value, label }, i, arr) => (
            <div key={label} className="flex items-center gap-8">
              <div className="text-center">
                <div className="font-bold text-2xl text-foreground">{value}</div>
                <div className="text-muted-foreground text-xs">{label}</div>
              </div>
              {i < arr.length - 1 && <div className="hidden [@media(min-width:501px)]:block w-px h-8 bg-border" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-16 border-t border-border/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="py-16 border-t border-border/50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Путь игрока</div>
          <h2 className="text-2xl font-bold">От покупки до первого экрана за 2 минуты</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} className="text-center">
              <div
                className="text-4xl font-bold text-primary/20 mb-2"
                style={{ WebkitTextStroke: "1px hsl(var(--primary))" }}
              >
                {n}
              </div>
              <h3 className="font-semibold text-sm mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ onCatalog }: { onCatalog: () => void }) {
  return (
    <section className="py-20 border-t border-border/50">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Готов?</div>
        <h2 className="text-3xl font-bold mb-4">Начни своё первое<br />приключение сегодня</h2>
        <p className="text-muted-foreground mb-8">Выбери квест и войди в игру прямо сейчас.</p>
        <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2 text-base" onClick={onCatalog}>
          <Compass className="w-5 h-5" /> Выбрать квест
        </Button>
      </div>
    </section>
  );
}

// ─── Главная страница ────────────────────────────────────────────────────────

export default function HomePage() {
  const [, navigate] = useLocation();

  const { data: quests = [], isLoading } = useQuery<Quest[]>({
    queryKey: ["/api/quests"],
  });

  const featured = quests.slice(0, 4);
  const hasQuests = isLoading || featured.length > 0;

  return (
    <PageWrapper>
      <HeroSection onCatalog={() => navigate("/catalog")} onRegister={() => navigate("/register")} />

      <FeaturesSection />

      {/* Популярные квесты */}
      {hasQuests && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <SectionHeader
              label="Каталог"
              title={<>Квесты, которые хочется<br />открыть прямо сейчас</>}
              allHref="/catalog"
              allLabel="Все квесты"
            />
            <QuestGrid quests={featured} isLoading={isLoading} skeletonCount={4} />
          </div>
        </section>
      )}

      {/* Пустое состояние — нет квестов */}
      {!isLoading && quests.length === 0 && (
        <EmptyState
          icon="🗺️"
          title="Квесты скоро появятся"
          description="Стань первым создателем и опубликуй свой квест на платформе."
          actionLabel="Создать квест"
          onAction={() => navigate("/register")}
        />
      )}

      <HowItWorksSection />
      <CtaSection onCatalog={() => navigate("/catalog")} />
      <Footer />
    </PageWrapper>
  );
}
