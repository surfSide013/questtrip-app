import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  /** Эмодзи или иконка */
  icon?: string;
  title: string;
  description?: string;
  /** Текст кнопки действия */
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * EmptyState — экран пустого состояния (нет результатов, нет данных).
 * Использование:
 *   <EmptyState
 *     icon="🔍"
 *     title="Ничего не найдено"
 *     description="Попробуйте изменить фильтры"
 *     actionLabel="Сбросить"
 *     onAction={clearFilters}
 *   />
 */
export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="text-center py-20">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
