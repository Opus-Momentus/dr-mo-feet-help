import React, { useState } from 'react';
import { ArrowDown, Check, FileText, Globe, Image, Phone, Send, ShieldCheck } from 'lucide-react';

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

const CLAIM_EDIT_OPTIONS = [
  'Practice description',
  'Phone number',
  'Pictures / photos',
  'Website link',
  'Address or hours',
] as const;

type EnquiryType = 'new' | 'claim';

type FormState = {
  enquiryType: EnquiryType;
  existingListingRef: string;
  claimUpdates: string[];
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
  enquiryType: 'new',
  existingListingRef: '',
  claimUpdates: [],
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

  const toggleClaimUpdate = (item: string) => {
    setForm(prev => ({
      ...prev,
      claimUpdates: prev.claimUpdates.includes(item)
        ? prev.claimUpdates.filter(x => x !== item)
        : [...prev.claimUpdates, item],
    }));
  };

  const startClaimFlow = () => {
    setStatus('idle');
    setForm(prev => ({ ...prev, enquiryType: 'claim' }));
    const el = document.getElementById('list-your-practice');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const resolvedProfession =
    form.profession === 'Other Allied Health Professional' && form.otherProfession.trim()
      ? `Other (${form.otherProfession.trim()})`
      : form.profession;

  const isClaim = form.enquiryType === 'claim';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (form.honey) return;

    setStatus('submitting');
    setErrorMessage('');

    const payload = {
      _subject: isClaim
        ? `Claim Directory Listing Request: ${form.practiceName.trim()}`
        : `New Directory Listing Enquiry: ${form.practiceName.trim()}`,
      _replyto: form.email.trim(),
      _template: 'table',
      _captcha: 'false',
      'Enquiry Type': isClaim ? 'Claim an existing listing' : 'New directory listing',
      ...(isClaim
        ? {
            'Existing Listing Reference': form.existingListingRef.trim() || form.practiceName.trim(),
            'Information to Update':
              form.claimUpdates.length > 0 ? form.claimUpdates.join(', ') : 'Not specified',
          }
        : {}),
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
      [isClaim ? 'Requested Description / Service Updates' : 'Services & Focus Areas']:
        form.services.trim() || 'Not provided',
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
    <>
      <section className="claim-band" id="claim-listing" aria-labelledby="claim-heading">
        <div className="wrap claim-grid">
          <div className="claim-copy">
            <div className="section-label">
              <i /> ALREADY IN THE DIRECTORY?
            </div>
            <h2 id="claim-heading">
              Claim and update <em>your practice listing.</em>
            </h2>
            <p className="claim-lead">
              Many of our initial directory entries are compiled from publicly available practice information. If your clinic already appears on footbackpain, you can claim your business listing by contacting us through the enquiry form below.
            </p>
            <p>
              Once your listing is claimed and verified with our team, you can request updates whenever your clinic details change—so patients always see accurate, helpful information before they reach out.
            </p>
            <button type="button" className="btn btn-dark" onClick={startClaimFlow}>
              Claim your listing <ArrowDown size={15} />
            </button>
          </div>

          <div className="claim-features">
            <span className="card-kicker">WHAT YOU CAN EDIT ONCE CLAIMED</span>
            <div className="claim-feature-grid">
              <div className="claim-feature-item">
                <span className="claim-feature-icon"><FileText size={18} aria-hidden="true" /></span>
                <div>
                  <h3>Descriptions</h3>
                  <p>Refine how your practice, clinical approach, and areas of focus are introduced.</p>
                </div>
              </div>
              <div className="claim-feature-item">
                <span className="claim-feature-icon"><Phone size={18} aria-hidden="true" /></span>
                <div>
                  <h3>Phone numbers</h3>
                  <p>Keep your reception phone number and patient contact details current.</p>
                </div>
              </div>
              <div className="claim-feature-item">
                <span className="claim-feature-icon"><Image size={18} aria-hidden="true" /></span>
                <div>
                  <h3>Pictures</h3>
                  <p>Add or update photos of your clinic, treatment spaces, or practitioner team.</p>
                </div>
              </div>
              <div className="claim-feature-item">
                <span className="claim-feature-icon"><Globe size={18} aria-hidden="true" /></span>
                <div>
                  <h3>Website</h3>
                  <p>Ensure patients are linked directly to your current website or booking page.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              Our directory connects Australians with podiatrists, chiropractors, physiotherapists, osteopaths, and allied health professionals who understand the link between foot mechanics and spinal comfort. Whether you would like to add a new practice or claim an existing listing, send us your details below.
            </p>

            <ul className="enquiry-highlights">
              <li>
                <Check size={16} aria-hidden="true" />
                <span>Open to podiatrists, chiropractors, physiotherapists, osteopaths, and allied health clinics across Australia</span>
              </li>
              <li>
                <Check size={16} aria-hidden="true" />
                <span>Submit a new clinic or claim an existing listing to update descriptions, phone numbers, pictures, and website links</span>
              </li>
              <li>
                <Check size={16} aria-hidden="true" />
                <span>Every submission is reviewed by our editorial team before changes are published</span>
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
                  Your practice details have been sent to our directory team. We review every Australian clinic enquiry individually and will follow up by email to confirm your listing or requested updates.
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
                  <h3>{isClaim ? 'Claim your existing listing' : 'Tell us about your practice'}</h3>
                  <p>
                    {isClaim
                      ? 'Confirm your practice details and let us know what you would like to update.'
                      : 'Complete the form below and we will review your clinic for inclusion.'}
                  </p>
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

                <fieldset className="enquiry-type-fieldset">
                  <legend>What would you like to do?</legend>
                  <div className="enquiry-type-options">
                    <label className={`enquiry-type-option ${!isClaim ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="enquiryType"
                        value="new"
                        checked={!isClaim}
                        onChange={() => updateField('enquiryType', 'new')}
                      />
                      <div>
                        <strong>Add a new listing</strong>
                        <span>Submit a practice not yet in the directory</span>
                      </div>
                    </label>
                    <label className={`enquiry-type-option ${isClaim ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="enquiryType"
                        value="claim"
                        checked={isClaim}
                        onChange={() => updateField('enquiryType', 'claim')}
                      />
                      <div>
                        <strong>Claim an existing listing</strong>
                        <span>Verify ownership &amp; update descriptions, phone, pictures or website</span>
                      </div>
                    </label>
                  </div>
                </fieldset>

                {isClaim && (
                  <div className="claim-form-box">
                    <div className="form-field">
                      <label htmlFor="existing-listing-ref">
                        Existing listing name or page URL <span aria-hidden="true">*</span>
                      </label>
                      <input
                        id="existing-listing-ref"
                        type="text"
                        required
                        placeholder="e.g. Podiatry First or /directory/podiatry-first-sydney"
                        value={form.existingListingRef}
                        onChange={e => updateField('existingListingRef', e.target.value)}
                      />
                    </div>
                    <div className="claim-checkboxes">
                      <span className="claim-checkboxes-label">Which details would you like to edit?</span>
                      <div className="claim-checkbox-grid">
                        {CLAIM_EDIT_OPTIONS.map(option => (
                          <label key={option} className="claim-checkbox-item">
                            <input
                              type="checkbox"
                              checked={form.claimUpdates.includes(option)}
                              onChange={() => toggleClaimUpdate(option)}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

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
                    {isClaim ? 'Updated description or services' : 'Key services & areas of focus'}{' '}
                    {!isClaim && <span aria-hidden="true">*</span>}
                  </label>
                  <textarea
                    id="services"
                    rows={3}
                    required={!isClaim}
                    placeholder={
                      isClaim
                        ? 'Share any new description text, updated services, or links to clinic pictures you would like added...'
                        : 'e.g. Gait analysis, custom orthotics, lower back & kinetic chain assessment, footwear advice...'
                    }
                    value={form.services}
                    onChange={e => updateField('services', e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="notes">Anything else you&apos;d like us to know?</label>
                  <textarea
                    id="notes"
                    rows={2}
                    placeholder={
                      isClaim
                        ? 'Optional — e.g. details for sending clinic photos, or preferred verification contact.'
                        : 'Optional — opening hours, multiple clinic locations, or referral notes.'
                    }
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
                    {isClaim
                      ? 'I confirm I am authorised to claim and request updates for this listing on behalf of the practice.'
                      : 'I confirm I am authorised to submit this enquiry on behalf of the practice, and understand that directory inclusion is subject to review.'}
                  </span>
                </label>

                {status === 'error' && (
                  <div className="enquiry-error" role="alert">
                    <p>{errorMessage}</p>
                  </div>
                )}

                <div className="enquiry-actions">
                  <button className="btn btn-dark" type="submit" disabled={status === 'submitting'}>
                    {status === 'submitting'
                      ? 'Sending enquiry...'
                      : isClaim
                        ? 'Submit claim request'
                        : 'Submit listing enquiry'}
                    <Send size={15} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
