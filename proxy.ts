import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) return NextResponse.next();

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  // Fail closed if production credentials have not been configured.
  if (!username || !password) {
    return new NextResponse('Research Console is not configured.', { status: 503 });
  }

  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Basic ')) {
    try {
      const decoded = atob(authorization.slice(6));
      const separator = decoded.indexOf(':');
      const suppliedUser = decoded.slice(0, separator);
      const suppliedPassword = decoded.slice(separator + 1);
      if (separator > -1 && suppliedUser === username && suppliedPassword === password) {
        return NextResponse.next();
      }
    } catch {
      // Invalid authorization header falls through to the challenge below.
    }
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Visibility OS Research Console", charset="UTF-8"' },
  });
}

export const config = { matcher: ['/admin/:path*'] };
