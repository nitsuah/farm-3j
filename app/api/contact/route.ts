import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(2000),
});

export async function POST(request: NextRequest) {
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
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

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
