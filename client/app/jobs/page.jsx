'use client';

import { useEffect, useState } from 'react';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const jobsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs?page=${currentPage}&limit=${jobsPerPage}`)
      .then(res => res.json())
      .then(data => {
        setJobs(data.jobs || []);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching paginated jobs:', err.message);
        setLoading(false);
      });
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">📄 Imported Jobs</h1>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="🔍 Search jobs..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 w-full max-w-md rounded bg-gray-800 text-white border border-gray-600 placeholder-gray-400"
        />

        {search && (
          <button
            onClick={() => setSearch('')}
            className="flex items-center gap-1 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition shadow-sm"
          >
            <span>Clear</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>


      {loading ? (
        <p>Loading...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <table className="min-w-full border border-gray-700 rounded-lg overflow-hidden shadow text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-2">Title</th>
              <th className="p-2">Description</th>
              <th className="p-2">Posted At</th>
            </tr>
          </thead>
          <tbody>
            {jobs
              .filter((job) =>
                job.title?.toLowerCase().includes(search.toLowerCase()) ||
                job.description?.toLowerCase().includes(search.toLowerCase())
              )
              .map((job) => (
                <tr
                  key={job._id}
                  className="cursor-pointer border-t border-gray-700 hover:bg-gray-800"
                  onClick={() => setSelectedJob(job)}
                >
                  <td className="p-2 text-blue-300">{job.title || '-'}</td>
                  <td className="p-2 max-w-xs">{job.description.slice(0, 100) || '-'}</td>
                  <td className="p-2">
                    {job.createdAt
                      ? new Date(job.createdAt).toLocaleDateString()
                      : '-'}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className={`px-3 py-1 rounded ${currentPage === 1
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-blue-700 hover:bg-blue-800'
            } text-white`}
        >
          ⬅ Prev
        </button>

        <span className="text-white text-sm">
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className={`px-3 py-1 rounded ${currentPage === totalPages
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-blue-700 hover:bg-blue-800'
            } text-white`}
        >
          Next ➡
        </button>
      </div>

      {/* Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">{selectedJob.title}</h2>
            <p className="text-sm text-gray-300 whitespace-pre-line mb-4">
              {selectedJob.description || 'No description provided.'}
            </p>
            <p className="text-xs text-gray-400 mb-2">
              <strong>Posted:</strong>{' '}
              {selectedJob.createdAt
                ? new Date(selectedJob.createdAt).toLocaleDateString()
                : 'N/A'}
            </p>
            <p className="text-xs text-blue-400 mb-4">
              <a href={selectedJob.jobId} target="_blank" rel="noreferrer" className="hover:underline">
                {selectedJob.jobId}
              </a>
            </p>
            <div className="text-right">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}