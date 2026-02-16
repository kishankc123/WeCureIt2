import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = Number(searchParams.get('userId'))

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const cards = await prisma.card.findMany({
    where: { patientId: userId },
    select: {
      cardId: true,
      cardNumber: true,
      expiryMonth: true,
      expiryYear: true,
      cardName: true
    },
  })

  return NextResponse.json(cards)
}

export async function POST(req: Request) {
    const body = await req.json()
    const { user_id: patientId, cardNumber, cvc, expiryMonth, expiryYear, cardName } = body
  
  
    try {
      const card = await prisma.card.create({
        data: {
          cardName,
          cardNumber,
          cvc,
          expiryMonth,
          expiryYear,
          patientId, 
        },
      })
  
      return NextResponse.json(card, { status: 201 })
    } catch (error) {
      console.error(error)
      return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
    }
  }
  
  export async function DELETE(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const cardId = Number(searchParams.get('cardId'));
  
      if (!cardId || isNaN(cardId)) {
        return NextResponse.json({ error: 'Missing or invalid cardId' }, { status: 400 });
      }
  
      await prisma.card.delete({
        where: { cardId: cardId },
      });
  
      return NextResponse.json({ message: 'Card deleted successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error deleting card:', error);
      return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 });
    }
  }
  
