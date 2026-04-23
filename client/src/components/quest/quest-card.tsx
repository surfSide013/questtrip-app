import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, MapPin } from "lucide-react";
import type { Quest } from "@shared/schema";

const formatGradients: Record<string, string> = {
  walking: "quest-gradient-blue",
  detective: "quest-gradient-purple",
  historical: "quest-gradient-orange",
  family: "quest-gradient-green",
};

const formatLabels: Record<string, string> = {
  walking: "Прогулочный",
  detective: "Детективный",
  historical: "Исторический",
  family: "Семейный",
};

interface QuestCardProps {
  quest: Quest;
  showStatus?: boolean;
}

export default function QuestCard({ quest, showStatus }: QuestCardProps) {
  const gradient = formatGradients[quest.format] || "quest-gradient-default";
  const formatLabel = formatLabels[quest.format] || quest.format;

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    published: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  const statusLabels: Record<string, string> = {
    draft: "Черновик", pending: "На проверке", published: "Опубликован", rejected: "Отклонён"
  };

  return (
    <Link href={`/quest/${quest.id}`}>
      <div
        className="group bg-card border border-border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30"
        data-testid={`card-quest-${quest.id}`}
      >
        {/* Cover / gradient header */}
        <div className={`h-28 ${gradient} relative flex items-start justify-between p-3`}>
          {quest.city && (
            <div className="flex items-center gap-1 text-white/80 text-xs font-semibold uppercase tracking-wide">
              <MapPin className="w-3 h-3" />
              {quest.city}
            </div>
          )}
          <Badge variant="outline" className="text-white/90 border-white/20 bg-white/10 text-xs backdrop-blur-sm">
            {formatLabel}
          </Badge>
          {showStatus && (
            <Badge variant="outline" className={`absolute bottom-2 left-3 text-[10px] ${statusColors[quest.status]}`}>
              {statusLabels[quest.status]}
            </Badge>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {quest.title}
          </h3>
          <p className="text-muted-foreground text-xs line-clamp-2 mb-3">{quest.description}</p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{quest.durationMin} мин</span>
            {quest.rating > 0 && (
              <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{quest.rating.toFixed(1)}</span>
            )}
            {quest.completions > 0 && (
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{quest.completions}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">
              {quest.price === 0 ? "Бесплатно" : `${quest.price} ₽`}
            </span>
            <span className="text-xs text-primary font-medium group-hover:underline">Подробнее →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
