'use client';

import React, { useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  dateAdded: string;
  tags: string[];
  customFields?: { id: string; name?: string; value: string }[];
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedContact, setExpandedContact] = useState<string | null>(null);

  // GHL Custom Field IDs
  const REVENUE_FIELD_ID = 'reutlLeT0xTUvh2Elfvf';
  const VOLUME_FIELD_ID = 'jBdzZMRHGHOpMYTqCcKw';
  const FRUSTRATION_FIELD_ID = 'CUZAgurvt5GYgk8uGqPB';

  const toggleExpand = (id: string) => {
    setExpandedContact(expandedContact === id ? null : id);
  };

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch('/api/dashboard/contacts');
        const data = await res.json();
        
        if (data.success) {
          setContacts(data.contacts);
        } else {
          setError(data.error || 'Failed to load contacts');
        }
      } catch (err) {
        setError('A network error occurred while fetching contacts.');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(contact => {
    const searchString = `${contact.firstName} ${contact.lastName} ${contact.email} ${contact.phone}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Contacts</h1>
          <p className="text-sm text-text-dimmed">Manage your leads and clients pulled directly from STRATUS CRM.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-dimmed" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-bg-surface text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-surface shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-text-dimmed">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-accent" />
            <p>Loading your contacts from GHL...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-500 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">Error Loading Contacts</h3>
            <p className="text-text-dimmed mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-dimmed uppercase bg-bg-elevated border-b border-border">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Name</th>
                  <th scope="col" className="px-6 py-4 font-medium">Email / Phone</th>
                  <th scope="col" className="px-6 py-4 font-medium">Source</th>
                  <th scope="col" className="px-6 py-4 font-medium">Date Added</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => {
                    const isExpanded = expandedContact === contact.id;
                    
                    // Extract fields safely
                    const revenueStr = contact.customFields?.find((f) => f.id === REVENUE_FIELD_ID)?.value 
                      || contact.customFields?.find((f) => {
                           const val = String(f.value || '').toLowerCase();
                           return val.length < 20 && (val.includes('$') || val.includes('000') || val.match(/<|>|\d+k/));
                         })?.value || 'N/A';
                    
                    const volumeStr = contact.customFields?.find((f) => f.id === VOLUME_FIELD_ID)?.value 
                      || contact.customFields?.find((f) => {
                           const val = String(f.value || '').toLowerCase();
                           return val.length < 20 && (val.includes('call') || val.includes('week') || val.match(/\d+-\d+/));
                         })?.value || 'N/A';
                    
                    const frustrationStr = contact.customFields?.find((f) => f.id === FRUSTRATION_FIELD_ID)?.value 
                      || contact.customFields?.find((f) => {
                           const val = String(f.value || '').toLowerCase();
                           return val.length > 50 && !val.includes('http');
                         })?.value || 'N/A';

                    return (
                    <React.Fragment key={contact.id}>
                      <tr 
                        onClick={() => toggleExpand(contact.id)}
                        className={`hover:bg-bg-elevated/50 transition-colors cursor-pointer ${isExpanded ? 'bg-bg-elevated/30' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                              {(contact.firstName?.[0] || '')}{(contact.lastName?.[0] || '')}
                            </div>
                            <div>
                              <div className="font-medium text-text-primary">{contact.firstName} {contact.lastName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-text-primary">{contact.email}</div>
                          <div className="text-xs text-text-dimmed">{contact.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-text-dimmed">
                          {contact.source}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-text-dimmed">
                          {contact.dateAdded}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-1 justify-end flex-wrap">
                            {contact.tags.slice(0, 2).map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium bg-bg-elevated border border-border text-text-dimmed uppercase tracking-wider">
                                {tag}
                              </span>
                            ))}
                            {contact.tags.length > 2 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-bg-elevated border border-border text-text-dimmed">
                                +{contact.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-bg-elevated/20 border-b border-border">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-lg bg-bg-surface border border-border">
                              <div>
                                <h4 className="text-xs font-semibold text-text-dimmed uppercase mb-1">Revenue / Size</h4>
                                <p className="text-sm text-text-primary font-medium">{revenueStr !== 'N/A' ? revenueStr : 'Not provided'}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-text-dimmed uppercase mb-1">Lead Volume</h4>
                                <p className="text-sm text-text-primary font-medium">{volumeStr !== 'N/A' ? volumeStr : 'Not provided'}</p>
                              </div>
                              <div className="md:col-span-3">
                                <h4 className="text-xs font-semibold text-text-dimmed uppercase mb-1">Biggest Frustration</h4>
                                <p className="text-sm text-text-primary italic border-l-2 border-accent/50 pl-3 py-1">"{frustrationStr !== 'N/A' ? frustrationStr : 'Not provided'}"</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )})
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-dimmed">
                      No contacts found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
