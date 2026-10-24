import toast from 'react-hot-toast';

export const showToast = {
  success: (msg) => toast.success(msg, {
    duration: 3000,
    position: 'top-center',
  }),
  error: (msg) => toast.error(msg, {
    duration: 4000,
    position: 'top-center',
  }),
  warning: (msg) => toast(msg, {
    icon: '⚠️',
    duration: 3500,
    position: 'top-center',
    style: {
      background: '#F59E0B',
      color: '#fff',
    },
  }),
  info: (msg) => toast(msg, {
    icon: 'ℹ️',
    duration: 3000,
    position: 'top-center',
    style: {
      background: '#3B82F6',
      color: '#fff',
    },
  }),
};

export default showToast;
