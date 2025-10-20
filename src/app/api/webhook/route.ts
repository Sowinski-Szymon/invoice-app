import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo purposes. In production, use a database.
const pendingInvoices: Record<string, unknown>[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate that it's a HubSpot webhook payload
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Store the invoice data
    const invoiceId = Date.now().toString(); // Simple ID generation
    const invoiceData = {
      id: invoiceId,
      data: body,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    pendingInvoices.push(invoiceData);

    console.log('Received invoice from HubSpot:', invoiceData);

    return NextResponse.json({
      success: true,
      invoiceId,
      message: 'Invoice received and stored for review'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  // For testing purposes, return pending invoices
  // Note: In production, this should require authentication
  return NextResponse.json({ pendingInvoices });
}