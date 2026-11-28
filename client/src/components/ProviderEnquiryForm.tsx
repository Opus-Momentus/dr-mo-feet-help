import React, { useState } from 'react';
import { Calendar, Check, Send } from 'lucide-react';
import type { Provider } from '../data/providers';
import { trackEvent } from '../utils/analytics';

const ENQUIRY_ENDPOINT =
  import.meta.env?.VITE_ENQUIRY_ENDPOINT || 'https://formsubmit.co/ajax/mcmoandrew@gmail.com';

export function ProviderEnquiryForm({ provider }: { provider: Provider }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('Foot & lower back assessment');
  const [notes, setNotes] = useState('');
  const [honey, setHoney] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (honey) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch(ENQUIRY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `Patient Appointment Enquiry for ${provider.name} (${provider.city || provider.state})`,
          _replyto: email.trim(),
          _template: 'table',
          _captcha: 'false',
          'Enquiry Type': 'Patient Appointment / Callback Request',
          'Target Practice': provider.name,
          'Practice Slug': provider.slug,
          'Practice Location': [provider.city, provider.state, provider.postcode].filter(Boolean).join(', '),
          'Patient Name': name.trim(),
          'Patient Email': email.trim(),
          'Patient Phone': phone.trim() || 'Not provided',
          'Primary Reason': reason,
          'Notes': notes.trim() || 'None',
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || (data && data.success === 'false')) {
        throw new Error(data?.message || 'Unable to send your request right now.');
      }

      trackEvent('provider_lead_submitted', {
        provider_slug: provider.slug,
        provider_name: provider.name,
        provider_type: provider.type,
        provider_state: provider.state,
        reason,
      });

      setStatus('success');
      setName('');
      setEmail('');
      setPhone('');
      setNotes('');
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error && err.message
          ? err.message
          : 'Could not send your request right now. Please try calling the practice directly.'
      );
    }
  }

  return (
    <section className="provider-lead-box" aria-labelledby="patient-enquiry-heading">
      <span className="card-kicker">
        <Calendar size={13} aria-hidden="true" /> REQUEST A CALLBACK OR APPOINTMENT
      </span>
      <h3 id="patient-enquiry-heading">Enquire with {provider.name}</h3>
      <p className="provider-lead-intro">
        Looking for an assessment? Send an appointment enquiry and our directory team will forward your request or connect you with the clinic.
      </p>

      {status === 'success' ? (
        <div className="enquiry-success" role="status" aria-live="polite">
          <span className="enquiry-success-icon">
            <Check size={22} />
          </span>
          <h4>Enquiry sent</h4>
          <p>
            Thank you. Your appointment request for {provider.name} has been received. For urgent bookings, please also call the clinic directly.
          </p>
          <button type="button" className="btn btn-outline" onClick={() => setStatus('idle')}>
            Send another request
          </button>
        </div>
      ) : (
        <form className="enquiry-form" onSubmit={handleSubmit}>
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="lead-honey">Leave blank</label>
            <input
              id="lead-honey"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honey}
              onChange={e => setHoney(e.target.value)}
            />
          </div>

          <div className="form-row form-row-2">
            <div className="form-field">
              <label htmlFor="lead-name">
                Your name <span aria-hidden="true">*</span>
              </label>
              <input
                id="lead-name"
                type="text"
                required
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="lead-phone">Phone number</label>
              <input
                id="lead-phone"
                type="tel"
                placeholder="e.g. 0400 000 000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row form-row-2">
            <div className="form-field">
              <label htmlFor="lead-email">
                Email address <span aria-hidden="true">*</span>
              </label>
              <input
                id="lead-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="lead-reason">Primary focus</label>
              <select id="lead-reason" value={reason} onChange={e => setReason(e.target.value)}>
                <option>Foot &amp; lower back assessment</option>
                <option>Heel or arch pain</option>
                <option>Orthotics / gait analysis</option>
                <option>Sciatica or nerve symptoms</option>
                <option>General podiatry / chiropractic</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="lead-notes">Preferred days or brief notes</label>
            <textarea
              id="lead-notes"
              rows={2}
              placeholder="Optional — e.g. morning appointments preferred"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {status === 'error' && (
            <div className="enquiry-error" role="alert">
              <p>{errorMessage}</p>
            </div>
          )}

          <div className="enquiry-actions">
            <button className="btn btn-dark" type="submit" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Sending...' : 'Request callback'} <Send size={15} />
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
