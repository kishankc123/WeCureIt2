'use client';

import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PaymentMethods() {
  const router = useRouter();
  const { data: session, status } = useSession();
  useEffect(() => {
    console.log('Session:', session?.user?.patientId);
  }, [session]);
  

  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    name: '',
    details: '',
    cvc: '',
    expiryMonth: '',
    expiryYear: ''
  });

  const [cards, setCards] = useState<any[]>([]); 

  useEffect(() => {
    const fetchCards = async () => {
      if (status !== "authenticated") return; // Wait until session is fully loaded

      const userId = session?.user?.patientId;
      if (!userId) {
        console.warn("Patient ID not found in session");
        return;
      }

      try {
        const res = await fetch(`/api/cards?userId=${userId}`);
        const data = await res.json();
        console.log("Cards fetched:", data);
        setCards(data);
      } catch (err) {
        console.error("Failed to fetch cards:", err);
      }
    };

    fetchCards();
  }, [session, status]);


  const fetchCards = async () => {
    const userId =  session?.user?.patientId;
  
    const res = await fetch(`/api/cards?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      setCards(data);
    }
  };
  

  useEffect(() => {
    fetchCards();
  }, []);

  const addCard = async () => {
    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: session?.user?.patientId,
        cardName: newCard.name,
        cardNumber: newCard.details,
        cvc: newCard.cvc,
        expiryMonth: parseInt(newCard.expiryMonth),
        expiryYear: parseInt('20' + newCard.expiryYear)
      }),
    });

    if (res.ok) {
      fetchCards();
      setIsModalOpen(false);
      setNewCard({ name: '', details: '', cvc: '', expiryMonth: '', expiryYear: '' });
    }
  };

  const deleteCard = async (id: string) => {
    const res = await fetch(`/api/cards?cardId=${id}`, { method: 'DELETE' });
  
    if (res.ok) {
      fetchCards();
    } else {
      console.error('Failed to delete card');
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto mt-10 text-black p-6 bg-gray-200 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Payment Methods</h2>

          {cards.map((card: any) => (
            <div key={card.cardId} className="bg-white p-4 rounded-md shadow mb-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{card.cardName}</h3>
                <p className="text-sm">**** **** **** {card.cardNumber.slice(-4)}</p>
                <p className="text-sm">Expires: {card.expiryMonth}/{card.expiryYear}</p>
              </div>
              <button onClick={() => deleteCard(card.cardId)} className="bg-black text-white px-3 py-1 rounded">
                Delete
              </button>
            </div>
          ))}

          <button onClick={() => setIsModalOpen(true)} className="bg-black text-white px-4 py-2 rounded-md mt-4">
            Add New Payment
          </button>
        </div>
      </main>

      <Footer />

      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-70" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
          <div className="bg-gray-200 p-6 text-black rounded-lg w-80">
            <h2 className="text-xl font-semibold mb-4">Add New Payment</h2>
            <div className="space-y-4">
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="Card Name"
                value={newCard.name}
                onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
              />
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="Card Number"
                value={newCard.details}
                onChange={(e) => setNewCard({ ...newCard, details: e.target.value })}
              />
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="CVC"
                value={newCard.cvc}
                onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value })}
              />
              <div className="flex space-x-4">
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Expiration Month (MM)"
                  value={newCard.expiryMonth}
                  onChange={(e) => setNewCard({ ...newCard, expiryMonth: e.target.value })}
                />
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Expiration Year (YY)"
                  value={newCard.expiryYear}
                  onChange={(e) => setNewCard({ ...newCard, expiryYear: e.target.value })}
                />
              </div>
              <div className="flex justify-between space-x-4 mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 text-black py-2 px-4 rounded-md w-full"
                >
                  Cancel
                </button>
                <button
                  onClick={addCard}
                  className="bg-black text-white py-2 px-4 rounded-md w-full"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
