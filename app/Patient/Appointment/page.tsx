'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';


type DoctorType = {
  doctor_name: string;
  specialty: string;
  availability: string;
  facility: string;
  doctor_id: number;
};
type AppointmentType = {
    appointment_id: number;
    duration: string;
    start_time: string;
    date: string;
    doctor_id: number;
    doctor_name: string;
};



export default function AppointmentBooking() {
  const [selectedDate, setSelectedDate] = useState('');
  const [specialty, setSpecialty] = useState('Heart');
  const [doctors, setDoctors] = useState<DoctorType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const {data: session} = useSession();
  const [pastappointments, setPastAppointments] = useState<AppointmentType[]>([]);
  const [futureappointments, setFutureAppointments] = useState<AppointmentType[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = (doctorId: number) => {
    router.push(`../patient/appointment/confirmation?doctorId=${doctorId}`);
  };

  const handleDelete = async (appointment: AppointmentType) => {
    if (!session?.user?.patientId) {
      alert('Please log in to cancel appointments');
      return;
    }

    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch('/apione/patient/cancelappointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment: appointment,
          user_id: session.user.patientId,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to cancel appointment');
      }

      setFutureAppointments((prev) =>
        prev.filter((appt) => appt.appointment_id !== appointment.appointment_id)
      );
      alert('Appointment cancelled successfully');
    } catch (error) {
      console.error('Delete Error:', error);
      alert('Failed to cancel appointment.',);
    } finally {
      setIsDeleting(false);
    }
  };


  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('/apione/patient/doctor');
        const data = await res.json();
        if (Array.isArray(data)) {
          setDoctors(data);
          console.log('Fetched doctor data:', data); // Check what’s coming back
        } else {
          throw new Error('Unexpected response format');
        }
        setLoading(false);
      } catch (err) {
        console.error("Error to load doc data",err);
        setError('Failed to fetch doctors');
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchFutureAppointments = async () => {
      console.log('Session data:', session); // Debug 0
      console.log('Starting fetch, patientId:', session?.user?.patientId); // Debug 1
      console.log('UserId test:', session?.user); // Debug 1

      if (!session?.user?.patientId) 
      {
        console.log('No patientId in session:', session?.user);
        return;
      }
  
      try {
        const url = `/apione/patient/futureappointments?patientId=${session.user.patientId}`;
        console.log('Fetching from:', url); // Debug 2
        
        const res = await fetch(url);
        console.log('Response status:', res.status); // Debug 3
        
        const data = await res.json();
        console.log('Raw API response:', data); // Debug 4
        
        if (data.appointments && Array.isArray(data.appointments)) {
          console.log('Received appointments:', data.appointments); // Debug 5
          setFutureAppointments(data.appointments);
        } else {
          console.error('Invalid data structure:', data);
        }
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
      }
    };
  
    fetchFutureAppointments();
  }, [session]);

  useEffect(() => {
    const fetchPastAppointments = async () => {
      if (!session?.user?.patientId) return;
  
      try {
        const res = await fetch(`/apione/patient/pastappointments?patientId=${session.user.patientId}`);
        const data = await res.json();
        if (Array.isArray(data.appointments)) {
          setPastAppointments(data.appointments);
        } else {
          console.error('Invalid appointment data:', data);
        }
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
      }
    };
  
    fetchPastAppointments();
  }, [session]);
  

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Book an Appointment</h1>
          <button className="bg-black text-white px-4 py-2 rounded">Logout</button>
        </header>

        <div className="flex flex-wrap gap-4 items-center mb-6">
          <input
            type="date"
            className="border p-2 rounded w-40"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <select className="border p-2 rounded w-40">
            <option>Specialty</option>
          </select>
          <select className="border p-2 rounded w-40" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
            <option>Heart</option>
          </select>
          <button className="bg-black text-white px-4 py-2 rounded">Search</button>
        </div>

        <h2 className="text-lg font-semibold mb-4">Results</h2>

        {loading && <p>Loading doctors...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {doctors.map((doc, index) => (
            <div key={index} className="bg-gray-200 p-4 rounded-lg text-center">
              <h3 className="font-bold">{doc.doctor_name}</h3>
              <p>Doctor ID: {doc.doctor_id}</p>
              <p>Facility: {doc.facility}</p>
              <p>Specialty: {doc.specialty}</p>
              <button 
                className="bg-black text-white px-4 py-2 rounded mt-2"
                onClick={()=>handleClick(doc.doctor_id)}>Book</button>
            </div>
          ))}
        </div>
        <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Appointments</h2>
        
        {/* Past Appointments */}
        <div className="bg-gray-100 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Past Appointments</h3>
            {pastappointments.length == 0 ? (
              <p className="text-sm text-gray-600">No Past appointments found.</p>
            ) : (
              <div className="space-y-4">
                {pastappointments.map((appt) => (
                  <div
                    key={appt.appointment_id}
                    className="border rounded-lg p-4 bg-white shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold">Appointment with {appt.doctor_id}</h4>
                      <p className="text-sm text-gray-600">
                        Date: {appt.date} | Start Time: {appt.start_time} | Duration: {appt.duration} mins
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        {/* Future Appointments */}
          <div className="bg-gray-100 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Future Appointments</h3>
            {futureappointments.length == 0 ? (
              <p className="text-sm text-gray-600">No future appointments found.</p>
            ) : (
              <div className="space-y-4">
                {futureappointments.map((appt) => (
                  <div
                    key={appt.appointment_id}
                    className="border rounded-lg p-4 bg-white shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold">Appointment with Doctor  {appt.doctor_name}</h4>
                      <p className="text-sm text-gray-600">
                        Date: {appt.date} | Start Time: {appt.start_time} | Duration: {appt.duration} mins
                      </p>
                    </div>
                    <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                     onClick={() => handleDelete(appt)}
                     disabled={isDeleting}>
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}