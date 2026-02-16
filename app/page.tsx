import Link from "next/link";
export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-white text-black p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            <a href="/">WeCureIt</a>
          </h1>
          <div className="space-x-4">
          <Link href="/General/Login" className="hover:underline bg-gray-200 p-2 border rounded-md">
              Login 
            </Link>
            <Link href="/General/register" className="hover:underline bg-black text-white p-2 border rounded-md">
              Register
            </Link>
          </div>
        </div>
      </nav>

  
      <div className="flex-grow flex items-center justify-center bg-gray-200">
        <h2 className="text-4xl font-bold text-black">WeCureIt</h2>
      </div>

      <footer className="bg-white text-black text-center p-4">
        <p>&copy; 2025 WeCureIt.</p>
      </footer>
    </div>
  );
}
