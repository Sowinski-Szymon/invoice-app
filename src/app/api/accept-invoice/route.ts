import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// In-memory storage for demo purposes. In production, use a database.
const pendingInvoices: Record<string, unknown>[] = [];

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, invoiceData } = await request.json();

    if (!invoiceId || !invoiceData) {
      return NextResponse.json({ error: 'Invoice ID and data required' }, { status: 400 });
    }

    // Find and update the invoice status
    const invoiceIndex = pendingInvoices.findIndex(inv => inv.id === invoiceId);
    if (invoiceIndex === -1) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Update invoice with edited data
    pendingInvoices[invoiceIndex].data = invoiceData;
    pendingInvoices[invoiceIndex].status = 'accepted';

    // Send to Fakturownia API
    const FAKTUROWNIA_API_KEY = process.env.FAKTUROWNIA_API_KEY;
    const FAKTUROWNIA_API_URL = process.env.FAKTUROWNIA_API_URL || 'https://your-subdomain.fakturownia.pl/api/v2';

    if (!FAKTUROWNIA_API_KEY) {
      return NextResponse.json({ error: 'Fakturownia API key not configured' }, { status: 500 });
    }

    try {
      const response = await axios.post(
        `${FAKTUROWNIA_API_URL}/invoices.json`,
        invoiceData,
        {
          headers: {
            'Authorization': `Token token=${FAKTUROWNIA_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Invoice sent to Fakturownia:', response.data);

      // TODO: Notify HubSpot about the invoice creation
      // This would require HubSpot API integration

      return NextResponse.json({
        success: true,
        fakturowniaResponse: response.data,
        message: 'Invoice accepted and sent to Fakturownia'
      });
    } catch (fakturowniaError) {
      console.error('Fakturownia API error:', (fakturowniaError as { response?: { data?: unknown } }).response?.data);
      return NextResponse.json({
        error: 'Failed to send to Fakturownia',
        details: (fakturowniaError as { response?: { data?: unknown } }).response?.data
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Accept invoice error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}