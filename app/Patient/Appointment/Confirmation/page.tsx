'use client';

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

export default function DoctorAppointment() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [durationLabel, setDurationLabel] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const doctorIdParam = searchParams.get('doctorId');
  const doctorId = doctorIdParam ? parseInt(doctorIdParam, 10) : null;
  const [clinicId, setClinicId] = useState(1);
  const [examRoomId, setExamRoomId] = useState(1);

  const [showCalendar, setShowCalendar] = useState(false);
  const [showDurationOptions, setShowDurationOptions] = useState(false);
  const [showTimeOptions, setShowTimeOptions] = useState(false);

  const durationOptions = ["15 minutes", "30 minutes", "1 hour"];
  const timeOptions = Array.from({ length: 36 }, (_, i) => {
    const hour = 9 + Math.floor(i / 4);
    const minute = (i % 4) * 15;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDate = localStorage.getItem("appointment-date");
      if (storedDate) setDate(new Date(storedDate));
      else setDate(new Date());
    }
  }, []);

  useEffect(() => {
    if (date && typeof window !== "undefined") {
      localStorage.setItem("appointment-date", date.toISOString());
    }
  }, [date]);

  const parseDuration = (str: string) => {
    if (str === "15 minutes") return 15;
    if (str === "30 minutes") return 30;
    if (str === "1 hour") return 60;
    return 0;
  };

  const handleClick = () => {
    router.push('../appointment');
  };

  const handleBooking = async () => {
    if (!date || !startTime || !durationLabel) {
      alert("Please select date, time, and duration.");
      return;
    }

    if (!session || !session?.user?.patientId) {
      alert("User is not logged in or session is incomplete.");
      return;
    }

    const duration = parseDuration(durationLabel);
    const start_time = `${startTime}:00`;

    const payload = {
      patient_id: session?.user?.patientId,
      doctor_id: doctorId,
      date: format(date, "yyyy-MM-dd"),
      start_time,
      duration,
      clinic_id: clinicId,
      exam_room_id: examRoomId,
    };

    try {
      const res = await fetch("/apione/patient/appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Appointment booked successfully!");
        router.push('/patient/appointment');
      } else {
        alert(`Booking failed: ${data.message}`);
      }
    } catch (err) {
      console.error("Error booking appointment:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-black flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl flex overflow-visible">
        <div className="bg-gray-200 w-1/2 flex items-center justify-center relative">
          <div
            className="absolute top-4 left-4 text-xl cursor-pointer w-8 h-8 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100 transition"
            onClick={handleClick}
          >
            ←
          </div>
          <div className="absolute top-4 right-4 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center">🤍</div>
          <div className="w-64 h-64 bg-gray-300 flex items-center justify-center">Image</div>
        </div>

        <div className="w-1/2 p-8 overflow-visible relative">
          <h1 className="text-3xl font-bold">Doctor Name</h1>
          <h2 className="text-xl font-semibold text-gray-700 mt-2">Speciality</h2>
          <p className="text-sm text-gray-500 mt-1 mb-4">Text</p>

          <div className="flex gap-4 mb-4 relative z-10">
            {/* Calendar Picker */}
            <div className="relative">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-[150px] border border-gray-300 rounded px-3 py-2 flex items-center gap-2"
              >
                <FaCalendarAlt />
                {date ? format(date, "PPP") : "Pick a date"}
              </button>
              {showCalendar && (
                <div className="absolute z-50 mt-2 bg-white border rounded shadow">
                  <Calendar
                    date={date}
                    onChange={(d: any) => {
                      setDate(d);
                      setShowCalendar(false);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Time Picker */}
            <div className="relative">
              <button
                className="w-[150px] border border-gray-300 rounded px-3 py-2 flex justify-between items-center"
                onClick={() => setShowTimeOptions(!showTimeOptions)}
              >
                {startTime || "Select time"}
                <FaChevronDown />
              </button>
              {showTimeOptions && (
                <div className="absolute mt-1 bg-white border rounded shadow w-full z-50 max-h-64 overflow-y-auto">
                  {timeOptions.map((option) => (
                    <div
                      key={option}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setStartTime(option);
                        setShowTimeOptions(false);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Duration Picker */}
            <div className="relative">
              <button
                className="w-[150px] border border-gray-300 rounded px-3 py-2 flex justify-between items-center"
                onClick={() => setShowDurationOptions(!showDurationOptions)}
              >
                {durationLabel || "Duration"}
                <FaChevronDown />
              </button>
              {showDurationOptions && (
                <div className="absolute mt-1 bg-white border rounded shadow w-full z-50">
                  {durationOptions.map((option) => (
                    <div
                      key={option}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setDurationLabel(option);
                        setShowDurationOptions(false);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            className="w-full bg-black text-white rounded px-4 py-2 hover:bg-gray-800"
            onClick={handleBooking}
          >
            Confirm Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
