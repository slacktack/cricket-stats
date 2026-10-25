import { getTeamColor, playerImageUrl, teamImageUrl } from "@/lib/colors";
import { cn, getInitials, hexToRgba } from "@/lib/utils";

type TeamLike = {
  name: string;
  shortName?: string;
  imageId?: number;
};

export function TeamBadge({
  team,
  size = 40,
  className,
}: {
  team: TeamLike;
  size?: number;
  className?: string;
}) {
  const color = getTeamColor(team.shortName || team.name, team.imageId);
  const width = Math.round(size * 1.45);

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-surface2",
        className
      )}
      style={{ width, height: size }}
    >
      {team.imageId ? (
        <img
          src={teamImageUrl(team.imageId, "100x100")}
          alt=""
          width={width}
          height={size}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className="grid h-full w-full place-items-center text-center font-bold"
          style={{
            fontSize: Math.max(9, size * 0.3),
            color,
            backgroundColor: hexToRgba(color, 0.12),
          }}
        >
          {getInitials(team.shortName || team.name)}
        </span>
      )}
    </span>
  );
}

export function PlayerAvatar({
  player,
  size = 40,
  className,
}: {
  player: { id: number; name: string; faceImageId?: number };
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-surface2",
        className
      )}
      style={{ width: size, height: size }}
    >
      {player.faceImageId ? (
        <img
          src={playerImageUrl(player.faceImageId, "100x100")}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <span
          className="grid h-full w-full place-items-center text-sm font-bold text-faint"
          style={{ fontSize: Math.max(10, size * 0.3) }}
        >
          {getInitials(player.name)}
        </span>
      )}
    </span>
  );
}
