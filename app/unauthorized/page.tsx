import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <h2 className="mt-2 text-2xl text-black font-semibold">Unauthorized</h2>
      <p className="mt-4 text-center text-black max-w-md">
        You don’t have permission to view this page.
      </p>
      <Link
        href="/"
        className="mt-6 px-4 py-2 border border-transparent rounded-md shadow-sm bg-black"
      >
        Home
      </Link>
    </div>
  );
}
