'use client';

import { useState } from 'react';


export default function CancelAppointmentModal({ }) {
    const [showModal, setShowModal] = useState(true);
    const [specialty, setSpecialty] = useState("Heart");
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] relative">
        {/* Close Button */}
        <button 
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
          onClick={() => setShowModal(true)}
        >×</button>
        
        <h2 className="text-lg font-bold">You are about to cancel your appointment</h2>
        <p className="text-sm text-gray-600 mt-2">
          Note: if this is less than 24 hrs before appointment, you will be charged $50 for cancellation.
        </p>
        
        <div className="mt-4 flex justify-end space-x-2">
          <button 
            className="px-4 py-2 border rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200"
            onClick={() => setShowModal(false)}
          >Return</button>
          <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">Confirm</button>
        </div>
      </div>
    </div>
  );
}
