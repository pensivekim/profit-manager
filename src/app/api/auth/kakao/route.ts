import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const clientId = process.env.KAKAO_REST_API_KEY;
  if (!clientId) {
    return NextResponse.json({ error: 'Kakao not configured' }, { status: 500 });
  }

  const redirectUri = 'https://pro.genomic.cc/api/auth/kakao/callback';
  const url = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;

  return NextResponse.redirect(url);
}
