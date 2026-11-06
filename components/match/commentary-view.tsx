import type { CommentaryBall, MatchDetail } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

/* Klein for boundaries, coral for a wicket, hairline for everything else. No pastels. */
function badgeClass(ball: CommentaryBall): string {
  const base =
    "grid h-7 min-w-7 shrink-0 place-items-center border px-1 text-[11px] font-bold leading-none tabular-nums ";
  if (ball.badge === "W") return `${base}border-wkt bg-wkt text-white`;
  if (ball.badge === "4" || ball.badge === "6") return `${base}border-slab bg-slab text-white`;
  if (ball.badge === "wd" || ball.badge === "nb") return `${base}border-accent/50 text-accent`;
  return `${base}border-line text-muted`;
}

export function CommentaryView({ detail }: { detail: MatchDetail }) {
  const commentary = detail.commentary;
  if (!commentary.available || (commentary.overs.length === 0 && commentary.talk.length === 0)) {
    return (
      <EmptyState
        title="Commentary is not available"
        description={
          detail.summary.state === "upcoming"
            ? "Ball-by-ball commentary starts when play begins."
            : "The live commentary feed is unavailable for this match right now."
        }
        actionHref={`/match/${detail.summary.id}?tab=scorecard`}
        actionLabel="View scorecard"
        className="mt-4"
      />
    );
  }

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div data-rv className="space-y-4">
        {commentary.overs.map((over, overIndex) => (
          <section key={`${over.over}-${overIndex}`} className="blk">
            <div className="band">
              <h3>Over {String(over.over).padStart(2, "0")}</h3>
              <span className="tnum">
                {over.score ? `${over.score} · ` : ""}
                {over.runs !== undefined ? `${over.runs} runs` : ""}
              </span>
            </div>
            <div className="px-4 py-1">
              {over.balls.map((ball, ballIndex) => (
                <div
                  key={`${ball.id}-${ballIndex}`}
                  className="flex gap-3 border-t border-line/70 py-2.5 first:border-0"
                >
                  <span className={badgeClass(ball)}>{ball.badge ?? ball.ballMetric ?? "•"}</span>
                  <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-muted">
                    {ball.text}
                    {ball.event.length > 0 ? (
                      <span className="dnote block">{ball.event.join(" · ")}</span>
                    ) : null}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
        <p className="text-[11px] text-faint" suppressHydrationWarning>
          Commentary updated {timeAgo(commentary.updatedAt)}.
        </p>
      </div>

      <aside className="space-y-4">
        <section className="blk">
          <div className="band">
            <h3>Match talk</h3>
            <span>{commentary.talk.length}</span>
          </div>
          {commentary.talk.length > 0 ? (
            <p className="px-4 py-1 text-[12px] leading-relaxed text-muted">
              {commentary.talk.map((item, itemIndex) => (
                <span
                  key={`${item.id}-${itemIndex}`}
                  className="block border-t border-line/70 py-2.5 first:border-0"
                >
                  {item.text}
                </span>
              ))}
            </p>
          ) : (
            <p className="px-4 py-3 text-[12px] text-faint">No match talk yet.</p>
          )}
        </section>
        {detail.live?.lastWicket ? (
          <section className="blk">
            <div className="band">
              <h3>Last wicket</h3>
            </div>
            <p className="px-4 py-3 text-[12px] leading-relaxed text-muted">{detail.live.lastWicket}</p>
          </section>
        ) : null}
      </aside>
    </div>
  );
}
