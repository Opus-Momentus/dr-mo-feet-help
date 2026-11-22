import React, { useState } from 'react';
import { Check, Send, ShieldCheck } from 'lucide-react';

const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/mcmoandrew@gmail.com';

const PROFESSIONS = [
  'Podiatrist',
  'Chiropractor',
  'Physiotherapist',
  'Osteopath',
  'Exercise Physiologist',
  'Other Allied Health Professional',
] as const;

const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'] as const;

type FormState = {
  practiceName: string;
  contactName: string;
  profession: string;
  otherProfession: string;
  email: string;
  phone: string;
  suburb: string;
  state: string;
  postcode: string;
  website: string;
  ahpraNumber: string;
  services: string;
  notes: string;
  consent: boolean;
  honey: string;
};

const initialFormState: FormState = {
  practiceName: '',
  contactName: '',
  profession: 'Podiatrist',
  otherProfession: '',
  email: '',
  phone: '',
  suburb: '',
  state: 'NSW',
  postcode: '',
  website: '',
  ahpraNumber: '',
  services: '',
  notes: '',
  consent: false,
  honey: '',
};

export function DirectoryEnquirySection() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const resolvedProfession =
    form.profession === 'Other Allied Health Professional' && form.otherProfession.trim()
      ? `Other (${form.otherProfession.trim()})`
      : form.profession;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (form.honey) return;

    setStatus('submitting');
    setErrorMessage('');

    const payload = {
      _subject: `New Directory Listing Enquiry: ${form.practiceName.trim()}`,
      _replyto: form.email.trim(),
      _template: 'table',
      _captcha: 'false',
      'Practice Name': form.practiceName.trim(),
      'Contact Name & Role': form.contactName.trim(),
      'Profession': resolvedProfession,
      'Email': form.email.trim(),
      'Phone': form.phone.trim() || 'Not provided',
      'Suburb / City': form.suburb.trim(),
      'State': form.state,
      'Postcode': form.postcode.trim(),
      'Website': form.website.trim() || 'Not provided',
      'Ahpra Registration': form.ahpraNumber.trim() || 'Not provided',
      'Services & Focus Areas': form.services.trim(),
      'Additional Notes': form.notes.trim() || 'None',
    };

    try {
      const response = await fetch(FORMSUBMIT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || (data && data.success === 'false')) {
        throw new Error(data?.message || 'Unable to send enquiry right now.');
      }

      setStatus('success');
      setForm(initialFormState);
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error && err.message
          ? err.message
          : 'We could not send your enquiry right now. Please check your connection and try again.'
      );
    }
  }

  return (
    <section className="enquiry-band" id="list-your-practice" aria-labelledby="enquiry-heading">
      <div className="wrap enquiry-grid">
        <div className="enquiry-copy">
          <div className="section-label">
            <i /> FOR AUSTRALIAN PRACTITIONERS
          </div>
          <h2 id="enquiry-heading">
            Help patients find care <em>closer to home.</em>
          </h2>
          <p className="enquiry-lead">
            When someone is dealing with sore feet, stubborn heel pain, or a lower back that aches by midday, finding a clinician who looks at how the whole body moves can be a real turning point.
          </p>
          <p>
            Our directory connects Australians with podiatrists, chiropractors, physiotherapists, osteopaths, and allied health professionals who understand the link between foot mechanics and spinal comfort. If your practice would like to be included, send us your details below.
          </p>

          <ul className="enquiry-highlights">
            <li>
              <Check size={16} aria-hidden="true" />
              <span>Open to podiatrists, chiropractors, physiotherapists, osteopaths, and allied health clinics across Australia</span>
            </li>
            <li>
              <Check size={16} aria-hidden="true" />
              <span>Share your location, areas of clinical focus, and how patients can reach your team</span>
            </li>
            <li>
              <Check size={16} aria-hidden="true" />
              <span>Every submission is reviewed by our editorial team before being added to the directory</span>
            </li>
          </ul>

          <div className="enquiry-note">
            <ShieldCheck size={18} aria-hidden="true" />
            <p>
              All completed enquiries are sent directly to our directory team. Where relevant, please include your clinic&apos;s Ahpra registration details so we can keep public practice information accurate.
            </p>
          </div>
        </div>

        <div className="enquiry-card">
          {status === 'success' ? (
            <div className="enquiry-success" role="status" aria-live="polite">
              <span className="enquiry-success-icon">
                <Check size={24} />
              </span>
              <span className="card-kicker">ENQUIRY RECEIVED</span>
              <h3>Thank you for getting in touch.</h3>
              <p>
                Your practice details have been sent to our directory team. We review every Australian clinic enquiry individually and will follow up by email if we need any extra details before listing.
              </p>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setStatus('idle')}
              >
                Submit another enquiry
              </button>
            </div>
          ) : (
            <form className="enquiry-form" onSubmit={handleSubmit}>
              <div className="enquiry-card-header">
                <span className="card-kicker">DIRECTORY LISTING ENQUIRY</span>
                <h3>Tell us about your practice</h3>
                <p>Complete the form below and we will review your clinic for inclusion.</p>
              </div>

              {/* Honeypot field to deter automated spam */}
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="enquiry-honey">Leave this field blank</label>
                <input
                  id="enquiry-honey"
                  type="text"
                  name="_honey"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.honey}
                  onChange={e => updateField('honey', e.target.value)}
                />
              </div>

              <div className="form-row form-row-2">
                <div className="form-field">
                  <label htmlFor="practice-name">
                    Practice or business name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="practice-name"
                    type="text"
                    required
                    placeholder="e.g. Harbourside Podiatry Clinic"
                    value={form.practiceName}
                    onChange={e => updateField('practiceName', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="contact-name">
                    Your name &amp; role <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="e.g. Dr Sam Taylor, Principal"
                    value={form.contactName}
                    onChange={e => updateField('contactName', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row form-row-2">
                <div className="form-field">
                  <label htmlFor="profession">
                    Discipline / profession <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id="profession"
                    required
                    value={form.profession}
                    onChange={e => updateField('profession', e.target.value)}
                  >
                    {PROFESSIONS.map(prof => (
                      <option key={prof} value={prof}>
                        {prof}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="contact-email">
                    Practice email <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="e.g. reception@yourclinic.com.au"
                    value={form.email}
                    onChange={e => updateField('email', e.target.value)}
                  />
                </div>
              </div>

              {form.profession === 'Other Allied Health Professional' && (
                <div className="form-field">
                  <label htmlFor="other-profession">
                    Please specify your discipline <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="other-profession"
                    type="text"
                    required
                    placeholder="e.g. Myotherapist, Sports Physician, Pedorthist"
                    value={form.otherProfession}
                    onChange={e => updateField('otherProfession', e.target.value)}
                  />
                </div>
              )}

              <div className="form-row form-row-3">
                <div className="form-field">
                  <label htmlFor="suburb">
                    Suburb / city <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="suburb"
                    type="text"
                    required
                    placeholder="e.g. Essendon"
                    value={form.suburb}
                    onChange={e => updateField('suburb', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="state">
                    State / territory <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id="state"
                    required
                    value={form.state}
                    onChange={e => updateField('state', e.target.value)}
                  >
                    {AU_STATES.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="postcode">
                    Postcode <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="postcode"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    required
                    placeholder="e.g. 3040"
                    value={form.postcode}
                    onChange={e => updateField('postcode', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row form-row-2">
                <div className="form-field">
                  <label htmlFor="phone">Phone number</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="e.g. (03) 9000 0000"
                    value={form.phone}
                    onChange={e => updateField('phone', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="website">Practice website</label>
                  <input
                    id="website"
                    type="text"
                    placeholder="www.yourclinic.com.au"
                    value={form.website}
                    onChange={e => updateField('website', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="ahpra-number">Ahpra registration number (if applicable)</label>
                <input
                  id="ahpra-number"
                  type="text"
                  placeholder="Optional — helps us verify registered practitioners"
                  value={form.ahpraNumber}
                  onChange={e => updateField('ahpraNumber', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="services">
                  Key services &amp; areas of focus <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="services"
                  rows={3}
                  required
                  placeholder="e.g. Gait analysis, custom orthotics, lower back & kinetic chain assessment, footwear advice..."
                  value={form.services}
                  onChange={e => updateField('services', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="notes">Anything else you&apos;d like us to know?</label>
                <textarea
                  id="notes"
                  rows={2}
                  placeholder="Optional — opening hours, multiple clinic locations, or referral notes."
                  value={form.notes}
                  onChange={e => updateField('notes', e.target.value)}
                />
              </div>

              <label className="form-consent">
                <input
                  type="checkbox"
                  required
                  checked={form.consent}
                  onChange={e => updateField('consent', e.target.checked)}
                />
                <span>
                  I confirm I am authorised to submit this enquiry on behalf of the practice, and understand that directory inclusion is subject to review.
                </span>
              </label>

              {status === 'error' && (
                <div className="enquiry-error" role="alert">
                  <p>{errorMessage}</p>
                </div>
              )}

              <div className="enquiry-actions">
                <button className="btn btn-dark" type="submit" disabled={status === 'submitting'}>
                  {status === 'submitting' ? 'Sending enquiry...' : 'Submit listing enquiry'}
                  <Send size={15} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
