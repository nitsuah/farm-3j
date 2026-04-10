import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(2000),
});

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;
const WEBHOOK_TIMEOUT_MS = 10_000;

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// NOTE: In-memory rate limiting works per-process. In a multi-instance or
// serverless deployment, use a shared store (e.g., Redis/Vercel KV) instead.
const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    // Opportunistically clean up expired entries to avoid unbounded growth
    for (const [key, val] of rateLimitStore) {
      if (now - val.windowStart >= RATE_LIMIT_WINDOW_MS) {
        rateLimitStore.delete(key);
      }
    }
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  if (checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request payload.' }, { status: 400 });
  }

  try {
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid contact submission. Please check your name, email, and message.',
          details: parsed.error.issues.map((issue) => issue.message),
        },
        { status: 400 }
      );
    }

    const payload = {
      ...parsed.data,
      source: 'farm-3j-contact-form',
      submittedAt: new Date().toISOString(),
    };

    const webhookUrl = process.env.FARM_CONTACT_WEBHOOK_URL;

    if (webhookUrl) {
      let webhookResponse: Response;
      try {
        webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
        });
      } catch (err) {
        const isTimeout = err instanceof DOMException && err.name === 'TimeoutError';
        return NextResponse.json(
          {
            error: isTimeout
              ? 'Message delivery timed out. Please try again shortly.'
              : 'Message delivery failed. Please try again shortly.',
          },
          { status: isTimeout ? 504 : 502 }
        );
      }

      if (!webhookResponse.ok) {
        return NextResponse.json(
          { error: 'Message delivery failed. Please try again shortly.' },
          { status: 502 }
        );
      }

      return NextResponse.json({ success: true, delivery: 'webhook' }, { status: 200 });
    }

    console.warn('Contact submission received without webhook configured', {
      delivery: 'local-log',
      source: payload.source,
      submittedAt: payload.submittedAt,
    });

    return NextResponse.json({ success: true, delivery: 'local-log' }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
