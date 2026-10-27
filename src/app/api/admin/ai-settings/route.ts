import { NextResponse } from 'next/server'
import { requireApiUser } from '@/lib/server/auth'
import { decryptSecret, encryptSecret } from '@/lib/server/crypto'
import { createServiceClient } from '@/lib/server/supabase'

const columns = 'providers,language,gemini_enabled,gemini_model,nine_router_enabled,nine_router_url,nine_router_model,open_router_enabled,open_router_model,gemini_api_key_encrypted,nine_router_api_key_encrypted,open_router_api_key_encrypted'

export async function GET(request: Request) {
  if (!await requireApiUser(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { data, error } = await createServiceClient().from('ai_settings').select(columns).eq('id', 'default').single()
    if (error) throw error
    const { gemini_api_key_encrypted, nine_router_api_key_encrypted, open_router_api_key_encrypted, ...safe } = data
    return NextResponse.json({ ...safe, keys: { gemini: Boolean(gemini_api_key_encrypted), nineRouter: Boolean(nine_router_api_key_encrypted), openRouter: Boolean(open_router_api_key_encrypted) } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not load AI settings.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!await requireApiUser(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const providers = body.providers
    if (!Array.isArray(providers) || providers.some((provider) => !['Gemini', '9Router', 'OpenRouter'].includes(provider))) return NextResponse.json({ error: 'Invalid provider order.' }, { status: 400 })
    if (!['id', 'en'].includes(body.language)) return NextResponse.json({ error: 'Unsupported translation language.' }, { status: 400 })
    const supabase = createServiceClient()
    const { data: current, error: readError } = await supabase.from('ai_settings').select(columns).eq('id', 'default').single()
    if (readError) throw readError
    const secret = (value: unknown, oldValue: string | null) => typeof value === 'string' && value.trim() ? encryptSecret(value.trim()) : oldValue
    const payload = {
      id: 'default', providers, language: body.language,
      gemini_enabled: Boolean(body.gemini_enabled), gemini_model: String(body.gemini_model || '').slice(0, 120), gemini_api_key_encrypted: secret(body.gemini_api_key, current.gemini_api_key_encrypted),
      nine_router_enabled: Boolean(body.nine_router_enabled), nine_router_url: String(body.nine_router_url || '').slice(0, 500), nine_router_model: String(body.nine_router_model || '').slice(0, 120), nine_router_api_key_encrypted: secret(body.nine_router_api_key, current.nine_router_api_key_encrypted),
      open_router_enabled: Boolean(body.open_router_enabled), open_router_model: String(body.open_router_model || '').slice(0, 120), open_router_api_key_encrypted: secret(body.open_router_api_key, current.open_router_api_key_encrypted),
      updated_at: new Date().toISOString(),
    }
    if (payload.nine_router_enabled) {
      const endpoint = new URL(payload.nine_router_url)
      if (!['https:', 'http:'].includes(endpoint.protocol)) return NextResponse.json({ error: '9Router URL must use HTTP or HTTPS.' }, { status: 400 })
    }
    if (payload.gemini_enabled && !payload.gemini_api_key_encrypted || payload.nine_router_enabled && !payload.nine_router_api_key_encrypted || payload.open_router_enabled && !payload.open_router_api_key_encrypted) return NextResponse.json({ error: 'Enabled providers need API keys.' }, { status: 400 })
    const { error } = await supabase.from('ai_settings').upsert(payload)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save AI settings.' }, { status: 500 })
  }
}