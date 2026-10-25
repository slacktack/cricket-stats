import type { CommentaryBall, MatchDetail } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

function badgeTone(ball: CommentaryBall): string {
  if (ball.badge === "W") return "bg-live text-white";
  if (ball.badge === "4" || ball.badge === "6") return "bg-accent text-accent-ink";
  if (ball.badge === "wd" || ball.badge === "nb") return "bg-warn/15 text-warn";
  return "bg-surface2 text-muted";
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
      <div className="space-y-3">
        {commentary.overs.map((over) => (
          <section key={over.over} className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface2/60 px-4 py-2.5">
              <h2 className="text-sm font-bold">Over {over.over}</h2>
              <div className="flex items-center gap-3 text-xs text-muted">
                {over.score ? <span className="font-semibold tabular-nums">{over.score}</span> : null}
                {over.runs !== undefined ? <span className="text-faint">{over.runs} runs</span> : null}
              </div>
            </div>
            <div className="divide-y divide-line/70">
              {over.balls.map((ball) => (
                <div key={ball.id} className="flex gap-3 px-4 py-3">
                  <span className={`mt-0.5 grid h-7 min-w-7 shrink-0 place-items-center rounded-md px-1 text-[11px] font-bold ${badgeTone(ball)}`}>
                    {ball.badge ?? ball.ballMetric ?? "•"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] leading-relaxed text-ink">{ball.text}</p>
                    {ball.event.length > 0 ? (
                      <p className="mt-1 text-[11px] text-faint">{ball.event.join(" · ")}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        <p className="text-xs text-faint">Commentary updated {timeAgo(commentary.updatedAt)}.</p>
      </div>

      <aside className="space-y-3">
        <section className="card p-4">
          <h2 className="text-sm font-bold">Match talk</h2>
          {commentary.talk.length > 0 ? (
            <div className="mt-3 space-y-3">
              {commentary.talk.map((item) => (
                <p key={item.id} className="border-l-2 border-line pl-3 text-xs leading-relaxed text-muted">
                  {item.text}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted">No match talk yet.</p>
          )}
        </section>
        {detail.live?.lastWicket ? (
          <section className="card p-4">
            <h2 className="text-sm font-bold">Last wicket</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted">{detail.live.lastWicket}</p>
          </section>
        ) : null}
      </aside>
    </div>
  );
}
