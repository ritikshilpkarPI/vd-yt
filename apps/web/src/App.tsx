// React import not needed with new JSX transform
import { DownloadForm } from './components/DownloadForm';
import { ProgressBar } from './components/ProgressBar';
import { StatusMessage } from './components/StatusMessage';
import { useDownload } from './hooks/useDownload';

function App() {
  const { isDownloading, progress, error, success, download, cancel, reset } = useDownload();

  const handleDownload = async (request: { url: string; format?: 'mp4' | 'mp3' }) => {
    reset();
    await download(request);
  };

  const handleDismissMessage = () => {
    reset();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>YouTube Downloader</h1>
          <p style={styles.subtitle}>
            Download YouTube videos in MP4 or extract audio as MP3
          </p>
        </div>

        <div style={styles.content}>
          <DownloadForm
            onSubmit={handleDownload}
            isLoading={isDownloading}
            onCancel={cancel}
          />

          <ProgressBar
            progress={progress}
            isVisible={isDownloading}
          />

          <StatusMessage
            type={error ? 'error' : success ? 'success' : null}
            message={
              error ||
              (success ? 'Download completed successfully!' : undefined)
            }
            onDismiss={handleDismissMessage}
          />
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            ⚠️ Only download videos you have permission to use
          </p>
          <p style={styles.footerSubtext}>
            Respects Creative Commons licenses and channel ownership
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    padding: '32px',
    width: '100%',
    maxWidth: '600px',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0',
    lineHeight: '1.5',
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '16px',
  },
  footer: {
    marginTop: '32px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: '14px',
    color: '#374151',
    margin: '0 0 8px 0',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '0',
    lineHeight: '1.4',
  },
};

export default App;
