import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  const { orderId } = params;
  const apiUrl = process.env.BACKEND_API_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${apiUrl}/api/track/${orderId}`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}
