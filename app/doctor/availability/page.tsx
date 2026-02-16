'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Slot {
  day: string;
  start: string;
  end: string;
  date?: string;
}

export default function ViewAvailabilityPage() {
  const { data: session, status } = useSession();
  const [availability, setAvailability] = useState<Slot[]>([]);
  const [newSlot, setNewSlot] = useState<Slot>({ day: 'Monday', start: '', end: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSlot, setEditingSlot] = useState<{ key: string; start: string; end: string } | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAvailability();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
      setError('Please log in to view availability');
    }
  }, [status]);

  const getSlotKey = (slot: Slot) => `${slot.day}-${slot.date}-${slot.start}-${slot.end}`;

  const fetchAvailability = async () => {
    try {
      const res = await fetch('/apione/doctor/getavailability');
      if (!res.ok) throw new Error('Failed to fetch availability');
      const { availability } = await res.json();

      setAvailability(availability.map((slot: any) => {
        const date = new Date(slot.date);
        const dayIndex = date.getDay();
        const dayName = dayIndex === 0 ? 'Sunday' : daysOfWeek[dayIndex - 1];

        return {
          day: dayName,
          start: slot.start_time.slice(0, 5),
          end: slot.end_time.slice(0, 5),
          date: slot.date
        };
      }));
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to load availability data');
    } finally {
      setIsLoading(false);
    }
  };

  const getSlotsForDay = (day: string) =>
    availability.filter(slot => slot.day.trim() === day.trim());

  const handleAddSlot = async () => {
    if (!newSlot.start || !newSlot.end) {
      setError('Please select both start and end times');
      return;
    }

    if (newSlot.start >= newSlot.end) {
      setError('End time must be after start time');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/apione/doctor/addavailability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          availability: {
            date: getNextDateOfWeekday(newSlot.day),
            start_time: newSlot.start,
            end_time: newSlot.end
          }
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add availability');
      }

      setAvailability(prev => [...prev, newSlot]);
      setNewSlot({ day: 'Monday', start: '', end: '' });
    } catch (err) {
      console.error('Error adding availability:', err);
      setError('Failed to add availability');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSlot = async (original: Slot) => {
    const doctor_id = session?.user?.doctorId;
    if (!editingSlot || !doctor_id) return;

    const normalizeTime = (t: string) => (t.length === 5 ? `${t}:00` : t);

    const originalStartTime = normalizeTime(original.start);
    const originalEndTime = normalizeTime(original.end);
    const newStartTime = normalizeTime(editingSlot.start);
    const newEndTime = normalizeTime(editingSlot.end);

    try {
      const res = await fetch('/doctor/updateavailability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          doctor_id,
          originalStartTime,
          originalEndTime,
          newStartTime,
          newEndTime,
        }),
      });

      if (!res.ok) throw new Error('Failed to update availability');

      const slotIndex = availability.findIndex(
        s =>
          s.day === original.day &&
          s.date === original.date &&
          s.start === original.start &&
          s.end === original.end
      );

      if (slotIndex !== -1) {
        const updatedAvailability = [...availability];
        updatedAvailability[slotIndex] = {
          ...original,
          start: editingSlot.start,
          end: editingSlot.end,
        };
        setAvailability(updatedAvailability);
      }

      setEditingSlot(null);
    } catch (err) {
      console.error('Error updating availability:', err);
      setError('Failed to update availability');
    }
  };

  const handleDeleteSlot = async (slot: Slot) => {
    setIsLoading(true);
    try {
      const res = await fetch('/apione/doctor/deleteavailability', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          availability: {
            date: getNextDateOfWeekday(slot.day),
            start_time: slot.start,
            end_time: slot.end
          }
        }),
      });

      if (!res.ok) throw new Error('Failed to delete availability');

      setAvailability(prev => prev.filter(s =>
        !(s.day === slot.day && s.start === slot.start && s.end === slot.end)
      ));
    } catch (err) {
      console.error('Error deleting availability:', err);
      setError('Failed to delete availability');
    } finally {
      setIsLoading(false);
    }
  };

  function getNextDateOfWeekday(dayName: string): string {
    const dayIndex = daysOfWeek.indexOf(dayName);
    const today = new Date();
    const todayIndex = today.getDay();
    const daysUntilNext = (dayIndex + 7 - (todayIndex === 0 ? 6 : todayIndex - 1)) % 7 || 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilNext);
    return nextDate.toISOString().split('T')[0];
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gray-100 p-10 flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gray-100 p-10 flex items-center justify-center">
          <div className="text-xl text-red-500">{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-100 p-10">
        <h2 className="text-2xl text-black font-semibold mb-6">Add Availability For Week of {new Date().toLocaleDateString()}</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
          <select
            value={newSlot.day}
            onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
            className="border p-2 text-black rounded w-full sm:w-auto"
            disabled={isLoading}
          >
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <input
            type="time"
            value={newSlot.start}
            onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
            className="border p-2 text-black rounded w-full sm:w-auto"
            disabled={isLoading}
          />
          <input
            type="time"
            value={newSlot.end}
            onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
            className="border p-2 text-black rounded w-full sm:w-auto"
            disabled={isLoading}
          />
          <button
            onClick={handleAddSlot}
            disabled={isLoading}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition w-full sm:w-auto disabled:bg-gray-400"
          >
            {isLoading ? 'Adding...' : 'Add Availability'}
          </button>
        </div>

        <h2 className="text-2xl text-black font-semibold mb-6">Your Availability</h2>

        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="bg-white p-4 rounded shadow-sm min-h-[150px]">
                <h3 className="font-semibold text-black text-center border-b pb-1 mb-2">{day}</h3>
                <div className="flex flex-col gap-2">
                {(() => {
  const slots = getSlotsForDay(day);

  if (slots.length === 0) {
    return <p className="text-gray-500 text-sm text-center">No availability</p>;
  }

  return slots.map((slot) => {
    const slotKey = getSlotKey(slot);
    const isEditing = editingSlot?.key === slotKey;

    return (
      <div
        key={slotKey}
        className="flex flex-col gap-1 bg-green-100 text-black px-2 py-2 rounded text-sm"
      >
        <div className="flex justify-between items-center">
          {isEditing ? (
            <div className="flex gap-1 items-center w-full">
              <input
                type="time"
                value={editingSlot.start}
                onChange={(e) => setEditingSlot({ ...editingSlot, start: e.target.value })}
                className="border rounded p-1 text-sm"
              />
              <span>-</span>
              <input
                type="time"
                value={editingSlot.end}
                onChange={(e) => setEditingSlot({ ...editingSlot, end: e.target.value })}
                className="border rounded p-1 text-sm"
              />
            </div>
          ) : (
            <span>{slot.start} - {slot.end}</span>
          )}
        </div>

        <div className="flex gap-2 justify-end mt-1">
          {isEditing ? (
            <>
              <button
                onClick={() => handleUpdateSlot(slot)}
                className="text-blue-600 hover:underline text-xs"
                disabled={isLoading}
              >
                Save
              </button>
              <button
                onClick={() => setEditingSlot(null)}
                className="text-gray-500 hover:underline text-xs"
                disabled={isLoading}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditingSlot({ key: slotKey, start: slot.start, end: slot.end })}
                className="text-blue-600 hover:underline text-xs"
                disabled={isLoading}
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteSlot(slot)}
                className="text-red-600 hover:underline text-xs"
                disabled={isLoading}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    );
  });
})()}

                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
