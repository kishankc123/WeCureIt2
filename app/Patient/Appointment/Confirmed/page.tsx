'use client';

import { Check, ChevronLeft, Heart, Pencil } from 'lucide-react';

export default function DoctorAppointment() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-6xl flex gap-6">
        {/* Back Arrow */}
        <div className="absolute top-6 left-6 text-black cursor-pointer">
          <ChevronLeft size={28} />
        </div>

        {/* Left Image Area */}
        <div className="relative w-1/2 bg-zinc-100 rounded-lg flex items-center justify-center">
          <Heart className="absolute top-4 left-4 text-white bg-black rounded-full p-1" />
          <div className="w-3/4 h-3/4 bg-gray-300 rounded-md flex items-center justify-center text-gray-500">
            Image Placeholder
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold text-zinc-900 underline decoration-purple-600">
            Doctor Name
          </h2>
          <p className="text-xl font-semibold text-zinc-800">Speciality</p>
          <p className="text-sm text-gray-500">Text</p>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-600">Date</label>
              <input
                type="text"
                value="Value"
                readOnly
                className="w-full mt-1 px-3 py-2 border rounded"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600">Time Slot</label>
              <input
                type="text"
                value="Value"
                readOnly
                className="w-full mt-1 px-3 py-2 border rounded"
              />
            </div>
          </div>

          {/* Confirmed Button */}
          <button
            disabled
            className="w-full bg-zinc-800 text-white py-2 rounded flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
          >
            <Check size={18} /> Confirmed
          </button>

          {/* Edit Button */}
          <button className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
            <Pencil size={16} /> Edit
          </button>

          {/* Message Box */}
          <div className="mt-4">
            <h4 className="font-semibold mb-1">Message</h4>
            <div className="border rounded p-3 text-sm text-gray-700 bg-white min-h-[80px]">
              Looking forward to our appointment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
