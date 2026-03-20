import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/jwt';

export const runtime = 'edge';

type D1DB = {
  prepare: (q: string) => {
    bind: (...args: unknown[]) => {
      run: () => Promise<unknown>;
      first: () => Promise<Record<string, unknown> | null>;
    };
  };
};

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) {
      return NextResponse.redirect('https://pro.genomic.cc/login?error=no_code');
    }

    const env = process.env as Record<string, unknown>;
    const clientId = env.KAKAO_REST_API_KEY as string;
    const clientSecret = env.KAKAO_CLIENT_SECRET as string;
    const redirectUri = 'https://pro.genomic.cc/api/auth/kakao/callback';

    if (!clientId) {
      return NextResponse.redirect('https://pro.genomic.cc/login?error=config');
    }

    // 1. code → access_token 교환
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code,
    });
    if (clientSecret) {
      tokenParams.set('client_secret', clientSecret);
    }

    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });

    if (!tokenRes.ok) {
      console.error('Kakao token error:', await tokenRes.text());
      return NextResponse.redirect('https://pro.genomic.cc/login?error=token');
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. access_token → 사용자 정보 조회
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      console.error('Kakao user info error:', await userRes.text());
      return NextResponse.redirect('https://pro.genomic.cc/login?error=user_info');
    }

    const userData = await userRes.json();
    const kakaoId = String(userData.id);
    const nickname = userData.properties?.nickname || '';

    // 3. D1에서 kakao_id로 사용자 조회/생성
    const db = env.DB as D1DB | undefined;
    if (!db) {
      return NextResponse.redirect('https://pro.genomic.cc/login?error=db');
    }

    let userId: string;
    let isNew = false;

    const existing = await db.prepare(
      'SELECT id FROM users WHERE kakao_id = ?'
    ).bind(kakaoId).first();

    if (existing) {
      userId = existing.id as string;
    } else {
      userId = `kakao-${kakaoId}`;
      await db.prepare(
        `INSERT INTO users (id, kakao_id, nickname, name, plan) VALUES (?, ?, ?, ?, 'free')`
      ).bind(userId, kakaoId, nickname, nickname).run();
      isNew = true;
    }

    // 4. JWT 발급
    const jwt = await signToken(userId);

    // 5. 프론트로 리다이렉트
    const dest = isNew ? 'settings' : 'calc';
    return NextResponse.redirect(
      `https://pro.genomic.cc/auth/callback?token=${jwt}&userId=${encodeURIComponent(userId)}&dest=${dest}`
    );
  } catch (err) {
    console.error('Kakao callback error:', err);
    return NextResponse.redirect('https://pro.genomic.cc/login?error=server');
  }
}
