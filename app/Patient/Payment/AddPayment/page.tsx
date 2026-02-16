"use client";
import { useState } from "react";

export default function AddPayment() {
  const [cardNumber, setCardNumber] = useState("");
  const [cvc, setCvc] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  const handleConfirm = () => {
    console.log("Card Added:", { cardNumber, cvc, expirationDate });
    // Add logic to save the card details
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add New Card</h2>
          <button className="text-gray-500 hover:text-gray-700">✖</button>
        </div>
        <p className="text-gray-500 text-sm mb-4">Body text</p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Credit Card Number</label>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">CVC</label>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            value={cvc}
            onChange={(e) => setCvc(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
          />
        </div>

        <div className="flex justify-between">
          <button className="px-4 py-2 bg-gray-300 rounded-md">Return</button>
          <button 
            className="px-4 py-2 bg-black text-white rounded-md"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
