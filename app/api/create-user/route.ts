import { NextResponse }
from 'next/server'

import {
  createClient,
} from '@supabase/supabase-js'

const supabaseAdmin =
  createClient(

    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  )

export async function POST(
  request: Request
) {

  try {

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

    if (
      authError ||
      !authData.user
    ) {

      return NextResponse
        .json({

          error:
            authError?.message,

        }, {

          status: 400,

        })
    }

    // INSERT USER RECORD
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

    if (insertError) {

      return NextResponse
        .json({

          error:
            insertError.message,

        }, {

          status: 400,

        })
    }

    return NextResponse
      .json({

        success: true,

        temporaryPassword:
          tempPassword,

      })

  } catch (error: any) {

    return NextResponse
      .json({

        error:
          error.message,

      }, {

        status: 500,

      })
  }
}