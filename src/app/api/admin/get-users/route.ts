import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client using service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // This bypasses RLS
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET() {
  try {
    // Fetch users using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: `Gagal memuat data user: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      users: data || []
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}