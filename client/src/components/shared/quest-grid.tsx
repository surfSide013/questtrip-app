import QuestCard from "@/components/shared/quest-card";
import QuestCardSkeleton from "@/components/shared/quest-card-skeleton";
import type { Quest } from "@shared/schema";

interface QuestGridProps {
  quests: Quest[];
  isLoading?: boolean;
  skeletonCount?: number;
  columns?: "2" | "3" | "4";
}

const columnClasses: Record<string, string> = {
  "2": "grid-cols-1 sm:grid-cols-2",
  "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * QuestGrid — адаптивная сетка карточек квестов.
 * Автоматически показывает скелетоны во время загрузки.
 *
 * Использование:
 *   <QuestGrid quests={quests} isLoading={isLoading} />
 *   <QuestGrid quests={quests} columns="3" skeletonCount={6} />
 */
export default function QuestGrid({
  quests,
  isLoading = false,
  skeletonCount = 4,
  columns = "4",
}: QuestGridProps) {
  const gridClass = `grid ${columnClasses[columns]} gap-4`;

  if (isLoading) {
    return (
      <div className={gridClass}>
        <QuestCardSkeleton count={skeletonCount} />
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {quests.map(q => (
        <QuestCard key={q.id} quest={q} />
      ))}
    </div>
  );
}
