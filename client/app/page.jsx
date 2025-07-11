'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import dynamic from 'next/dynamic';

// ⛔ Prevent "window is not defined" errors (Next.js SSR)
const io = typeof window !== 'undefined' ? require('socket.io-client') : null;
const socket = io ? io('http://localhost:5000') : null;

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [liveJob, setLiveJob] = useState(null);

  // 🔁 Fetch import logs
  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/import-logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      toast.error('❌ Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  // 🔌 Setup socket listeners
  useEffect(() => {
    fetchLogs();

    if (!socket) return;

    socket.on('jobUpdate', (data) => {
      setLiveJob(data.jobId);
      if (data.status === 'failed') {
        toast.error(`❌ Job failed: ${data.jobId}`);
      }
    });

    socket.on('importComplete', (summary) => {
      toast.info(`✅ Import Complete: ${summary.newJobs} new, ${summary.updatedJobs} updated, ${summary.failedJobs.length} failed`);
      setLiveJob(null);
      fetchLogs();
    });

    return () => {
      socket.off('jobUpdate');
      socket.off('importComplete');
    };
  }, []);

  // 🔁 Trigger import
  const handleImport = async () => {
    try {
      setImporting(true);
      const res = await fetch('/api/import-jobs', {
        method: 'POST',
      });

      if (!res.ok) {
        toast.error('❌ Failed to trigger import');
      } else {
        toast.success('✅ Import triggered successfully');
      }
    } catch (err) {
      console.error(err);
      toast.error('❌ Error triggering import');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📋 Import Logs</h1>
        <button
          onClick={handleImport}
          disabled={importing}
          className={`px-4 py-2 rounded transition ${
            importing
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {importing ? '⏳ Importing...' : '🔄 Run Import Now'}
        </button>
      </div>

      {liveJob && (
        <div className="mb-4 p-3 bg-yellow-700 text-yellow-100 rounded text-sm">
          📡 Importing: <span className="font-mono">{liveJob}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-300">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <span>Loading logs...</span>
        </div>
      ) : logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <table className="min-w-full border border-gray-700 rounded-lg overflow-hidden shadow text-sm">
          <thead className="bg-gray-800 text-white text-left">
            <tr>
              <th className="p-2">Timestamp</th>
              <th className="p-2">Total</th>
              <th className="p-2">New</th>
              <th className="p-2">Updated</th>
              <th className="p-2">Failed</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i} className="border-t border-gray-700">
                <td className="p-2">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="p-2 text-blue-300">{log.totalFetched}</td>
                <td className="p-2 text-green-400">{log.newJobs}</td>
                <td className="p-2 text-yellow-300">{log.updatedJobs}</td>
                <td className="p-2 text-red-400">{log.failedJobs?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}