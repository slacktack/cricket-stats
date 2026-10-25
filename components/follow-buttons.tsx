"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useToast } from "@/components/providers/toast-provider";
import { cn } from "@/lib/utils";

function useFollowAction() {
  const favorites = useFavorites();
  const { toast } = useToast();
  return { favorites, toast };
}

const BASE =
  "mono inline-flex h-9 items-center gap-2 border px-3 text-[9px] font-semibold uppercase tracking-[0.12em] transition-colors disabled:opacity-50";

export function FollowTeamButton({
  team,
  className,
}: {
  team: { id: number; name: string; shortName: string };
  className?: string;
}) {
  const { favorites, toast } = useFollowAction();
  const followed = favorites.isTeamFollowed(team.id);

  return (
    <button
      type="button"
      disabled={!favorites.hydrated}
      aria-pressed={followed}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        favorites.toggleTeam(team.id);
        toast(
          followed ? `Unfollowed ${team.shortName}` : `Following ${team.shortName}`
        );
      }}
      className={cn(
        BASE,
        followed
          ? "border-accent bg-accent text-accent-ink"
          : "border-line-strong text-ink hover:bg-surface2",
        className
      )}
    >
      <Heart className={cn("h-3.5 w-3.5", followed && "fill-current")} />
      {followed ? "Following" : "Follow"}
    </button>
  );
}

export function FollowSeriesButton({
  series,
  className,
}: {
  series: { id: number; name: string };
  className?: string;
}) {
  const { favorites, toast } = useFollowAction();
  const followed = favorites.isSeriesFollowed(series.id);

  return (
    <button
      type="button"
      disabled={!favorites.hydrated}
      aria-pressed={followed}
      onClick={() => {
        favorites.toggleSeries(series.id);
        toast(followed ? "Series removed from Following" : "Series added to Following");
      }}
      className={cn(
        BASE,
        followed
          ? "border-accent bg-accent text-accent-ink"
          : "border-line-strong text-ink hover:bg-surface2",
        className
      )}
    >
      <Heart className={cn("h-3.5 w-3.5", followed && "fill-current")} />
      {followed ? "Following" : "Follow series"}
    </button>
  );
}

export function FollowTeamIcon({
  team,
  className,
}: {
  team: { id: number; name: string; shortName: string };
  className?: string;
}) {
  const { favorites, toast } = useFollowAction();
  const followed = favorites.isTeamFollowed(team.id);

  return (
    <button
      type="button"
      disabled={!favorites.hydrated}
      aria-pressed={followed}
      aria-label={followed ? `Unfollow ${team.name}` : `Follow ${team.name}`}
      title={followed ? `Unfollow ${team.name}` : `Follow ${team.name}`}
      onClick={() => {
        favorites.toggleTeam(team.id);
        toast(followed ? `Unfollowed ${team.shortName}` : `Following ${team.shortName}`);
      }}
      className={cn(
        "grid h-8 w-8 place-items-center border transition-colors disabled:opacity-50",
        followed
          ? "border-accent bg-accent text-accent-ink"
          : "border-line text-faint hover:border-line-strong hover:text-ink",
        className
      )}
    >
      <Heart className={cn("h-3.5 w-3.5", followed && "fill-current")} />
    </button>
  );
}
