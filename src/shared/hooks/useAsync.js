import { useState, useEffect, useCallback, useRef } from 'react';

const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);
  
  // Keep track of mounted state to prevent state updates on unmounted component
  const mountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args) => {
    if (!mountedRef.current) return;
    
    setStatus('pending');
    setValue(null);
    setError(null);

    try {
      const response = await asyncFunction(...args);
      if (mountedRef.current) {
        setValue(response);
        setStatus('success');
      }
      return response;
    } catch (error) {
      if (mountedRef.current) {
        setError(error);
        setStatus('error');
      }
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate && mountedRef.current) {
      execute();
    }
  }, [execute, immediate]);

  return {
    execute,
    status,
    value,
    error,
    pending: status === 'pending',
    success: status === 'success',
    failed: status === 'error'
  };
};

export default useAsync;
