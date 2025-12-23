import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { jobsApi } from '../../services/api';
import type { Job } from '../../types';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Wifi,
  Building2,
  User,
  Loader2,
  Send,
  Edit
} from 'lucide-react';

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      const { job } = await jobsApi.getJob(parseInt(id!));
      setJob(job);
    } catch (error) {
      toast.error('Job not found');
      navigate('/jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()} per year`;
    if (min) return `From $${min.toLocaleString()} per year`;
    if (max) return `Up to $${max.toLocaleString()} per year`;
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

  if (!job) {
    return null;
  }

  const isOwner = user?.role === 'recruiter' && user?.id === job.recruiterId;
  const isStudent = user?.role === 'student';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getJobTypeBadge(job.jobType)}`}>
                    {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1).replace('-', ' ')}
                  </span>
                </div>
                <p className="text-lg text-gray-700">{job.company}</p>
              </div>
              {isOwner && (
                <Link
                  to={`/jobs/${job.id}/edit`}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {job.location}
              </span>
              {job.remoteOk && (
                <span className="flex items-center gap-2 text-green-600">
                  <Wifi className="w-5 h-5" />
                  Remote available
                </span>
              )}
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Posted {formatDate(job.createdAt)}
              </span>
            </div>

            {formatSalary(job.salaryMin, job.salaryMax) && (
              <div className="mt-4 flex items-center gap-2 text-lg font-medium text-gray-900">
                <DollarSign className="w-5 h-5 text-green-600" />
                {formatSalary(job.salaryMin, job.salaryMax)}
              </div>
            )}
          </div>

          {/* Description Card */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
            <div className="prose prose-gray max-w-none">
              {job.description.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-700 mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Requirements Card */}
          {job.requirements && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
              <div className="prose prose-gray max-w-none">
                {job.requirements.split('\n').map((req, index) => (
                  <p key={index} className="text-gray-700 mb-2">
                    {req}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          {isStudent && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Interested in this job?</h3>
              <button className="btn btn-primary w-full flex items-center justify-center gap-2">
                <Send className="w-5 h-5" />
                Apply Now
              </button>
              <p className="text-sm text-gray-500 mt-3 text-center">
                Application feature coming soon!
              </p>
            </div>
          )}

          {/* Company Info Card */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">About the Company</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{job.company}</p>
                  <p className="text-sm text-gray-500">{job.location}</p>
                </div>
              </div>
              
              {job.recruiter && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Posted by</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">
                      {job.recruiter.firstName} {job.recruiter.lastName}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Job Stats Card */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Job Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Applications</span>
                <span className="font-medium text-gray-900">{job.applicationCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${job.status === 'open' ? 'text-green-600' : 'text-gray-500'}`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
