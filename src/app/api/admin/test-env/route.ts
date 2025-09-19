import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test environment variables availability
    const envTest = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serverSide: typeof window === 'undefined',
      nodeEnv: process.env.NODE_ENV
    }

    console.log('🔍 Environment test:', envTest)

    // Test simple Supabase connection
    if (envTest.serviceKey && envTest.supabaseUrl) {
      try {
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const adminClient = createAdminClient()
        
        // Test simple query
        const { data, error } = await adminClient
          .from('profiles')
          .select('count')
          .limit(1)
        
        return NextResponse.json({
          success: true,
          environment: envTest,
          supabaseTest: {
            connected: !error,
            error: error?.message || null
          },
          message: 'Admin environment is properly configured'
        })
      } catch (adminError: any) {
        return NextResponse.json({
          success: false,
          environment: envTest,
          supabaseTest: {
            connected: false,
            error: adminError.message
          },
          message: 'Admin client failed'
        })
      }
    }

    return NextResponse.json({
      success: false,
      environment: envTest,
      message: 'Missing required environment variables'
    })

  } catch (error: any) {
    console.error('❌ Environment test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Environment test failed'
    }, { status: 500 })
  }
}