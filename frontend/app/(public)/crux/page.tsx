import FestToggle from "@/components/shared/FestToggle";

export default function CruxLandingPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-2xl font-black tracking-widest text-purple-400">CRUX</h1>
        <FestToggle />
      </header>

      {/* Hero */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-6xl font-bold mb-6">Unleash Your Culture</h2>
        <p className="text-xl text-gray-400">
          The ultimate cultural spectacle of the year. Music, dance, drama, and art converge here.
        </p>
      </section>

      {/* Placeholders */}
      <section className="py-12 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="h-64 border border-gray-800 bg-gray-900/50 rounded-xl flex items-center justify-center">
          <span className="text-gray-500 font-semibold uppercase tracking-widest">Events Placeholder</span>
        </div>
        <div className="h-64 border border-gray-800 bg-gray-900/50 rounded-xl flex items-center justify-center">
          <span className="text-gray-500 font-semibold uppercase tracking-widest">Gallery Placeholder</span>
        </div>
        <div className="h-64 border border-gray-800 bg-gray-900/50 rounded-xl flex items-center justify-center">
          <span className="text-gray-500 font-semibold uppercase tracking-widest">Contact Placeholder</span>
        </div>
      </section>
    </main>
  );
}
