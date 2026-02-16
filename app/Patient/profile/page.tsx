'use client';
import React, { useEffect, useState } from "react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSession } from "next-auth/react";

type PatientInfo = {
  name: string;
  email: string;
  phone_number: string;
  address: string;
  dob: string;
  gender: string;
};

export default function PatientProfile() {
  const { data: session, status } = useSession();
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.email) return;

      try {
        const res = await fetch('/apione/patient/profile');
        const data = await res.json();
        if (res.ok) {
          setPatientInfo({
            name: data.user.name ?? '',
            email: data.user.email ?? '',
            phone_number: data.user.phone_number ?? '',
            address: data.user.address ?? '',
            dob: data.user.dob ? data.user.dob.slice(0,10): '',
            gender: data.user.gender ?? 'Other',
          });
        } else {
          setError(data.error || 'Failed to fetch profile.');
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred while fetching the profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session?.user?.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!patientInfo) return;
    const { name, value } = e.target;
    setPatientInfo(prev => prev ? { ...prev, [name]: value } : prev);
  };

  const handleSave = async () => {
    if (!patientInfo?.name || !patientInfo?.email) {
      setError('Name and email are required.');
      return;
    }

    setError(null);
    try {
      const res = await fetch('/apione/patient/updateprofile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: patientInfo.name,
          phone_number: patientInfo.phone_number,
          address: patientInfo.address,
          gender: patientInfo.gender,
          dob: patientInfo.dob,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update profile');
        return;
      }

      setIsEditing(false); // exit edit mode on success
    } catch (err) {
      console.error(err);
      setError('An error occurred while updating the profile.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!patientInfo) return <p className="p-6 text-red-500">Unable to load profile.</p>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-black">
      <Header />

      <main className="flex-1 p-6">
        <h1 className="text-4xl font-bold mb-6">Patient Profile</h1>
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-2xl font-semibold mb-4">{isEditing ? 'Edit Information' : 'Personal Information'}</h2>
          <div className="space-y-4">
            {['name', 'email', 'phone_number', 'address', 'dob'].map(field => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-600">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  id={field}
                  name={field}
                  type={field === 'dob' ? 'date' : 'text'}
                  value={patientInfo[field as keyof PatientInfo] ?? ''}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  disabled={!isEditing || field === 'email'} // email is not editable
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-600">Gender</label>
              {isEditing ? (
                <select
                  name="gender"
                  value={patientInfo.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              ) : (
                <p className="mt-1 block w-full p-2 bg-gray-100 border border-gray-300 rounded">
                  {patientInfo.gender || 'Not specified'}
                </p>
              )}
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <div className="flex gap-4 pt-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
