import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server'
import { createClient } from '@/lib/supabase/server'
import { Buffer } from 'buffer'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { action, data } = await request.json()

  if (action === 'register-options') {
    const { email } = data

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    let userId: string
    if (existingUser) {
      userId = existingUser.id
    } else {
      // Create new user profile
      const newId = crypto.randomUUID()
      await supabase.from('profiles').insert({
        id: newId,
        email,
        full_name: null,
      })
      userId = newId
    }

    const options = generateRegistrationOptions({
      rpID: process.env.NEXT_PUBLIC_PASSKEY_RP_ID || 'localhost',
      rpName: 'Chores',
      userID: new Uint8Array(Buffer.from(userId)),
      userName: email,
      userDisplayName: email,
    })

    // Store challenge in session/DB
    await supabase
      .from('webauthn_challenges')
      .upsert({
        user_id: userId,
        challenge: options.challenge,
        type: 'registration',
      })

    return NextResponse.json(options)
  }

  if (action === 'register-verify') {
    const { credential, email } = data

    // Get user
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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
        const credentialIdBase64 = Buffer.from(credential.id).toString('base64')
        await supabase.from('webauthn_credentials').insert({
          user_id: user.id,
          credential_id: credentialIdBase64,
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
