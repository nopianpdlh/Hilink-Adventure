// src/app/test-db/page.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestDatabasePage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/seed-equipment')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to fetch data' })
    }
    setLoading(false)
  }

  const addData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/seed-equipment', { method: 'POST' })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to add data' })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Equipment Database Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={checkData} disabled={loading}>
              {loading ? 'Loading...' : 'Check Current Data'}
            </Button>
            <Button onClick={addData} disabled={loading} variant="outline">
              {loading ? 'Loading...' : 'Add Sample Equipment'}
            </Button>
          </div>

          {result && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}