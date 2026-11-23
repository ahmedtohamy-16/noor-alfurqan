const HadithSkeleton = () => {
  return (
    <div className="space-y-4 px-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur p-5 animate-pulse motion-reduce:animate-none"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-32 loading-placeholder rounded" />
            <div className="h-5 w-14 loading-placeholder rounded-full" />
          </div>
          <div className="space-y-2.5 mb-4">
            <div className="h-3.5 loading-placeholder rounded w-full" />
            <div className="h-3.5 loading-placeholder rounded w-[92%]" />
            <div className="h-3.5 loading-placeholder rounded w-[78%]" />
          </div>
          <div className="flex gap-3">
            <div className="h-8 w-20 loading-placeholder rounded-full" />
            <div className="h-8 w-20 loading-placeholder rounded-full" />
            <div className="h-8 w-20 loading-placeholder rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default HadithSkeleton;
