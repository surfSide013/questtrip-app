import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  /** Маленький лейбл над заголовком (например «Каталог») */
  label?: string;
  /** Главный заголовок секции */
  title: React.ReactNode;
  /** Ссылка на кнопку «Смотреть все» */
  allHref?: string;
  /** Текст кнопки */
  allLabel?: string;
}

/**
 * SectionHeader — заголовок секции с лейблом и опциональной кнопкой «Все →».
 * Использование:
 *   <SectionHeader label="Каталог" title="Популярные квесты" allHref="/catalog" />
 */
export default function SectionHeader({ label, title, allHref, allLabel = "Все" }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        {label && (
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            {label}
          </div>
        )}
        <h2 className="text-2xl font-bold leading-snug">{title}</h2>
      </div>
      {allHref && (
        <Link href={allHref}>
          <Button variant="ghost" className="gap-1 text-sm text-muted-foreground hover:text-foreground shrink-0">
            {allLabel} <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}
