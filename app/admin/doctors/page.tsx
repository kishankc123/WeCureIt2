'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DoctorType, LicenseType } from '@/lib/db';

const specialties = ['Cardiology', 'Neurology', 'Pediatrics'];
const locations = ['dc', 'maryland', 'virginia'];


const Page = () => {
  const [doctors, setDoctors] = useState<DoctorType[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('/api/admin/doctors');
        const data = await res.json();
        console.log("doctors:",data);
        setDoctors(data);
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      }
    };
    fetchDoctors();
  }, []);

  const [licenses, setLicenses] = useState<LicenseType[]>([]);

  const [selectedDoctor, setSelectedDoctor] = useState<DoctorType | null>(null);
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorInfo, setNewDoctorInfo] = useState('');

  const handleViewLicenses = async (doctor: DoctorType) => {
    try {
      const res = await fetch(`/api/admin/license/${doctor.doctor_id}`);
      const data: LicenseType[] = await res.json();

      setLicenses(data);
      setSelectedDoctor(doctor);
    } catch (err) {
      console.error("Failed to fetch licenses", err);
      setLicenses([]);
    }
  };

  const handleAddLicense = async () => {
    if (selectedDoctor && specialty && location) {
      const newLicense = {
        doctor_id: selectedDoctor.doctor_id,
        specialty,
        location,
      };

      const response = await fetch(`/api/admin/license`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLicense),
      });
      await response.json();
      setLicenses([...licenses, newLicense]);
      setSpecialty("");
      setLocation("");
    }
  };

  const handleDeleteLicense = async (license: LicenseType, index: number) => {
    if (!selectedDoctor) return;
    const response = await fetch(`/api/admin/license`, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(license),
  });
  setLicenses(licenses.filter((_, i) => i !== index));
  };

  const deleteDoctor = async (doctor: DoctorType, index: number) => {
    if (doctor) {
      const response = await fetch(`/api/admin/doctors`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctor),
      });
      setDoctors(doctors.filter((_, i) => i !== index));
      alert('doctor deleted successfully.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col ">
      <Header />
      <main className="flex-1 p-6 text-black">
        <h1 className="text-3xl font-bold mb-6">Manage Doctors</h1>

        {doctors.map((doctor, index) => (
          <div key={doctor.user_id} className="border p-4 rounded-lg shadow-sm bg-white mb-4">
            <h2 className="text-xl font-semibold">{doctor.name}</h2>
            <p className="text-gray-600">NO. {doctor.doctor_id}</p>
            <p className="text-gray-600">{doctor.doctor_info}</p>
            <div className="mt-2 flex gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => handleViewLicenses(doctor)}
              >
                Edit
              </button>
              <button
                className="px-4 py-2 bg-black text-white rounded"
                onClick={() => deleteDoctor(doctor, index)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <button
          className="mt-6 px-4 py-2 bg-black text-white rounded"
          onClick={() => setShowAddModal(true)}
        >
          Add New Doctor
        </button>

        {showAddModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
            <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add New Doctor</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newDoctorName}
                    onChange={(e) => setNewDoctorName(e.target.value)}
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Doctor Info</label>
                  <textarea
                    value={newDoctorInfo}
                    onChange={(e) => setNewDoctorInfo(e.target.value)}
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="Specialist in..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  className="px-3 py-1 bg-gray-200 text-black rounded"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 bg-black text-white rounded"
                  onClick={() => {
                    if (newDoctorName && newDoctorInfo) {
                      const newDoctor: DoctorType = {
                        doctor_id: Math.max(...doctors.map((d) => d.doctor_id)) + 1,
                        user_id: Math.floor(Math.random() * 10000) + 100, // simple unique-ish id
                        name: newDoctorName,
                        doctor_info: newDoctorInfo,
                      };
                      setDoctors([...doctors, newDoctor]);
                      // setLicenses((prev) => ({ ...prev, [newDoctor.doctor_id]: [] }));
                      setNewDoctorName('');
                      setNewDoctorInfo('');
                      setShowAddModal(false);
                    }
                  }}
                >
                  Add Doctor
                </button>
              </div>
            </div>
          </div>
        )}
        {selectedDoctor && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
            <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Doctor NO. {selectedDoctor.doctor_id}</h2>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              </div>

              {/* License List */}
              <div className="space-y-4">
                {licenses.map((license, index) => (
                  <div key={index} className="border p-4 rounded-md shadow-sm">
                    <h3 className="text-lg font-semibold">
                      Specialty: {license.specialty} Location: {license.location}
                    </h3>
                    <button
                      className="mt-2 px-3 py-1 bg-gray-200 rounded"
                      onClick={() => handleDeleteLicense(license, index)}
                    >
                      delete
                    </button>
                  </div>
                ))}
              </div>

              <div className="border p-4 mt-4 rounded-md bg-gray-100">
                <h3 className="mb-3 text-lg font-semibold">new license (Adding)</h3>
                <div className="mb-3">
                  <label className="block mb-2 text-base font-medium text-gray-700">Specialty</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Select Specialty</option>
                    {specialties.map((val) => (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block mb-2 text-base font-medium text-gray-700">Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Select Location</option>
                    {locations.map((val) => (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    className="px-3 py-1 bg-gray-200 text-black rounded"
                    onClick={() => setSelectedDoctor(null)}
                  >
                    return
                  </button>
                  <button
                    className="px-3 py-1 bg-black text-white rounded"
                    onClick={handleAddLicense}
                  >
                    confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Page;
