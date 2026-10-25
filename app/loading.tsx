export default function Loading() {
  return (
    <div className="container-page py-6" aria-busy="true" aria-label="Loading">
      <div className="h-3 w-40 rounded shimmer" />
      <div className="mt-4 h-10 w-2/3 max-w-md rounded-lg shimmer" />
      <div className="mt-3 h-3 w-full max-w-lg rounded shimmer" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="card h-40 p-4">
            <div className="h-4 w-1/3 rounded shimmer" />
            <div className="mt-4 h-5 w-3/4 rounded shimmer" />
            <div className="mt-3 h-3 w-1/2 rounded shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
