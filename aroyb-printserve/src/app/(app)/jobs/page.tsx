'use client';

import { useEffect, useState } from 'react';
import { getPrintJobs, updatePrintJob, getOrders, addPrintJob } from '@/lib/storage';
import { printJobTypeConfig, printJobStatusConfig, formatDateTime, generateId } from '@/lib/formatting';
import type { PrintJob, PrintJobStatus } from '@/types';

export default function JobsPage() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadJobs();
  }, []);
  
  const loadJobs = () => {
    setJobs(getPrintJobs().reverse());
    setLoading(false);
  };
  
  const handleReprint = (job: PrintJob) => {
    const newJob: PrintJob = {
      ...job,
      id: generateId('job-'),
      status: 'pending',
      createdAt: new Date().toISOString(),
      error: undefined,
    };
    addPrintJob(newJob);
    loadJobs();
  };
  
  const handleProcess = (jobId: string, status: PrintJobStatus, error?: string) => {
    updatePrintJob(jobId, { 
      status, 
      error,
      attemptedAt: new Date().toISOString(),
      completedAt: status === 'completed' ? new Date().toISOString() : undefined,
    });
    loadJobs();
  };
  
  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(j => j.status === filter);
  
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Print Jobs</h1>
        <div className="flex items-center gap-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="input w-40"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="printing">Printing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>
      
      {jobs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-neutral-400">No print jobs yet</p>
          <p className="text-sm text-neutral-500 mt-1">Print an order to see jobs here</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-800">
              <tr>
                <th className="text-left p-4 font-semibold">ID</th>
                <th className="text-left p-4 font-semibold">Type</th>
                <th className="text-left p-4 font-semibold">Order</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Created</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(job => (
                <tr key={job.id} className="border-t border-neutral-800 hover:bg-neutral-800/50">
                  <td className="p-4 text-sm font-mono text-neutral-400">{job.id.slice(0, 12)}...</td>
                  <td className="p-4">
                    <span className="flex items-center gap-2">
                      {printJobTypeConfig[job.type].icon}
                      {printJobTypeConfig[job.type].label}
                    </span>
                  </td>
                  <td className="p-4">{job.orderId}</td>
                  <td className="p-4">
                    <span className={`badge ${printJobStatusConfig[job.status].bgColor} ${printJobStatusConfig[job.status].color}`}>
                      {job.status}
                    </span>
                    {job.error && (
                      <p className="text-xs text-red-400 mt-1">{job.error}</p>
                    )}
                  </td>
                  <td className="p-4 text-neutral-400 text-sm">{formatDateTime(job.createdAt)}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {job.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleProcess(job.id, 'completed')}
                            className="btn btn-success text-xs py-1 px-2"
                          >
                            ✓ Complete
                          </button>
                          <button 
                            onClick={() => handleProcess(job.id, 'failed', 'Simulated failure')}
                            className="btn btn-danger text-xs py-1 px-2"
                          >
                            ✗ Fail
                          </button>
                        </>
                      )}
                      {(job.status === 'completed' || job.status === 'failed') && (
                        <button 
                          onClick={() => handleReprint(job)}
                          className="btn btn-ghost text-xs py-1 px-2"
                        >
                          🔄 Reprint
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
