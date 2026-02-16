'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type AppointmentType = {
    date: string;
    duration: string;
    doctor_id: number;
    text: string;
  };
  

export default function PastAppointments() {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Replace with dynamic user ID (e.g. from auth/session)
  const user_id = 1;

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch(`/APIOne/doctor/patient?userId=${user_id}`);
        if (!res.ok) throw new Error('Failed to fetch appointment history');
        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user_id]);

  const closeModal = () => {
    setSelectedAppointment(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-black">
      <Header />

      <main className="flex-1 p-6">
        <h1 className="text-4xl font-bold mb-6">Patient History</h1>
        <h2 className="text-lg font-medium mb-4 text-gray-700">Appointments from the last 7 days</h2>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="space-y-4">
          {appointments.length === 0 && !loading ? (
            <div className="bg-white p-4 rounded shadow">
              <p className="text-gray-600 text-sm">No past appointments in the last 7 days.</p>
            </div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.doctor_id} className="bg-white p-4 rounded shadow">
                <p className="text-sm text-gray-700 mb-1 font-semibold">
                  {appointment.doctor_id}
                </p>
                <button
                  onClick={() => setSelectedAppointment(appointment)}
                  className="px-3 py-1 text-sm bg-black text-white rounded hover:bg-gray-800"
                >
                  View History
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      <Footer />

      {/* Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Patient History</h2>
            <p className="mb-1 text-sm text-gray-800 font-medium">
              {selectedAppointment.doctor_id}
            </p>
            
            <p className="text-sm text-gray-600 mb-1">
                Duration: {selectedAppointment.duration}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                Notes: {selectedAppointment.duration}
                </p>

            <div className="text-sm text-gray-700">
              {/* This can later be expanded with notes, diagnosis, etc. */}
              No patient history available for this appointment.
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}