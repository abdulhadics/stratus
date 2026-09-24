'use client';

import { useState, useEffect } from 'react';
import { Calendar, Loader2, Clock, MapPin, User, FileText } from 'lucide-react';

export default function AppointmentsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch('/api/dashboard/appointments');
        const json = await res.json();
        
        if (json.success) {
          setEvents(json.events);
        } else {
          setError(json.error || 'Failed to load appointments');
        }
      } catch (err) {
        setError('A network error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-text-dimmed">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-accent" />
        <p>Loading your schedule...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">Error Loading Appointments</h3>
        <p className="text-text-dimmed max-w-md mx-auto mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Upcoming Appointments</h1>
        <p className="text-sm text-text-dimmed">Manage your schedule and upcoming meetings</p>
      </div>

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-border rounded-xl text-text-dimmed bg-bg-surface">
            No upcoming appointments scheduled.
          </div>
        ) : (
          events.map((event) => {
            const startDate = new Date(event.startTime);
            const endDate = new Date(event.endTime);
            
            return (
              <div key={event.id} className="bg-bg-surface border border-border rounded-xl p-5 shadow-sm hover:border-accent/50 transition-colors">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-lg text-text-primary mb-1">{event.title || 'Meeting'}</h3>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <div className="flex items-center text-sm text-text-dimmed">
                        <Clock className="w-4 h-4 mr-1.5 text-accent" />
                        {startDate.toLocaleDateString()} • {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center text-sm text-text-dimmed">
                          <MapPin className="w-4 h-4 mr-1.5 text-accent" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' :
                      event.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {event.status ? event.status.toUpperCase() : 'NEW'}
                    </span>
                  </div>
                </div>
                
                {event.contactId && (
                  <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex items-center text-sm text-text-dimmed">
                        <User className="w-4 h-4 mr-2" />
                        Contact ID: {event.contactId}
                     </div>
                     {event.notes && (
                       <div className="flex items-start text-sm text-text-dimmed">
                          <FileText className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                          <p className="line-clamp-2">{event.notes}</p>
                       </div>
                     )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
