import { NextResponse }
from 'next/server'

import type {
  NextRequest,
} from 'next/server'

export function proxy(
  request: NextRequest
) {

  // TOKEN
  const token =
    request.cookies.get(
      'sb-access-token'
    )

  // LOGIN PAGE
  const isLoginPage =
    request.nextUrl.pathname ===
    '/login'

  // NOT LOGGED IN
  if (
    !token &&
    !isLoginPage
  ) {

    return NextResponse.redirect(
      new URL(
        '/login',
        request.url
      )
    )
  }

  // ALREADY LOGGED IN
  if (
    token &&
    isLoginPage
  ) {

    return NextResponse.redirect(
      new URL(
        '/dashboard',
        request.url
      )
    )
  }

  return NextResponse.next()
}

export const config = {

  matcher: [

    '/',
    '/dashboard/:path*',
    '/activities/:path*',
    '/assignments/:path*',
    '/employees/:path*',
    '/notifications/:path*',
    '/operations-map/:path*',

  ],
}