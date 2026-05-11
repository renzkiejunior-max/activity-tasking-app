import { Resend }
from 'resend'

const resend =
  new Resend(
    process.env
      .RESEND_API_KEY
  )

export async function POST(
  req: Request
) {

  try {

    // REQUEST BODY
    const body =
      await req.json()

    const {
      to,
      subject,
      html,
    } = body

    // SEND EMAIL
    const data =
      await resend.emails.send({

        from:
          'Operations System <onboarding@resend.dev>',

        to,

        subject,

        html,

      })

    return Response.json({
      success: true,
      data,
    })

  } catch (error: any) {

    console.error(
      'EMAIL ERROR:',
      error
    )

    return Response.json(
      {
        success: false,
        error:
          error.message,
      },
      {
        status: 500,
      }
    )
  }
}