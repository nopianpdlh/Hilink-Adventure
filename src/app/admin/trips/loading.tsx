// src/app/admin/trips/loading.tsx
import TripCardSkeleton from '@/components/TripCardSkeleton'
import { Plus } from 'lucide-react'

export default function Loading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-36 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <TripCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
