// src/shared/hooks/index.js - Export all hooks
export { default as useLocalStorage } from './useLocalStorage';
export { default as useForm } from './useForm';
export { default as useDebounce } from './useDebounce';
export { default as useAsync } from './useAsync';
export { default as useApi } from './useApi';
export { default as useNotification } from './useNotification';
export { default as usePermissions } from './usePermissions';
export { useGlobalState } from '../context/GlobalStateProvider';
export { useEventBus } from '../services/EventBusService';