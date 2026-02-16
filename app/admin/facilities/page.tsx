'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FacilityType, RoomType } from '@/lib/db';

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<FacilityType[]>([]);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const res = await fetch('/api/admin/clinic');
        const data = await res.json();
        console.log("facilities:", data);
        setFacilities(data);
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      }
    };
    fetchFacilities();
  }, []);

  const [selectedFacility, setSelectedFacility] = useState<FacilityType | null>(null);
  const [selectedRooms, setSelectedRooms] = useState<RoomType[]>([]);
  const [showAddClinic, setShowAddClinic] = useState(false);
  const [newClinicLocation, setNewClinicLocation] = useState('');

  const handleViewRooms = async (facility: FacilityType) => {
    const res = await fetch(`/api/admin/rooms/${facility.clinic_id}`);
    const data: RoomType[] = await res.json();

    setSelectedFacility(facility);
    setSelectedRooms(data);
  };

  const addClinic = async () => {
    if (newClinicLocation.trim()) {

      const response = await fetch(`/api/admin/clinic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinic_id: 0,
          location: newClinicLocation.trim(),
        }),
      });
      const result = await response.json();
      const newClinic: FacilityType = {
        clinic_id: Number(result.data),
        location: newClinicLocation.trim(),
      };
      setFacilities([...facilities, newClinic]);
      setNewClinicLocation('');
      setShowAddClinic(false);
      alert('Clinic added successfully.');
    }
  };

  const deleteClinic = async (facility: FacilityType, index: number) => {
    if (facility) {

      const response = await fetch(`/api/admin/clinic`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facility),
      });
      setFacilities(facilities.filter((_, i) => i !== index));
      alert('Clinic deleted successfully.');
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 flex-col flex ">
      <Header />
      <main className="flex-1 p-6 text-black">
        <h1 className="text-3xl font-bold mb-6">Manage Facilities</h1>

        {/* Add Clinic Form */}
        {showAddClinic && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
            <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New Clinic</h2>
                <button onClick={() => setShowAddClinic(false)} className="text-gray-500 hover:text-black">
                  ✕
                </button>
              </div>

              <input
                type="text"
                placeholder="Location"
                value={newClinicLocation}
                onChange={(e) => setNewClinicLocation(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => setShowAddClinic(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-black text-white rounded"
                  onClick={addClinic}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Facilities List */}
        <div className="space-y-4">
          {facilities.map((facility, index) => (
            <div key={facility.clinic_id || index} className="border p-4 rounded-lg shadow-sm bg-white">
              <h2 className="text-xl font-semibold">Clinic ID: {facility.clinic_id}</h2>
              <p className="text-gray-600">Location: {facility.location}</p>
              <div className="mt-4 flex gap-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => handleViewRooms(facility)}
                >
                  Manage Rooms
                </button>
                <button
                  className="px-4 py-2 bg-black text-white rounded"
                  onClick={() => deleteClinic(facility, index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {/* Add Clinic Button */}
          <div className="mb-6">
            <button
              className="px-4 py-2 bg-black text-white rounded"
              onClick={() => setShowAddClinic(true)}
            >
              Add Clinic
            </button>
          </div>
        </div>



        {/* Facility Rooms Modal */}
        {selectedFacility && (
          <FacilityRoomsModal
            facility={selectedFacility}
            rooms={selectedRooms}
            onClose={() => setSelectedFacility(null)}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

function FacilityRoomsModal({
  facility,
  rooms,
  onClose,
}: {
  facility: FacilityType;
  rooms: RoomType[];
  onClose: () => void;
}) {
  const [roomList, setRoomList] = useState<RoomType[]>(rooms);
  const [newRoomCap, setNewRoomCap] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
  const [capability, setCapability] = useState('');

  const addRoom = async () => {
    if (capability.trim()) {
      const newRoom = {
        clinic_id: facility.clinic_id,
        exam_room_id: 0,
        capability: capability.trim(),
      };
      const response = await fetch(`/api/admin/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRoom),
      });
      const result = await response.json();
      console.log("backk:", result);
      newRoom.exam_room_id = Number(result.data)
      setRoomList([...roomList, newRoom]);
      setCapability("");
      setNewRoomCap(false);
    }
  };

  // Function to update room capabilities
  const addCapability = async () => {

    if (editingRoom && capability.trim()) {
      const updatedRooms = roomList.map((room) =>
        room.exam_room_id === editingRoom.exam_room_id
          ? { ...room, capability: capability.trim() }
          : room
      );
      editingRoom.capability = capability.trim()
      const response = await fetch(`/api/admin/rooms`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingRoom),
      });
      setRoomList(updatedRooms);
      setCapability("");
      setEditingRoom(null);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Exam Rooms - Clinic ID: {facility.clinic_id}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {roomList.map((room, index) => (
            <div key={room.exam_room_id || index} className="border p-4 rounded-md shadow-sm">
              <h3 className="text-lg font-semibold">
                Exam Room ID: {room.exam_room_id} — Capability: {room.capability}
              </h3>
              <button
                className="mt-2 px-3 py-1 bg-gray-200 rounded"
                onClick={() => setEditingRoom(room)}
              >
                Edit
              </button>
            </div>
          ))}
        </div>

        {editingRoom && (
          <div className="border p-4 mt-4 rounded-md bg-gray-100">
            <h3 className="text-lg font-semibold">Editing Room ID: {editingRoom.exam_room_id}</h3>
            <input
              type="text"
              placeholder="Capability"
              value={capability}
              onChange={(e) => setCapability(e.target.value)}
              className="border p-2 rounded w-full mt-2"
            />
            <button className="mt-2 px-3 py-1 bg-gray-200 rounded" onClick={addCapability}>
              Update Capability
            </button>
          </div>
        )}

        {newRoomCap && (
          <div className="border p-4 mt-4 rounded-md bg-gray-100">
            <h3 className="text-lg font-semibold">Add New Room</h3>
            <input
              type="text"
              placeholder="Capability"
              value={capability}
              onChange={(e) => setCapability(e.target.value)}
              className="border p-2 rounded w-full mt-2"
            />
            <button className="mt-2 px-3 py-1 bg-gray-200 rounded" onClick={addRoom}>
              Add Room
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button
            className="px-3 py-1 border rounded"
            onClick={() => setNewRoomCap(true)}
          >
            Add Room
          </button>
          <button
            className="px-3 py-1 bg-black text-white rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
