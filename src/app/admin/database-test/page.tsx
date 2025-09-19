'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DatabaseTestPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testQueries = async () => {
    setLoading(true)
    const supabase = createClient()
    const testResults: any = {}

    try {
      // Test 1: Basic bookings query
      console.log("Testing bookings table...")
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .limit(5)
      
      testResults.bookings = {
        data: bookings,
        error: bookingsError,
        count: bookings?.length || 0
      }

      // Test 2: Trips query
      console.log("Testing trips table...")
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .limit(5)
      
      testResults.trips = {
        data: trips,
        error: tripsError,
        count: trips?.length || 0
      }

      // Test 3: Equipment query
      console.log("Testing equipment table...")
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .limit(5)
      
      testResults.equipment = {
        data: equipment,
        error: equipmentError,
        count: equipment?.length || 0
      }

      // Test 4: Profiles query
      console.log("Testing profiles table...")
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5)
      
      testResults.profiles = {
        data: profiles,
        error: profilesError,
        count: profiles?.length || 0
      }

      // Test 5: User info
      const { data: user, error: userError } = await supabase.auth.getUser()
      testResults.currentUser = {
        data: user,
        error: userError
      }

      setResults(testResults)
    } catch (err) {
      console.error("Test queries failed:", err)
      testResults.generalError = err
      setResults(testResults)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testQueries} disabled={loading} className="mb-4">
            {loading ? 'Testing...' : 'Run Database Tests'}
          </Button>

          {results && (
            <div className="space-y-4">
              {Object.entries(results).map(([table, result]: [string, any]) => (
                <div key={table} className="p-4 border rounded">
                  <h3 className="font-semibold text-lg mb-2">{table}</h3>
                  
                  {result.error ? (
                    <div className="text-red-600 bg-red-50 p-3 rounded">
                      <p><strong>Error:</strong> {result.error.message}</p>
                      {result.error.details && <p><strong>Details:</strong> {result.error.details}</p>}
                      {result.error.hint && <p><strong>Hint:</strong> {result.error.hint}</p>}
                      {result.error.code && <p><strong>Code:</strong> {result.error.code}</p>}
                    </div>
                  ) : (
                    <div className="text-green-600 bg-green-50 p-3 rounded">
                      <p><strong>Success!</strong> Found {result.count} records</p>
                      {result.data && result.data.length > 0 && (
                        <pre className="mt-2 text-xs bg-white p-2 rounded max-h-40 overflow-auto">
                          {JSON.stringify(result.data[0], null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}