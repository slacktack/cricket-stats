export default function Loading() {
  return (
    <div className="container-page py-6" aria-busy="true" aria-label="Loading">
      <div className="h-2.5 w-32 shimmer" />
      <div className="mt-4 h-10 w-2/3 max-w-md shimmer" />
      <div className="mt-3 h-2.5 w-full max-w-lg shimmer" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="blk">
            <div className="band">
              <div className="h-3 w-24 shimmer" />
            </div>
            <div className="px-4 py-4">
              <div className="h-5 w-3/4 shimmer" />
              <div className="mt-3 h-2.5 w-1/2 shimmer" />
              <div className="mt-6 h-2.5 w-2/3 shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
