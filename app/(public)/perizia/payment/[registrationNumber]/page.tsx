import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import PaymentClient from "./PaymentClient";

export default async function TestPaymentPage({
  params,
}: {
  params: Promise<{ registrationNumber: string }>;
}) {
  const { registrationNumber } = await params;

  // Fetch registration securely on the server
  const registration = await prisma.registration.findUnique({
    where: { registrationNumber },
    include: {
      payment: true,
      participant: true,
    }
  });

  if (!registration || !registration.payment) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Payment Gateway</h1>
        <p className="text-gray-500 mb-6">This is a simulated payment gateway for testing.</p>

        <div className="bg-blue-50 text-blue-900 p-4 rounded-xl text-left mb-8 border border-blue-100">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-1">Order Details</p>
          <div className="flex justify-between items-end">
            <div>
              <p className="font-medium">{registration.participant.fullName}</p>
              <p className="text-sm opacity-80">{registration.registrationNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">₹{registration.payment.amount.toString()}</p>
            </div>
          </div>
        </div>

        <PaymentClient 
          registrationNumber={registrationNumber}
          initialPaymentStatus={registration.payment.status}
          initialRegistrationStatus={registration.status}
        />
      </div>
    </div>
  );
}
