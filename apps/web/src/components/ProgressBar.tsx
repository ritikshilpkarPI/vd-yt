import React from 'react';

interface ProgressBarProps {
  progress: number;
  isVisible: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div style={styles.container}>
      <div style={styles.label}>
        Downloading... {progress}%
      </div>
      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${Math.min(100, Math.max(0, progress))}%`,
          }}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    maxWidth: '500px',
    margin: '20px 0',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
    textAlign: 'center' as const,
  },
  progressBar: {
    width: '100%',
    height: '12px',
    backgroundColor: '#e5e7eb',
    borderRadius: '6px',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: '6px',
    transition: 'width 0.3s ease',
    background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
  },
};
