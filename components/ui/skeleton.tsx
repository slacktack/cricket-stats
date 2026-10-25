import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer", className)} />;
}

export function MatchCardSkeleton() {
  return (
    <div className="border-b border-line py-5">
      <div className="flex items-start gap-4">
        <div className="w-14 space-y-2">
          <Skeleton className="h-2.5 w-8" />
          <Skeleton className="h-2 w-12" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="ml-auto h-4 w-12" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="ml-auto h-4 w-12" />
          </div>
          <Skeleton className="h-2.5 w-40" />
        </div>
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div>
      {[0, 1, 2, 3].map((index) => (
        <MatchCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container-page py-6 sm:py-8">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-4 h-14 w-2/3" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div className="flex gap-5 border-b border-line pb-3">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-3 w-16" />
            ))}
          </div>
          <FeedSkeleton />
        </div>
        <div className="hidden space-y-8 lg:block">
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-40 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-32 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
