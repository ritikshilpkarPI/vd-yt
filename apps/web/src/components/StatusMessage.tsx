import React from 'react';

interface StatusMessageProps {
  type: 'success' | 'error' | null;
  message?: string;
  onDismiss?: () => void;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ type, message, onDismiss }) => {
  if (!type || !message) return null;

  const isError = type === 'error';

  return (
    <div
      style={{
        ...styles.container,
        ...(isError ? styles.error : styles.success),
      }}
    >
      <div style={styles.content}>
        <div style={styles.icon}>
          {isError ? '⚠️' : '✅'}
        </div>
        <div style={styles.message}>
          {message}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={styles.dismissButton}
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    maxWidth: '500px',
    margin: '16px 0',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid',
  },
  success: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
    color: '#166534',
  },
  error: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    color: '#dc2626',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  icon: {
    fontSize: '18px',
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '1.4',
  },
  dismissButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    opacity: 0.7,
    transition: 'opacity 0.2s ease',
    color: 'inherit',
  },
};
