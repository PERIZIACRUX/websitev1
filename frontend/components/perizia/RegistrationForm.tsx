"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchBackend } from "@/lib/api";

type Workshop = {
  id: string;
  title: string;
  periziaDayId: string;
  capacity?: number | null;
  _count: { workshopRegistrations: number };
};

type PeriziaDay = {
  id: string;
  name: string;
  date: string;
};

type ActiveEdition = {
  id: string;
  name: string;
  days: PeriziaDay[];
  workshops: Workshop[];
};

export default function RegistrationForm() {
  const [edition, setEdition] = useState<ActiveEdition | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [errorData, setErrorData] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [selectedWorkshops, setSelectedWorkshops] = useState<Record<string, string>>({}); // periziaDayId -> workshopId

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    registrationNumber: string;
    amount: number;
    status: string;
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchBackend("/api/v1/workshops");
        const json = await res.json();
        if (json.success) {
          setEdition(json.data);
        } else {
          setErrorData(json.error || "Failed to load workshops");
        }
      } catch (err) {
        setErrorData("Failed to connect to server");
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

  const handleWorkshopToggle = (dayId: string, workshopId: string) => {
    setSelectedWorkshops((prev) => {
      const next = { ...prev };
      if (next[dayId] === workshopId) {
        delete next[dayId]; // Deselect if already selected
      } else {
        next[dayId] = workshopId; // Replace selection for this day
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    const workshopIds = Object.values(selectedWorkshops);

    const payload = {
      fullName,
      email,
      phone,
      collegeName,
      editionId: edition?.id,
      workshopIds,
    };

    try {
      const res = await fetchBackend("/api/v1/registration/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setSubmitError(json.error || "Registration failed");
      } else {
        setSuccessData(json.data);
      }
    } catch (err) {
      setSubmitError("Failed to submit registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return <div className="text-center py-20 text-gray-500 animate-pulse">Loading registration data...</div>;
  }

  if (errorData || !edition) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
        <p className="font-bold mb-2">Registration Currently Unavailable</p>
        <p>{errorData || "No active edition found."}</p>
      </div>
    );
  }

  if (successData) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-900 p-8 rounded-2xl shadow-sm text-center max-w-lg mx-auto">
        <h3 className="text-2xl font-bold mb-4 text-green-700">Registration Successful!</h3>
        <div className="space-y-2 mb-6 text-left bg-white p-6 rounded-xl border border-green-100">
          <p><span className="font-semibold text-gray-600">Registration ID:</span> <br/><span className="text-lg font-mono text-gray-900">{successData.registrationNumber}</span></p>
          <p><span className="font-semibold text-gray-600">Amount to Pay:</span> <br/><span className="text-lg font-bold text-gray-900">₹{successData.amount}</span></p>
          <p><span className="font-semibold text-gray-600">Status:</span> <br/><span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">{successData.status}</span></p>
        </div>
        <div className="flex flex-col gap-3 mt-6">
          <Link 
            href={`/perizia/payment/${successData.registrationNumber}`} 
            className="w-full inline-block bg-green-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-green-700 transition-all"
          >
            Proceed to Test Payment
          </Link>
          <Link href="/perizia" className="text-gray-500 hover:text-gray-700 hover:underline font-medium mt-2">
            Return to Perizia Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      
      {submitError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
          {submitError}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Personal Details</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="John Doe" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="9876543210" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
          <input required type="text" value={collegeName} onChange={e => setCollegeName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="Your College / University" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="border-b pb-2">
          <h3 className="text-xl font-bold text-gray-900">Select Workshops</h3>
          <p className="text-sm text-gray-500">You can only select one workshop per day.</p>
        </div>

        {edition.days.map((day) => {
          const dayWorkshops = edition.workshops.filter(ws => ws.periziaDayId === day.id);
          
          if (dayWorkshops.length === 0) return null;

          return (
            <div key={day.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">{day.name} <span className="text-sm text-gray-500 font-normal">({new Date(day.date).toLocaleDateString()})</span></h4>
              
              <div className="space-y-3">
                {dayWorkshops.map(ws => {
                  const isSelected = selectedWorkshops[day.id] === ws.id;
                  const isFull = ws.capacity ? ws._count.workshopRegistrations >= ws.capacity : false;

                  return (
                    <label 
                      key={ws.id} 
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                        isSelected ? "border-blue-500 bg-blue-50/50" : "border-gray-200 bg-white hover:border-gray-300"
                      } ${isFull ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name={`day-${day.id}`} 
                          checked={isSelected}
                          disabled={isFull}
                          onChange={() => handleWorkshopToggle(day.id, ws.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{ws.title}</p>
                          {isFull && <p className="text-xs text-red-600 font-semibold mt-1">Sold Out</p>}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Processing..." : "Submit Registration"}
      </button>

    </form>
  );
}
