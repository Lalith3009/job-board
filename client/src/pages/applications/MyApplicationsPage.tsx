import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  FileText,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Trash2
} from 'lucide-react';

interface ApplicationWithJob {
  id: number;
  status: string;
  coverLetter?: string;
  resumeUrl?: string;
  recruiterNotes?: string;
  createdAt: string;
  updatedAt: string;
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    jobType: string;
    status: string;
  };
  recruiter?: {
    firstName: string;
    lastName: string;
  };
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { applications } = await applicationsApi.getMyApplications();
      setApplications(applications);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (id: number) => {
    if (!confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      await applicationsApi.withdrawApplication(id);
      setApplications(applications.filter(app => app.id !== id));
      toast.success('Application withdrawn');
    } catch (error) {
      toast.error('Failed to withdraw application');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'interviewing':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'reviewed':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-700',
      reviewed: 'bg-yellow-100 text-yellow-700',
      interviewing: 'bg-blue-100 text-blue-700',
      rejected: 'bg-red-100 text-red-700',
      accepted: 'bg-green-100 text-green-700'
    };
    return styles[status] || styles.pending;
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewed: applications.filter(a => a.status === 'reviewed').length,
    interviewing: applications.filter(a => a.status === 'interviewing').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-1">Track the status of your job applications</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'reviewed', label: 'Reviewed' },
          { key: 'interviewing', label: 'Interviewing' },
          { key: 'accepted', label: 'Accepted' },
          { key: 'rejected', label: 'Rejected' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({statusCounts[tab.key as keyof typeof statusCounts]})
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
          </h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all'
              ? 'Start applying to jobs to track your applications here'
              : 'No applications match this filter'}
          </p>
          {filter === 'all' && (
            <Link to="/jobs" className="btn btn-primary inline-flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Browse Jobs
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(application => (
            <div key={application.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(application.status)}
                    <Link
                      to={`/jobs/${application.job.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {application.job.title}
                    </Link>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>

                  <p className="text-gray-700 font-medium mb-2">{application.job.company}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {application.job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Applied {formatDate(application.createdAt)}
                    </span>
                    {application.job.status !== 'open' && (
                      <span className="text-orange-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Job {application.job.status}
                      </span>
                    )}
                  </div>

                  {application.recruiterNotes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Recruiter note:</strong> {application.recruiterNotes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/jobs/${application.job.id}`}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="View Job"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                  {application.status === 'pending' && (
                    <button
                      onClick={() => handleWithdraw(application.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Withdraw Application"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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
