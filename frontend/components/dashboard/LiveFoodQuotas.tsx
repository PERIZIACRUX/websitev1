"use client";

import { useEffect, useState } from "react";

interface FoodQuota {
  id: string;
  periziaDayId: string;
  mealType: "BREAKFAST" | "LUNCH";
  totalAllocated: number;
  givenCount: number;
  periziaDay: {
    id: string;
    dayNumber: number;
    name: string;
    date: string;
  };
}

export function LiveFoodQuotas() {
  const [quotas, setQuotas] = useState<FoodQuota[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotas = async () => {
    try {
      const res = await fetch("/api/v1/staff/dashboard/food-quotas");
      if (res.ok) {
        const json = await res.json();
        setQuotas(json.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch food quotas", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotas();
    const interval = setInterval(fetchQuotas, 10000); // Polling every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-gray-500 text-sm">Loading live food quotas...</div>;
  }

  if (quotas.length === 0) {
    return <div className="text-gray-500 text-sm">No active food quotas configured.</div>;
  }

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Live Food Quotas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quotas.map((quota) => {
          const remaining = quota.totalAllocated - quota.givenCount;
          const percentage = quota.totalAllocated > 0 ? (quota.givenCount / quota.totalAllocated) * 100 : 0;
          
          return (
            <div key={quota.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">
                  Day {quota.periziaDay.dayNumber} {quota.mealType === "BREAKFAST" ? "🍳 Breakfast" : "🍱 Lunch"}
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Allocated</span>
                  <span className="font-medium">{quota.totalAllocated}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Given</span>
                  <span className="font-medium text-emerald-600">{quota.givenCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Remaining</span>
                  <span className="font-medium text-amber-600">{remaining}</span>
                </div>
                
                {/* Progress bar */}
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
