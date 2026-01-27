interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

const Skeleton = ({ className = '', variant = 'rectangular' }: SkeletonProps) => {
  const baseClasses = 'bg-border animate-skeleton'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  )
}

export const WorkCardSkeleton = () => (
  <div className="card animate-fade-in">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" variant="text" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full mb-2" variant="text" />
    <Skeleton className="h-4 w-2/3 mb-4" variant="text" />
    <div className="flex justify-between mb-6">
      <div>
        <Skeleton className="h-3 w-12 mb-1" variant="text" />
        <Skeleton className="h-5 w-24" variant="text" />
      </div>
      <div>
        <Skeleton className="h-3 w-12 mb-1" variant="text" />
        <Skeleton className="h-5 w-24" variant="text" />
      </div>
    </div>
    <div className="border-t border-border pt-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16" variant="text" />
          <Skeleton className="h-4 w-16" variant="text" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  </div>
)

export const TimelineEntrySkeleton = () => (
  <div className="flex animate-fade-in">
    <div className="flex flex-col items-center mr-6">
      <Skeleton className="w-3 h-3" variant="circular" />
      <Skeleton className="w-0.5 h-24 mt-3 rounded" />
    </div>
    <div className="flex-1 pb-8">
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex gap-2 mb-2">
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-5 w-24" variant="text" />
            </div>
            <Skeleton className="h-6 w-48" variant="text" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
        <Skeleton className="h-4 w-full mb-2" variant="text" />
        <Skeleton className="h-4 w-2/3 mb-4" variant="text" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="aspect-video rounded-lg" />
          <Skeleton className="aspect-video rounded-lg" />
          <Skeleton className="aspect-video rounded-lg" />
        </div>
      </div>
    </div>
  </div>
)

export const DetailSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" variant="text" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-28 rounded" />
        <Skeleton className="h-10 w-24 rounded" />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="card">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-4 w-full mb-2" variant="text" />
          <Skeleton className="h-4 w-full mb-2" variant="text" />
          <Skeleton className="h-4 w-3/4 mb-6" variant="text" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-3 w-16 mb-1" variant="text" />
              <Skeleton className="h-5 w-32" variant="text" />
            </div>
            <div>
              <Skeleton className="h-3 w-16 mb-1" variant="text" />
              <Skeleton className="h-5 w-48" variant="text" />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="card">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-3 w-12 mb-1" variant="text" />
              <Skeleton className="h-5 w-32" variant="text" />
            </div>
            <div>
              <Skeleton className="h-3 w-12 mb-1" variant="text" />
              <Skeleton className="h-5 w-40" variant="text" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default Skeleton
