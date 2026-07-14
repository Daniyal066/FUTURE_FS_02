import React, { useState, useRef, useEffect } from 'react';
import { useLeads } from '../context/LeadContext';

const SOURCES    = ['LinkedIn', 'Website Contact Form', 'Referral', 'Other'];
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function validate(fields) {
  const errs = {};
  if (!fields.name.trim() || fields.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
  if (fields.name.trim().length > 50) errs.name = 'Name cannot exceed 50 characters.';
  if (!fields.email.trim())               errs.email = 'Email is required.';
  else if (!emailRegex.test(fields.email.trim())) errs.email = 'Enter a valid email address.';
  if (fields.source === 'Other' && !fields.customSource.trim()) errs.customSource = 'Please specify the source.';
  return errs;
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-[11px] mt-1.5 font-medium text-red-600 animate-fade-in-fast">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0">
        <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm0-10a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5zm0 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      {msg}
    </p>
  );
}

function FieldSuccess({ show }) {
  if (!show) return null;
  return (
    <p className="flex items-center gap-1 text-[11px] mt-1.5 font-medium text-emerald-600 animate-fade-in-fast">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
        <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z" clipRule="evenodd" />
      </svg>
      Looks good
    </p>
  );
}

const FEATURES = [
  {
    title: 'Real-Time Validation',
    desc: 'Inline field checks prevent bad data from entering your pipeline.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-blue-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    )
  },
  {
    title: 'Duplicate Prevention',
    desc: 'Email uniqueness is enforced at client and server level.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-blue-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
      </svg>
    )
  },
  {
    title: 'Instant Pipeline Sync',
    desc: 'New leads appear immediately in the Directory and Timeline.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-blue-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    )
  }
];

export default function LeadIntakePortal() {
  const { addLead } = useLeads();

  const [fields,     setFields]     = useState({ name: '', email: '', source: 'Website Contact Form', customSource: '' });
  const [errors,     setErrors]     = useState({});
  const [touched,    setTouched]    = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const nameRef = useRef(null);

  useEffect(() => { if (nameRef.current) nameRef.current.focus(); }, []);

  const setField = (key, value) => {
    setFields(prev => ({ ...prev, [key]: value }));
    if (touched[key]) {
      const errs = validate({ ...fields, [key]: value });
      setErrors(prev => ({ ...prev, [key]: errs[key] || '' }));
    }
  };

  const handleBlur = (key) => {
    setTouched(prev => ({ ...prev, [key]: true }));
    const errs = validate(fields);
    setErrors(prev => ({ ...prev, [key]: errs[key] || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { name: true, email: true, source: true, customSource: true };
    setTouched(allTouched);
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    const { success } = await addLead({
      name: fields.name.trim(),
      email: fields.email.trim().toLowerCase(),
      source: fields.source,
      customSource: fields.source === 'Other' ? fields.customSource.trim() : '',
    });
    setSubmitting(false);

    if (success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFields({ name: '', email: '', source: 'Website Contact Form', customSource: '' });
        setErrors({});
        setTouched({});
        if (nameRef.current) nameRef.current.focus();
      }, 2200);
    }
  };

  const borderColor = (key) => {
    if (touched[key] && errors[key])             return '#EF4444';
    if (touched[key] && !errors[key] && fields[key]?.trim()) return '#10B981';
    return '#E2E8F0';
  };

  return (
    <div className="space-y-5 pb-6">

      {/* ── Page Header ── */}
      <div className="animate-fade-in">
        <h2 className="text-xl font-bold text-slate-900">Client Registration</h2>
        <p className="text-sm text-slate-500 mt-0.5">Intake new prospect leads into the central sales pipeline.</p>
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-fade-in" style={{ animationDelay: '50ms' }}>

        {/* ── Left Info Panel ── */}
        <div className="lg:col-span-2 space-y-4">
          <div
            className="bg-white border border-slate-200 rounded-xl p-5"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            {/* Brand header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Lead Intake System</h3>
                <p className="text-[10px] text-blue-600 font-semibold">AetherCRM Validation Node</p>
              </div>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              Register verified prospect details to add them to your central sales pipeline. Entries are validated and immediately visible in the directory.
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              {FEATURES.map(f => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-700">{f.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-[11px] text-slate-500 font-medium">Intake system <span className="text-emerald-600 font-semibold">active</span></span>
          </div>
        </div>

        {/* ── Right Form ── */}
        <div className="lg:col-span-3">
          <div
            className="bg-white border border-slate-200 rounded-xl overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            {/* Form header */}
            <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800">New Lead Registration</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Fields marked <span className="text-red-500">*</span> are required.</p>
            </div>

            {/* Success State */}
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-14 px-6 animate-scale-in">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                    <circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="1.5" />
                    <path d="M7.5 12l3 3 6-6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="draw-check" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-slate-900">Lead Registered!</h4>
                <p className="text-sm text-slate-500 mt-1 text-center">The prospect has been added to your pipeline.</p>
                <p className="text-[10px] text-slate-400 mt-3">Resetting form in a moment...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4">

                {/* Name */}
                <div>
                  <label htmlFor="intake-name" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="intake-name"
                    ref={nameRef}
                    type="text"
                    value={fields.name}
                    onChange={e => setField('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    disabled={submitting}
                    placeholder="e.g. Alexandra Dupont"
                    className="input-field"
                    style={{ borderColor: borderColor('name') }}
                  />
                  <FieldError msg={touched.name && errors.name} />
                  <FieldSuccess show={touched.name && !errors.name && !!fields.name.trim()} />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="intake-email" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="intake-email"
                    type="email"
                    value={fields.email}
                    onChange={e => setField('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    disabled={submitting}
                    placeholder="e.g. alexandra@company.com"
                    className="input-field"
                    style={{ borderColor: borderColor('email') }}
                  />
                  <FieldError msg={touched.email && errors.email} />
                  <FieldSuccess show={touched.email && !errors.email && !!fields.email.trim()} />
                </div>

                {/* Source */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Lead Source</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SOURCES.map(src => {
                      const isActive = fields.source === src;
                      return (
                        <button
                          key={src}
                          type="button"
                          id={`source-btn-${src.replace(/\s+/g, '-').toLowerCase()}`}
                          disabled={submitting}
                          onClick={() => setField('source', src)}
                          className="px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-all duration-150 border"
                          style={{
                            background:   isActive ? '#EFF6FF' : '#F8FAFC',
                            borderColor:  isActive ? '#93C5FD' : '#E2E8F0',
                            color:        isActive ? '#1D4ED8' : '#64748B',
                          }}
                        >
                          {src}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Source */}
                {fields.source === 'Other' && (
                  <div className="animate-slide-down">
                    <label htmlFor="intake-custom-source" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Specify Source <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="intake-custom-source"
                      type="text"
                      value={fields.customSource}
                      onChange={e => setField('customSource', e.target.value)}
                      onBlur={() => handleBlur('customSource')}
                      disabled={submitting}
                      placeholder="e.g. Dribbble, Industry Event, Cold Email..."
                      className="input-field"
                      style={{ borderColor: borderColor('customSource') }}
                    />
                    <FieldError msg={touched.customSource && errors.customSource} />
                  </div>
                )}

                <div className="border-t border-slate-100" />

                {/* ── Submit Button — corporate blue CTA ── */}
                <button
                  id="submit-lead-btn"
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Registering...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Register Lead in CRM
                    </>
                  )}
                </button>

                <p className="text-center text-[9px] text-slate-300 font-semibold tracking-widest uppercase">
                  AetherCRM · Enterprise Intake · GDPR Compliant
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
