import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    const { priceId } = await request.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }

    if (!priceId) {
      throw new Error('Price ID is required');
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/canceled`,
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error('Error in create-checkout-session:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}