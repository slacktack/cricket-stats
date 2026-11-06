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
        "badge relative grid shrink-0 place-items-center overflow-hidden border border-line",
        className
      )}
      style={{
        width: size,
        height: size,
        background: logo ? "#FFFFFF" : color,
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
            flag ? "scale-[1.3] object-cover" : "object-contain p-[10%]"
          )}
        />
      ) : (
        <span
          className="text-[10px] font-extrabold uppercase leading-none tracking-[-0.03em]"
          style={{
            fontSize: Math.max(8, Math.round(size * scale)),
            color: readableOn(color),
          }}
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
        "avatar relative grid shrink-0 place-items-center overflow-hidden border border-line bg-surface2",
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
          className="grid h-full w-full place-items-center font-bold text-faint"
          style={{ fontSize: Math.max(10, size * 0.28) }}
        >
          {getInitials(player.name)}
        </span>
      )}
    </span>
  );
}
