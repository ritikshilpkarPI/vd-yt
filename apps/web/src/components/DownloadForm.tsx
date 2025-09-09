import React, { useState } from 'react';
import { DownloadRequest } from '../types';

interface DownloadFormProps {
  onSubmit: (request: DownloadRequest) => void;
  isLoading: boolean;
  onCancel?: () => void;
}

export const DownloadForm: React.FC<DownloadFormProps> = ({
  onSubmit,
  isLoading,
  onCancel,
}) => {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<'mp4' | 'mp3'>('mp4');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit({ url: url.trim(), format });
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
    } catch {
      return false;
    }
  };

  const urlValid = !url || isValidUrl(url);

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.inputGroup}>
        <label htmlFor="url" style={styles.label}>
          YouTube URL
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          style={{
            ...styles.input,
            ...(urlValid ? {} : styles.inputError),
          }}
          required
          disabled={isLoading}
        />
        {!urlValid && (
          <div style={styles.errorText}>
            Please enter a valid YouTube URL
          </div>
        )}
      </div>

      <div style={styles.inputGroup}>
        <label htmlFor="format" style={styles.label}>
          Format
        </label>
        <select
          id="format"
          value={format}
          onChange={(e) => setFormat(e.target.value as 'mp4' | 'mp3')}
          style={styles.select}
          disabled={isLoading}
        >
          <option value="mp4">MP4 (Video)</option>
          <option value="mp3">MP3 (Audio)</option>
        </select>
      </div>

      <div style={styles.buttonGroup}>
        {isLoading ? (
          <button
            type="button"
            onClick={onCancel}
            style={styles.cancelButton}
          >
            Cancel Download
          </button>
        ) : (
          <button
            type="submit"
            disabled={!url.trim() || !urlValid}
            style={{
              ...styles.submitButton,
              ...((!url.trim() || !urlValid) ? styles.buttonDisabled : {}),
            }}
          >
            Download
          </button>
        )}
      </div>
    </form>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    width: '100%',
    maxWidth: '500px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '4px',
  },
  input: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  select: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  errorText: {
    fontSize: '14px',
    color: '#ef4444',
    marginTop: '4px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '8px',
  },
  submitButton: {
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '140px',
  },
  cancelButton: {
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '140px',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
};
