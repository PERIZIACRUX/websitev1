import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { verifySessionCookie } from "@/lib/auth/session";
import { PaymentStatus, RegistrationStatus } from "@prisma/client";
import Link from "next/link";
import QrDisplay from "./QrDisplay";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ registrationNumber: string }>;
}) {
  const { registrationNumber } = await params;

  // 1. Authenticate via Session Cookie
  const session = await verifySessionCookie();
  
  if (!session || session.registrationNumber !== registrationNumber) {
    // If not authenticated or accessing someone else's registration, redirect to retrieve page
    redirect("/perizia/retrieve");
  }

  // 2. Fetch Registration Data
  const registration = await prisma.registration.findUnique({
    where: { registrationNumber },
    include: {
      participant: true,
      payment: true,
      workshopRegistrations: {
        include: {
          workshop: {
            include: {
              periziaDay: true,
            }
          }
        },
      },
    },
  });

  if (!registration || registration.status !== RegistrationStatus.CONFIRMED || registration.payment?.status !== PaymentStatus.PAID) {
    // Shouldn't happen if session is valid, but double check status
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Registration Not Confirmed</h1>
          <p className="text-gray-600">Your registration is not fully confirmed and paid yet.</p>
          <Link href={`/perizia/payment/${registrationNumber}`} className="mt-4 inline-block text-blue-600 hover:underline">
            Go to Payment
          </Link>
        </div>
      </main>
    );
  }

  // 3. Group Workshops by Day
  const workshopsByDay: Record<string, { name: string; date: Date; workshops: string[] }> = {};
  
  for (const wr of registration.workshopRegistrations) {
    const day = wr.workshop.periziaDay;
    if (!workshopsByDay[day.id]) {
      workshopsByDay[day.id] = {
        name: day.name,
        date: day.date,
        workshops: [],
      };
    }
    workshopsByDay[day.id].workshops.push(wr.workshop.title);
  }

  const days = Object.values(workshopsByDay).sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-green-600 p-6 sm:p-10 text-center text-white">
            <svg className="w-16 h-16 text-green-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Registration Confirmed</h1>
            <p className="text-green-100 font-medium">Thank you for registering for PERIZIA</p>
          </div>
          
          <div className="p-6 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Participant Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Registration Number</h3>
                  <p className="text-xl font-mono font-bold text-gray-900">{registration.registrationNumber}</p>
                </div>
                
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Participant</h3>
                  <p className="text-lg font-medium text-gray-900">{registration.participant.fullName}</p>
                  <p className="text-sm text-gray-600">{registration.participant.collegeName}</p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Payment</h3>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {registration.payment.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      ₹{registration.payment.amount.toString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code Display */}
              <div className="flex flex-col items-center justify-center border-l-0 md:border-l border-gray-100 pt-6 md:pt-0 pl-0 md:pl-8">
                <QrDisplay registrationNumber={registration.registrationNumber} />
              </div>
            </div>
          </div>
        </div>

        {/* Workshops Schedule */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Schedule</h2>
          
          {days.length === 0 ? (
            <p className="text-gray-500 italic">No workshops selected.</p>
          ) : (
            <div className="space-y-6">
              {days.map((day, idx) => (
                <div key={idx} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md mr-3">
                      {day.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                  </h3>
                  <ul className="space-y-2">
                    {day.workshops.map((ws, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-gray-800 font-medium">{ws}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center pb-8">
          <Link href="/perizia" className="text-gray-500 hover:text-gray-700 font-medium">
            &larr; Return to Home
          </Link>
        </div>

      </div>
    </main>
  );
}
