"use client";

import { useState, useEffect } from "react";

interface Appointment {
  id: number;
  date: string;
  time: string;
  type: string;
  status: string;
  notes: string;
  clientId: number;
  doctorId: number;
}

interface Client {
  id: number;
  name: string;
  email: string;
}

interface Doctor {
  id: number;
  name: string;
}

export default function ReceptionistDashboardClient() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filter, setFilter] = useState("all");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [newBooking, setNewBooking] = useState({
    clientId: "",
    doctorId: "",
    date: "",
    time: "",
    type: "Consultation",
    notes: "",
  });

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAppointments(data);
        }
      });

    fetch('/api/users?role=CLIENT')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setClients(data);
        }
      });

    fetch('/api/users?role=DOCTOR')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDoctors(data);
        }
      });
  }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    await fetch('/api/appointments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });

    setAppointments(prev => 
      prev.map(apt => apt.id === id ? { ...apt, status } : apt)
    );
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBooking),
    });

    setShowBookingForm(false);
    setNewBooking({ clientId: "", doctorId: "", date: "", time: "", type: "Consultation", notes: "" });
    window.location.reload();
  };

  const filteredAppointments = filter === "all" 
    ? appointments 
    : appointments.filter(apt => apt.status === filter.toUpperCase());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientName = (clientId: number) => {
    return clients.find(c => c.id === clientId)?.name || "Unknown";
  };

  const getDoctorName = (doctorId: number) => {
    return doctors.find(d => d.id === doctorId)?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Appointment Management
          </h1>
          <button
            onClick={() => setShowBookingForm(!showBookingForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            New Booking
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === status
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {showBookingForm && (
          <form onSubmit={handleCreateBooking} className="space-y-4 mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Client
                </label>
                <select
                  value={newBooking.clientId}
                  onChange={(e) => setNewBooking({ ...newBooking, clientId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Doctor
                </label>
                <select
                  value={newBooking.doctorId}
                  onChange={(e) => setNewBooking({ ...newBooking, doctorId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newBooking.date}
                  onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
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
                  value={newBooking.time}
                  onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={newBooking.type}
                onChange={(e) => setNewBooking({ ...newBooking, type: e.target.value })}
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
                value={newBooking.notes}
                onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create Booking
            </button>
          </form>
        )}

        <div className="space-y-3">
          {filteredAppointments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No appointments found.</p>
          ) : (
            filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{apt.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {apt.date} at {apt.time}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Client: {getClientName(apt.clientId)} | Doctor: {getDoctorName(apt.doctorId)}
                    </p>
                    {apt.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{apt.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                    {apt.status === "PENDING" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStatusUpdate(apt.id, "CONFIRMED")}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(apt.id, "CANCELLED")}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
