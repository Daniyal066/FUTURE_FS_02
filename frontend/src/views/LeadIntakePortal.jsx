import React from 'react';
import LeadForm from '../components/LeadForm';

export default function LeadIntakePortal() {
  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center py-6 select-none">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Client Registration</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Input verified prospect details to add them to the central sales funnel pipeline.
          </p>
        </div>

        {/* Lead Intake Form */}
        <LeadForm />

        <div className="text-[10px] text-center text-slate-500 font-semibold tracking-wider uppercase">
          AetherCRM Intake Validation Node
        </div>
      </div>
    </div>
  );
}
