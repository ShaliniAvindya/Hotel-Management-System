import toast from 'react-hot-toast';

const ICON_SUCCESS = '✓';
const ICON_ERROR = '✕';
const ICON_INFO = 'ℹ';
const ICON_WARNING = '⚠';
const ICON_DELETE = '🗑';

const baseStyle = {
  padding: '14px 20px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: '500',
  maxWidth: '420px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
  backdropFilter: 'blur(8px)',
};

const notify = {
  success(message, options = {}) {
    return toast(message, {
      duration: 3500,
      icon: ICON_SUCCESS,
      style: {
        ...baseStyle,
        background: '#0d3320',
        color: '#a7f3d0',
        border: '1px solid rgba(167, 243, 208, 0.2)',
      },
      ...options,
    });
  },

  error(message, options = {}) {
    return toast(message, {
      duration: 5000,
      icon: ICON_ERROR,
      style: {
        ...baseStyle,
        background: '#3b1118',
        color: '#fca5a5',
        border: '1px solid rgba(252, 165, 165, 0.2)',
      },
      ...options,
    });
  },

  info(message, options = {}) {
    return toast(message, {
      duration: 3000,
      icon: ICON_INFO,
      style: {
        ...baseStyle,
        background: '#0f2742',
        color: '#93c5fd',
        border: '1px solid rgba(147, 197, 253, 0.2)',
      },
      ...options,
    });
  },

  warning(message, options = {}) {
    return toast(message, {
      duration: 4000,
      icon: ICON_WARNING,
      style: {
        ...baseStyle,
        background: '#3b2f10',
        color: '#fcd34d',
        border: '1px solid rgba(252, 211, 77, 0.2)',
      },
      ...options,
    });
  },

  deleted(message, options = {}) {
    return toast(message, {
      duration: 3500,
      icon: ICON_DELETE,
      style: {
        ...baseStyle,
        background: '#2d1a1a',
        color: '#fca5a5',
        border: '1px solid rgba(252, 165, 165, 0.15)',
      },
      ...options,
    });
  },

  promise(promise, messages = {}, options = {}) {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Processing…',
        success: messages.success || 'Done!',
        error: (err) =>
          messages.error
            ? typeof messages.error === 'function'
              ? messages.error(err)
              : messages.error
            : err?.response?.data?.message || err?.message || 'Something went wrong',
      },
      {
        style: {
          ...baseStyle,
          background: '#0f2742',
          color: '#e2e8f0',
          border: '1px solid rgba(201, 162, 74, 0.2)',
        },
        success: {
          style: {
            ...baseStyle,
            background: '#0d3320',
            color: '#a7f3d0',
            border: '1px solid rgba(167, 243, 208, 0.2)',
          },
          icon: ICON_SUCCESS,
        },
        error: {
          style: {
            ...baseStyle,
            background: '#3b1118',
            color: '#fca5a5',
            border: '1px solid rgba(252, 165, 165, 0.2)',
          },
          icon: ICON_ERROR,
        },
        ...options,
      }
    );
  },
};

export default notify;
