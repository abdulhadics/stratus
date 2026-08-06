'use client';

import { useState } from 'react';

export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    tradeType: 'HVAC',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          market: 'US',
          language: 'en',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join waitlist');
      }

      setStatus('success');
      setMessage("You're on the list! We'll be in touch soon.");
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-500/30">
      <main className="max-w-3xl mx-auto px-6 py-20 flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300 mb-8 shadow-sm shadow-blue-900/20">
          <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
          Waitlist Open
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Scale Your Trade Business
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Join the exclusive waitlist for our next-generation CRM designed specifically for home service professionals. Secure your spot today.
          </p>
        </div>

        {/* Form Section */}
        <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-6">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Thank You!</h3>
              <p className="text-gray-400">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  required
                  className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-gray-100 placeholder-gray-600"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-gray-100 placeholder-gray-600"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  required
                  className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-gray-100 placeholder-gray-600"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-300 mb-1.5">Business Name</label>
                <input
                  type="text"
                  id="businessName"
                  required
                  className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-gray-100 placeholder-gray-600"
                  placeholder="Doe Plumbing"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="tradeType" className="block text-sm font-medium text-gray-300 mb-1.5">Trade Type</label>
                <select
                  id="tradeType"
                  className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-gray-100 appearance-none"
                  value={formData.tradeType}
                  onChange={(e) => setFormData({ ...formData, tradeType: e.target.value })}
                >
                  <option value="HVAC">HVAC</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {status === 'error' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 px-4 bg-white text-gray-950 font-semibold rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-white/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-6"
              >
                {status === 'loading' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Securing Spot...
                  </>
                ) : (
                  'Join Waitlist'
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
