import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const LeadContext = createContext();

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
};

export const LeadProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const clearToast = () => setToast(null);

  const getLeadsList = async () => {
    setLoading(true);
    const { data, error: apiError } = await api.get('/leads');
    if (apiError) {
      setError(apiError);
      showToast(apiError, 'error');
    } else {
      setLeads(data);
      setError('');
    }
    setLoading(false);
  };

  const addLead = async (leadData) => {
    const { data, error: apiError } = await api.post('/leads', leadData);
    if (apiError) {
      showToast(apiError, 'error');
      return { success: false, error: apiError };
    } else {
      setLeads((prev) => [data, ...prev]);
      showToast('Client lead registered successfully.');
      return { success: true };
    }
  };

  const editLead = async (id, updateData) => {
    const { data, error: apiError } = await api.put(`/leads/${id}`, updateData);
    if (apiError) {
      showToast(apiError, 'error');
      return { success: false, error: apiError };
    } else {
      setLeads((prev) => prev.map((lead) => (lead._id === id ? data : lead)));
      if (updateData.note) {
        showToast('Interaction note logged successfully.');
      } else if (updateData.status) {
        showToast(`Lead state progressed to: ${updateData.status}`);
      } else {
        showToast('Lead details updated.');
      }
      return { success: true };
    }
  };

  const removeLead = async (id) => {
    const { error: apiError } = await api.delete(`/leads/${id}`);
    if (apiError) {
      showToast(apiError, 'error');
      return { success: false, error: apiError };
    } else {
      setLeads((prev) => prev.filter((lead) => lead._id !== id));
      showToast('Lead removed from CRM database.');
      return { success: true };
    }
  };

  // Auto-dismiss toast helper
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    getLeadsList();
  }, []);

  return (
    <LeadContext.Provider
      value={{
        leads,
        loading,
        error,
        toast,
        showToast,
        clearToast,
        getLeadsList,
        addLead,
        editLead,
        removeLead
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};
