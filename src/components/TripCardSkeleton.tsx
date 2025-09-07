// src/components/TripCardSkeleton.tsx
export default function TripCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gray-200"></div>
      
      {/* Content skeleton */}
      <div className="p-4">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        
        {/* Description */}
        <div className="h-4 bg-gray-200 rounded mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
        
        {/* Trip info */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        
        {/* Price */}
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <div className="flex-1 h-9 bg-gray-200 rounded-lg"></div>
          <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}
