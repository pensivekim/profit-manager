import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const clientId = process.env.KAKAO_REST_API_KEY;
  if (!clientId) {
    const url = new URL('/login?error=config', req.url);
    return NextResponse.redirect(url);
  }

  const redirectUri = new URL('/api/auth/kakao/callback', req.url).toString();
  const url = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;

  return NextResponse.redirect(url);
}
