export default function LogoutPage() {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white px-6 text-center">
        <h1 className="text-2xl text-black font-bold mb-4">You've been logged out</h1>
        <p className="text-gray-600 mb-6"> You can log back in anytime.</p>
        <a href="/" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800" >
          Home
        </a>
        <p className="text-gray-600 mb-6"> </p>
        <a href="/general/login" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition" >
          Go to Login
        </a>
      </div>
    );
  }
  
  