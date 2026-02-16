'use client';

import React, { useState } from "react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';


type AppointmentType = {
    appointment_id: number;
    date: string;
    start_time: string;
};

const todayAppointments: AppointmentType[] = [
    {
        appointment_id: 1,
        date: '2025-04-10',
        start_time: '09:00 AM',
    }
];

const futureAppointments: AppointmentType[] = [
    {
        appointment_id: 2,
        date: '2025-04-15',
        start_time: '11:00 AM',
    }
];
export default async function LookAppointment() {
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentType | null>(null);
    const [modalType, setModalType] = useState<'history' | 'comment' | null>(null);
    const [comment, setComment] = useState('');

    const closeModal = () => {
        setSelectedAppointment(null);
        setModalType(null);
        setComment('');
    };

    const handleSaveComment = () => {
        console.log('Saved comment for:', selectedAppointment);
        console.log('Comment:', comment);
        closeModal();
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 text-black">
            <Header />

            <main className="flex-1 p-6">
                <h1 className="text-4xl font-bold mb-6">Schedule</h1>

                {/* Today Appointments */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">Today</h2>
                    <div className="space-y-4">
                        {todayAppointments.length === 0 ? (
                            <AppointmentCard title="No Appointment" />
                        ) : (
                            todayAppointments.map((appointment) => (
                                <AppointmentCard
                                    key={appointment.appointment_id}
                                    title="Today Appointment"
                                    appointment={appointment}
                                    onViewHistory={() => {
                                        setSelectedAppointment(appointment);
                                        setModalType('history');
                                    }}
                                    onAddComment={() => {
                                        setSelectedAppointment(appointment);
                                        setModalType('comment');
                                    }}
                                />
                            ))
                        )}
                    </div>
                </section>

                {/* Future Appointments */}
                <section className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Future</h2>
                    <div className="space-y-4">
                        {futureAppointments.length === 0 ? (
                            <AppointmentCard title="No Appointment" />
                        ) : (
                            futureAppointments.map((appointment) => (
                                <AppointmentCard
                                    key={appointment.appointment_id}
                                    title="Future Appointment"
                                    appointment={appointment}
                                    onViewHistory={() => {
                                        setSelectedAppointment(appointment);
                                        setModalType('history');
                                    }}
                                    onAddComment={() => {
                                        setSelectedAppointment(appointment);
                                        setModalType('comment');
                                    }}
                                />
                            ))
                        )}
                    </div>
                </section>
            </main>

            <Footer />

            {/* Modal */}
            {selectedAppointment && modalType && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-2xl font-semibold mb-4">
                            {modalType === 'history' ? 'Patient History' : 'Add Comment'}
                        </h2>
                        <p className="mb-2 text-sm text-gray-600">
                            Appointment No. {selectedAppointment.appointment_id} — {selectedAppointment.date} at {selectedAppointment.start_time}
                        </p>

                        {modalType === 'history' ? (
                            <div className="text-gray-700 text-sm">
                                {/* Static content for now */}
                                No history available.
                            </div>
                        ) : (
                            <>
                                <textarea
                                    className="w-full border border-gray-300 rounded p-2 mb-4"
                                    rows={5}
                                    placeholder="Write a comment..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <div className="flex justify-end space-x-2">
                                    <button onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                                        Cancel
                                    </button>
                                    <button onClick={handleSaveComment} className="px-4 py-2 bg-black text-white rounded hover:bg-blue-700">
                                        Save
                                    </button>
                                </div>
                            </>
                        )}
                        {modalType === 'history' && (
                            <div className="flex justify-end mt-4">
                                <button onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Appointment Card with buttons
function AppointmentCard({
    title,
    appointment,
    onViewHistory,
    onAddComment,
}: {
    title: string;
    appointment?: AppointmentType;
    onViewHistory?: () => void;
    onAddComment?: () => void;
}) {
    return (
        <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            {appointment && (
                <>
                    <p className="text-sm text-gray-600 mb-4">
                        No. {appointment.appointment_id} — Date: {appointment.date} — Start Time: {appointment.start_time}
                    </p>
                    <div className="flex space-x-2">
                        <button
                            onClick={onViewHistory}
                            className="px-3 py-1 text-sm bg-black text-white rounded hover:bg-green-600"
                        >
                            View History
                        </button>
                        <button
                            onClick={onAddComment}
                            className="px-3 py-1 text-sm bg-black text-white rounded hover:bg-blue-600"
                        >
                            Add Comment
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
