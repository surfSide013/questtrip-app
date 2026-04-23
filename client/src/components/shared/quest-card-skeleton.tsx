import { Skeleton } from "@/components/ui/skeleton";

interface QuestCardSkeletonProps {
  count?: number;
}

/**
 * QuestCardSkeleton — заглушка-скелетон во время загрузки квестов.
 * Использование:
 *   <QuestCardSkeleton count={4} />
 */
export default function QuestCardSkeleton({ count = 4 }: QuestCardSkeletonProps) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
          <Skeleton className="h-28" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </>
  );
}
