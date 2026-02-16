'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex flex-col">
     
      <Header/>

      <main className="flex-grow bg-gray-100 flex flex-col items-center p-10 text-center">
        <h1 className="text-2xl text-gray-600 mb-6">Hello Admin...</h1>
        <h2 className="text-lg font-semibold text-left w-full max-w-4xl">Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 max-w-4xl w-full">
        {[
          { title: 'Manage Doctor', desc: 'View, add, edit, or delete doctors and their licenses', link: '/admin/doctors' },
          { title: 'Manage Facilities', desc: 'View, add, edit, or delete facilities and their exam rooms', link: '/admin/facilities' },
          { title: 'Manage Patients', desc: 'View, add, edit, or delete patients', link: '/admin/patients' },
        ].map((item, index) => (
          <Link key={index} href={item.link} passHref>
            <div className="bg-white p-6 rounded-lg shadow-sm border text-left cursor-pointer h-25 flex flex-col justify-between">
              <h3 className="text-black font-semibold">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      </main>
      <Footer/>
    </div>
  );
}
