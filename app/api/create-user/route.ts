import { NextResponse }
from 'next/server'

import {
  createClient,
} from '@supabase/supabase-js'

// ENV VARIABLES
const supabaseUrl =
  process.env
    .NEXT_PUBLIC_SUPABASE_URL

const serviceRoleKey =
  process.env
    .SUPABASE_SERVICE_ROLE_KEY

// VALIDATE ENV
if (
  !supabaseUrl ||
  !serviceRoleKey
) {

  throw new Error(
    'Missing Supabase environment variables'
  )
}

// ADMIN CLIENT
const supabaseAdmin =
  createClient(

    supabaseUrl,

    serviceRoleKey
  )

// CREATE USER API
export async function POST(
  request: Request
) {

  try {

    // BODY
    const body =
      await request.json()

    const {
      email,
      role,
      division,
    } = body

    // VALIDATION
    if (
      !email ||
      !role ||
      !division
    ) {

      return NextResponse
        .json({

          error:
            'Missing required fields',

        }, {

          status: 400,

        })
    }

    // TEMP PASSWORD
    const tempPassword =
      'PDRRMO123'

    // CREATE AUTH USER
    const {
      data: authData,
      error: authError,
    } = await supabaseAdmin

      .auth.admin

      .createUser({

        email,

        password:
          tempPassword,

        email_confirm:
          true,

      })

    // AUTH ERROR
    if (
      authError ||
      !authData.user
    ) {

      return NextResponse
        .json({

          error:
            authError?.message ||

            'Failed to create auth user',

        }, {

          status: 400,

        })
    }

    // INSERT USER TABLE RECORD
    const {
      error: insertError,
    } = await supabaseAdmin

      .from('users')

      .insert([{

        id:
          authData.user.id,

        email,

        roles:
          role,

        division,

        password_changed:
          false,

        password_change_count:
          0,

        is_active:
          true,

      }])

    // INSERT ERROR
    if (insertError) {

      return NextResponse
        .json({

          error:
            insertError.message,

        }, {

          status: 400,

        })
    }

    // SUCCESS
    return NextResponse
      .json({

        success: true,

        temporaryPassword:
          tempPassword,

      })

  } catch (error: unknown) {

    return NextResponse
      .json({

        error:

          error instanceof Error

            ? error.message

            : 'Unknown server error',

      }, {

        status: 500,

      })
  }
}