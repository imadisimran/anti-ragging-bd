import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    const token = await getToken({ req: request })
    const callBack = request.nextUrl.pathname
    if (!token) {
        return NextResponse.redirect(new URL(`/login?callbackUrl=${callBack}`, request.url))
    }
    return NextResponse.next()
}

export const config = {
    matcher: '/report/:path*',
}