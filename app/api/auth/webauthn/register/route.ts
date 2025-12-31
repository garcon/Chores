import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server'
import { isoBase64URL } from '@simplewebauthn/server/helpers/iso7z'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { action, data } = await request.json()

  if (action === 'register-options') {
    const options = generateRegistrationOptions({
      rpID: process.env.NEXT_PUBLIC_PASSKEY_RP_ID || 'localhost',
      rpName: 'Chores',
      userID: isoBase64URL.fromBuffer(Buffer.from(user.id)),
      userName: user.email || '',
      userDisplayName: user.user_metadata?.full_name || user.email || '',
    })

    // Store challenge in session/DB
    await supabase
      .from('webauthn_challenges')
      .upsert({
        user_id: user.id,
        challenge: options.challenge,
        type: 'registration',
      })

    return NextResponse.json(options)
  }

  if (action === 'register-verify') {
    const { credential, email } = data

    // Get stored challenge
    const { data: challenge } = await supabase
      .from('webauthn_challenges')
      .select('challenge')
      .eq('user_id', user.id)
      .eq('type', 'registration')
      .single()

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 400 }
      )
    }

    try {
      const verified = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: challenge.challenge,
        expectedOrigin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        expectedRPID: process.env.NEXT_PUBLIC_PASSKEY_RP_ID || 'localhost',
      })

      if (verified.verified) {
        // Store credential in DB
        await supabase.from('webauthn_credentials').insert({
          user_id: user.id,
          credential_id: isoBase64URL.toBuffer(credential.id).toString('base64'),
          public_key: JSON.stringify(credential.response.publicKeyAlgorithm),
          sign_count: credential.response.signCount || 0,
        })

        // Clear challenge
        await supabase
          .from('webauthn_challenges')
          .delete()
          .eq('user_id', user.id)

        return NextResponse.json({ success: true, email })
      }

      return NextResponse.json(
        { error: 'Registration verification failed' },
        { status: 400 }
      )
    } catch (err) {
      console.error('Registration error:', err)
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 400 }
      )
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
