import { NextRequest, NextResponse } from 'next/server';

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // NEXT_PUBLIC_ 없음 - 서버에서만 접근 가능

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const url = `${GITHUB_API_URL}/${path}`;
    
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    // 서버사이드에서만 접근 가능한 토큰
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    // README 요청인 경우 raw 포맷으로
    if (path.includes('/readme')) {
      headers['Accept'] = 'application/vnd.github.v3.raw';
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 403) {
        const remaining = response.headers.get('X-RateLimit-Remaining');
        if (remaining === '0') {
          return NextResponse.json(
            { error: 'GitHub API rate limit exceeded' },
            { status: 429 }
          );
        }
      }
      return NextResponse.json(
        { error: `GitHub API error: ${response.status}` },
        { status: response.status }
      );
    }

    // README는 텍스트로 반환
    if (path.includes('/readme')) {
      const text = await response.text();
      return NextResponse.json({ content: text });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('GitHub API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}