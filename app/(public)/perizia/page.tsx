import Link from "next/link";
import FestToggle from "@/components/shared/FestToggle";

export default function PeriziaLandingPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-gray-200 bg-white">
        <h1 className="text-2xl font-black tracking-widest text-blue-600">PERIZIA</h1>
        <FestToggle />
      </header>

      {/* Hero */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-6xl font-bold mb-6 text-gray-900">Elevate Your Mind</h2>
        <p className="text-xl text-gray-600 mb-10">
          The annual academic festival featuring workshops, conferences, and insights from industry leaders.
        </p>
        <Link 
          href="/register" 
          className="inline-block bg-blue-600 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all"
        >
          Register Now
        </Link>
      </section>

      {/* Placeholders */}
      <section className="py-12 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-64 border border-gray-200 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-gray-400 font-semibold uppercase tracking-widest">Workshops Placeholder</span>
        </div>
        <div className="h-64 border border-gray-200 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-gray-400 font-semibold uppercase tracking-widest">Speakers Placeholder</span>
        </div>
      </section>
    </main>
  );
}
