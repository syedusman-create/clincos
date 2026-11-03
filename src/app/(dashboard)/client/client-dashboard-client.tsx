"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Appointment {
  id: number;
  date: string;
  time: string;
  type: string;
  status: string;
  notes: string;
}

interface TreatmentRecord {
  id: number;
  diagnosis: string;
  treatment: string;
  prescription: string;
  notes: string;
  createdAt: string;
  doctorId: number;
}

interface Doctor {
  id: number;
  name: string;
}

export default function ClientDashboardClient({ clientId }: { clientId: string }) {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [treatmentHistory, setTreatmentHistory] = useState<TreatmentRecord[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    time: "",
    type: "Consultation",
    notes: "",
  });
  const [activeTab, setActiveTab] = useState<'appointments' | 'history'>('appointments');

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAppointments(data);
        }
      });

    fetch(`/api/treatment-history?clientId=${clientId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTreatmentHistory(data);
        }
      });

    fetch('/api/users?role=DOCTOR')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDoctors(data);
        }
      });
  }, [clientId]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        clientId: parseInt(clientId)
      })
    });

    setShowBookingForm(false);
    setFormData({ doctorId: '', date: '', time: '', type: 'Consultation', notes: '' });
    window.location.reload();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Appointments
          </h1>
          <button
            onClick={() => setShowBookingForm(!showBookingForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Book Appointment
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-2 px-4 ${activeTab === 'appointments' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-4 ${activeTab === 'history' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
          >
            Treatment History
          </button>
        </div>

        {showBookingForm && (
          <form onSubmit={handleBooking} className="space-y-4 mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Doctor
              </label>
              <select
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a doctor</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Book Appointment
            </button>
          </form>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No appointments yet.</p>
            ) : (
              appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{apt.type}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{apt.date} at {apt.time}</p>
                      {apt.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{apt.notes}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {treatmentHistory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No treatment history yet.</p>
            ) : (
              treatmentHistory.map((record) => (
                <div
                  key={record.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Treatment Record
                    </p>
                    <span className="text-sm text-gray-500">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {record.diagnosis && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Diagnosis:</strong> {record.diagnosis}
                    </p>
                  )}
                  {record.treatment && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Treatment:</strong> {record.treatment}
                    </p>
                  )}
                  {record.prescription && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Prescription:</strong> {record.prescription}
                    </p>
                  )}
                  {record.notes && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{record.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
