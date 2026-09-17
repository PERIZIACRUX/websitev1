import Link from "next/link";
import FestToggle from "@/components/shared/FestToggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="absolute top-6">
        <FestToggle />
      </div>

      <div className="text-center max-w-3xl mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Welcome to the Unified Fest Platform
        </h1>
        <p className="text-xl text-gray-400">
          Experience the ultimate fusion of culture and academics. Choose your path.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        <Link href="/crux" className="flex-1 group">
          <div className="h-64 border border-gray-800 bg-gray-900 rounded-2xl flex flex-col items-center justify-center p-8 transition-all hover:border-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <h2 className="text-4xl font-black tracking-widest text-white mb-2 group-hover:text-purple-400 transition-colors">CRUX</h2>
            <p className="text-gray-400 text-center">The Annual Cultural Festival</p>
          </div>
        </Link>
        
        <Link href="/perizia" className="flex-1 group">
          <div className="h-64 border border-gray-800 bg-gray-900 rounded-2xl flex flex-col items-center justify-center p-8 transition-all hover:border-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <h2 className="text-4xl font-black tracking-widest text-white mb-2 group-hover:text-blue-400 transition-colors">PERIZIA</h2>
            <p className="text-gray-400 text-center">The Annual Academic Festival</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
