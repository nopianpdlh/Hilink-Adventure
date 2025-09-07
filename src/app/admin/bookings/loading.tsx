// src/app/admin/bookings/loading.tsx

export default function Loading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-14 animate-pulse"></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </th>
                <th className="px-3 py-3.5 text-left">
                  <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                </th>
                <th className="px-3 py-3.5 text-left">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </th>
                <th className="px-3 py-3.5 text-left">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </th>
                <th className="px-3 py-3.5 text-left">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </th>
                <th className="px-3 py-3.5 text-left">
                  <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                </th>
                <th className="relative py-3.5 pl-3 pr-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {[...Array(8)].map((_, i) => (
                <tr key={i}>
                  <td className="py-4 pl-4 pr-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse mr-3"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </td>
                  <td className="relative py-4 pl-3 pr-4 text-right">
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse ml-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
