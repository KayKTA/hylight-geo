import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('🔗 CALLBACK ROUTE HIT')

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  console.log('📝 Code:', code)
  console.log('🌍 Origin:', origin)

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('✅ Session exchange result:', data)
    console.log('❌ Session exchange error:', error)
  } else {
    console.log('⚠️ No code provided in callback')
  }

  return NextResponse.redirect(`${origin}/`)
}
