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
  clientId: number;
}

interface Client {
  id: number;
  name: string;
  email: string;
}

interface TreatmentRecord {
  id: number;
  clientId: number;
  diagnosis: string;
  treatment: string;
  prescription: string;
  notes: string;
  createdAt: string;
}

export default function DoctorDashboardClient({ doctorId }: { doctorId: string }) {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [treatmentHistory, setTreatmentHistory] = useState<TreatmentRecord[]>([]);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [newRecord, setNewRecord] = useState({
    diagnosis: "",
    treatment: "",
    prescription: "",
    notes: "",
  });

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const today = new Date().toISOString().split("T")[0];
          const todayAppointments = data.filter((apt: Appointment) => apt.date === today);
          setAppointments(todayAppointments);
        }
      });

    fetch('/api/users?role=CLIENT')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setClients(data);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetch(`/api/treatment-history?clientId=${selectedClient}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setTreatmentHistory(data);
          }
        });
    }
  }, [selectedClient]);

  const handleAddTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await fetch('/api/treatment-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: selectedClient,
        ...newRecord,
      }),
    });

    setShowTreatmentForm(false);
    setNewRecord({ diagnosis: "", treatment: "", prescription: "", notes: "" });
    
    // Refresh treatment history
    if (selectedClient) {
      fetch(`/api/treatment-history?clientId=${selectedClient}`)
        .then(res => res.json())
        .then(data => setTreatmentHistory(data));
    }
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Today's Schedule
        </h1>

        {appointments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No appointments scheduled for today.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{apt.time} - {apt.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Client ID: {apt.clientId}
                    </p>
                    {apt.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{apt.notes}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Clients & Treatment History
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Client
            </h3>
            <div className="space-y-2">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    selectedClient === client.id
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {client.name}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedClient ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Treatment History
                  </h3>
                  <button
                    onClick={() => setShowTreatmentForm(!showTreatmentForm)}
                    className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Add Record
                  </button>
                </div>

                {showTreatmentForm && (
                  <form onSubmit={handleAddTreatment} className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <input
                      type="text"
                      placeholder="Diagnosis"
                      value={newRecord.diagnosis}
                      onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Treatment"
                      value={newRecord.treatment}
                      onChange={(e) => setNewRecord({ ...newRecord, treatment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Prescription"
                      value={newRecord.prescription}
                      onChange={(e) => setNewRecord({ ...newRecord, prescription: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                    <textarea
                      placeholder="Notes"
                      value={newRecord.notes}
                      onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Save Record
                    </button>
                  </form>
                )}

                <div className="space-y-2">
                  {treatmentHistory.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No treatment history.</p>
                  ) : (
                    treatmentHistory.map((record) => (
                      <div
                        key={record.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.diagnosis || "No diagnosis"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {record.treatment || "No treatment specified"}
                        </p>
                        {record.prescription && (
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            Rx: {record.prescription}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Select a client to view treatment history.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
