import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";

import PageWrapper from "@/components/shared/page-wrapper";
import QuestGrid from "@/components/shared/quest-grid";
import EmptyState from "@/components/shared/empty-state";
import type { Quest } from "@shared/schema";

// ─── Константы фильтров ──────────────────────────────────────────────────────

const CITIES = ["Все города", "Москва", "Санкт-Петербург", "Казань", "Екатеринбург", "Новосибирск", "Тверь"];
const FORMATS = [
  { value: "all",        label: "Все форматы" },
  { value: "walking",    label: "Прогулочный" },
  { value: "detective",  label: "Детективный" },
  { value: "historical", label: "Исторический" },
  { value: "family",     label: "Семейный" },
];

// ─── Хук фильтрации ──────────────────────────────────────────────────────────

function useQuestFilters(quests: Quest[]) {
  const [search, setSearch] = useState("");
  const [city, setCity]     = useState("all");
  const [format, setFormat] = useState("all");

  const filtered = quests.filter(q => {
    const matchSearch = !search ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase());
    const matchCity   = city   === "all" || q.city   === city;
    const matchFormat = format === "all" || q.format === format;
    return matchSearch && matchCity && matchFormat;
  });

  const hasFilters = Boolean(search) || city !== "all" || format !== "all";
  const clear = () => { setSearch(""); setCity("all"); setFormat("all"); };

  return { search, setSearch, city, setCity, format, setFormat, filtered, hasFilters, clear };
}

// ─── Компонент панели фильтров ───────────────────────────────────────────────

interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  city: string;
  onCity: (v: string) => void;
  format: string;
  onFormat: (v: string) => void;
  hasFilters: boolean;
  onClear: () => void;
}

function FilterBar({ search, onSearch, city, onCity, format, onFormat, hasFilters, onClear }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск квеста..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="pl-9 bg-card border-border"
          data-testid="input-search"
        />
      </div>
      <Select value={city} onValueChange={onCity}>
        <SelectTrigger className="w-full sm:w-44 bg-card border-border" data-testid="select-city">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CITIES.map(c => (
            <SelectItem key={c} value={c === "Все города" ? "all" : c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={format} onValueChange={onFormat}>
        <SelectTrigger className="w-full sm:w-44 bg-card border-border" data-testid="select-format">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FORMATS.map(f => (
            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="icon" onClick={onClear} className="shrink-0" data-testid="button-clear-filters">
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

// ─── Страница каталога ───────────────────────────────────────────────────────

export default function CatalogPage() {
  const { data: quests = [], isLoading } = useQuery<Quest[]>({
    queryKey: ["/api/quests"],
  });

  const { search, setSearch, city, setCity, format, setFormat, filtered, hasFilters, clear } = useQuestFilters(quests);

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Заголовок */}
        <div className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Каталог</div>
          <h1 className="text-3xl font-bold mb-1">Все квесты</h1>
          <p className="text-muted-foreground">Найди своё приключение</p>
        </div>

        {/* Фильтры */}
        <FilterBar
          search={search} onSearch={setSearch}
          city={city}     onCity={setCity}
          format={format} onFormat={setFormat}
          hasFilters={hasFilters} onClear={clear}
        />

        {/* Результаты */}
        {isLoading ? (
          <QuestGrid quests={[]} isLoading skeletonCount={8} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Ничего не найдено"
            description={hasFilters ? "Попробуйте изменить фильтры" : "Квесты ещё не добавлены"}
            actionLabel={hasFilters ? "Сбросить фильтры" : undefined}
            onAction={hasFilters ? clear : undefined}
          />
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              Найдено: <span className="font-medium text-foreground">{filtered.length}</span> квестов
            </div>
            <QuestGrid quests={filtered} />
          </>
        )}
      </div>
    </PageWrapper>
  );
}
