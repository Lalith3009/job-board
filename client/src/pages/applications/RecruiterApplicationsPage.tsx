import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Users,
  Briefcase,
  Calendar,
  Mail,
  MapPin,
  Linkedin,
  Github,
  Loader2,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare
} from 'lucide-react';

interface ApplicationWithStudent {
  id: number;
  status: string;
  coverLetter?: string;
  resumeUrl?: string;
  recruiterNotes?: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    location?: string;
    linkedin?: string;
    github?: string;
    bio?: string;
  };
  job?: {
    id: number;
    title: string;
    company: string;
  };
}

export default function RecruiterApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationWithStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [noteInput, setNoteInput] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { applications } = await applicationsApi.getAllApplications();
      setApplications(applications);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await applicationsApi.updateApplicationStatus(id, { status: newStatus });
      setApplications(applications.map(app =>
        app.id === id ? { ...app, status: newStatus } : app
      ));
      toast.success(`Application marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAddNote = async (id: number) => {
    const note = noteInput[id];
    if (!note?.trim()) return;

    try {
      await applicationsApi.updateApplicationStatus(id, { recruiterNotes: note });
      setApplications(applications.map(app =>
        app.id === id ? { ...app, recruiterNotes: note } : app
      ));
      setNoteInput(prev => ({ ...prev, [id]: '' }));
      toast.success('Note added');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600 mt-1">Review and manage candidate applications</p>
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
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
          </h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? 'Applications will appear here when students apply to your jobs'
              : 'No applications match this filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(application => (
            <div key={application.id} className="card">
              {/* Main Info */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {application.student.firstName[0]}{application.student.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {application.student.firstName} {application.student.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{application.student.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>

                  {application.job && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Briefcase className="w-4 h-4" />
                      <span>Applied for: </span>
                      <Link
                        to={`/jobs/${application.job.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {application.job.title}
                      </Link>
                      <span className="text-gray-400">at {application.job.company}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(application.createdAt)}
                    </span>
                    {application.student.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {application.student.location}
                      </span>
                    )}
                    {application.student.linkedin && (
                      <a
                        href={application.student.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                    {application.student.github && (
                      <a
                        href={application.student.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-gray-700 hover:underline"
                      >
                        <Github className="w-4 h-4" />
                        GitHub
                      </a>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(application.id, 'reviewed')}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                    title="Mark as Reviewed"
                  >
                    <Clock className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleStatusChange(application.id, 'interviewing')}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Move to Interview"
                  >
                    <Users className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleStatusChange(application.id, 'accepted')}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="Accept"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleStatusChange(application.id, 'rejected')}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Reject"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === application.id ? null : application.id)}
                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedId === application.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === application.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Cover Letter */}
                  {application.coverLetter && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                        {application.coverLetter}
                      </p>
                    </div>
                  )}

                  {/* Bio */}
                  {application.student.bio && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">About</h4>
                      <p className="text-gray-700">{application.student.bio}</p>
                    </div>
                  )}

                  {/* Recruiter Notes */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Notes
                    </h4>
                    {application.recruiterNotes && (
                      <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg mb-3">
                        {application.recruiterNotes}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={noteInput[application.id] || ''}
                        onChange={(e) => setNoteInput(prev => ({ ...prev, [application.id]: e.target.value }))}
                        placeholder="Add a note..."
                        className="input flex-1"
                      />
                      <button
                        onClick={() => handleAddNote(application.id)}
                        className="btn btn-secondary"
                      >
                        Add Note
                      </button>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex gap-3">
                    <a
                      href={`mailto:${application.student.email}`}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Email Candidate
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
