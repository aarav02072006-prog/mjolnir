export function ProductSkeleton() {
  return (
    <div className="group relative flex flex-col bg-transparent animate-pulse">
      {/* Arched image skeleton */}
      <div className="h-72 md:h-80 bg-[#1a1a1a] rounded-t-[100px] rounded-b-xl mx-2" />
      {/* Content skeleton */}
      <div className="flex flex-col p-4 text-center mt-2 gap-2">
        <div className="h-3 bg-[#1a1a1a] rounded-full w-16 mx-auto" />
        <div className="h-4 bg-[#1a1a1a] rounded-full w-3/4 mx-auto" />
        <div className="h-4 bg-[#1a1a1a] rounded-full w-1/2 mx-auto" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}
