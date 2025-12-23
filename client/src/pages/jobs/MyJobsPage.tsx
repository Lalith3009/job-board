import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../../services/api';
import type { Job } from '../../types';
import toast from 'react-hot-toast';
import {
  Plus,
  Briefcase,
  MapPin,
  Users,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Wifi
} from 'lucide-react';



export default function MyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { jobs } = await jobsApi.getMyJobs();
      setJobs(jobs);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (jobId: number, newStatus: 'open' | 'closed' | 'paused') => {
    try {
      await jobsApi.updateJob(jobId, { status: newStatus });
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ));
      toast.success(`Job ${newStatus === 'open' ? 'opened' : newStatus}`);
    } catch (error) {
      toast.error('Failed to update job status');
    }
    setOpenMenuId(null);
  };

  const handleDelete = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      await jobsApi.deleteJob(jobId);
      setJobs(jobs.filter(job => job.id !== jobId));
      toast.success('Job deleted successfully');
    } catch (error) {
      toast.error('Failed to delete job');
    }
    setOpenMenuId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700',
      paused: 'bg-yellow-100 text-yellow-700'
    };
    return styles[status as keyof typeof styles] || styles.open;
  };

  const getJobTypeBadge = (jobType: string) => {
    const styles: Record<string, string> = {
      'internship': 'bg-purple-100 text-purple-700',
      'full-time': 'bg-blue-100 text-blue-700',
      'part-time': 'bg-orange-100 text-orange-700',
      'contract': 'bg-pink-100 text-pink-700'
    };
    return styles[jobType] || 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Job Postings</h1>
          <p className="text-gray-600 mt-1">Manage your job listings</p>
        </div>
        <Link to="/jobs/new" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Post New Job
        </Link>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="card text-center py-12">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
          <p className="text-gray-600 mb-4">Create your first job posting to start receiving applications</p>
          <Link to="/jobs/new" className="btn btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Post Your First Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(job.status)}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeBadge(job.jobType)}`}>
                      {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1).replace('-', ' ')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                      {job.remoteOk && (
                        <span className="flex items-center gap-1 ml-1 text-green-600">
                          <Wifi className="w-3 h-3" />
                          Remote
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {job.applicationCount} application{job.applicationCount !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Posted {formatDate(job.createdAt)}
                    </span>
                  </div>

                  {job.salaryMin && job.salaryMax && (
                    <p className="text-sm text-gray-600 mt-2">
                      ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} / year
                    </p>
                  )}
                </div>

                {/* Actions Menu */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === job.id ? null : job.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {openMenuId === job.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <Link
                        to={`/jobs/${job.id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenMenuId(null)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Job
                      </Link>
                      
                      {job.status === 'open' ? (
                        <button
                          onClick={() => handleStatusChange(job.id, 'paused')}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                        >
                          <EyeOff className="w-4 h-4" />
                          Pause Job
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(job.id, 'open')}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                        >
                          <Eye className="w-4 h-4" />
                          Open Job
                        </button>
                      )}

                      <button
                        onClick={() => handleStatusChange(job.id, 'closed')}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                      >
                        <Eye className="w-4 h-4" />
                        Close Job
                      </button>

                      <hr className="my-1" />
                      
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Job
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
