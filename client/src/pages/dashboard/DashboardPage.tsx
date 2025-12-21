import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, Users, FileText, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const isRecruiter = user?.role === 'recruiter';

  const studentStats = [
    { label: 'Applications Sent', value: '0', icon: FileText, color: 'bg-blue-500' },
    { label: 'Interviews', value: '0', icon: Users, color: 'bg-green-500' },
    { label: 'Saved Jobs', value: '0', icon: Briefcase, color: 'bg-purple-500' },
    { label: 'Profile Views', value: '0', icon: TrendingUp, color: 'bg-orange-500' },
  ];

  const recruiterStats = [
    { label: 'Active Jobs', value: '0', icon: Briefcase, color: 'bg-blue-500' },
    { label: 'Total Applications', value: '0', icon: FileText, color: 'bg-green-500' },
    { label: 'Interviews Scheduled', value: '0', icon: Users, color: 'bg-purple-500' },
    { label: 'Hires This Month', value: '0', icon: TrendingUp, color: 'bg-orange-500' },
  ];

  const stats = isRecruiter ? recruiterStats : studentStats;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          {isRecruiter
            ? 'Manage your job postings and find the perfect candidates.'
            : 'Track your applications and find your dream internship.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {isRecruiter ? (
            <>
              <button className="btn btn-primary">Post a New Job</button>
              <button className="btn btn-secondary">View Applications</button>
              <button className="btn btn-secondary">Manage Listings</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary">Browse Jobs</button>
              <button className="btn btn-secondary">Update Profile</button>
              <button className="btn btn-secondary">Upload Resume</button>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No recent activity yet.</p>
          <p className="text-sm mt-1">
            {isRecruiter
              ? 'Post your first job to get started!'
              : 'Apply to jobs to see your activity here.'}
          </p>
        </div>
      </div>
    </div>
  );
}
