import {
  getTeamColor,
  hasRealLogo,
  nationalBase,
  playerImageUrl,
  readableOn,
  teamImageUrl,
} from "@/lib/colors";
import { cn, getInitials } from "@/lib/utils";

type TeamLike = {
  name: string;
  shortName?: string;
  imageId?: number;
};

function crestCode(team: TeamLike): string {
  const code = (team.shortName || getInitials(team.name)).toUpperCase();
  return code.length > 4 ? code.slice(0, 4) : code;
}

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
  const logo = hasRealLogo(team) && team.imageId;
  const flag = logo && !!nationalBase(team.shortName);
  const code = crestCode(team);
  const scale = code.length <= 2 ? 0.4 : code.length === 3 ? 0.32 : 0.26;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden",
        className,
        "rounded-full border-0 bg-transparent"
      )}
      style={{
        width: size,
        height: size,
        background: logo
          ? "#FFFFFF"
          : color,
        boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.08)",
      }}
    >
      {logo ? (
        <img
          src={teamImageUrl(team.imageId as number, "200x200")}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full",
            flag ? "scale-[1.3] object-cover" : "object-contain p-[12%]"
          )}
        />
      ) : (
        <span
          className="font-display font-bold leading-none tracking-[-0.02em]"
          style={{ fontSize: Math.max(8, Math.round(size * scale)), color: readableOn(color) }}
        >
          {code}
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
          src={playerImageUrl(player.faceImageId, "200x200")}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top"
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
