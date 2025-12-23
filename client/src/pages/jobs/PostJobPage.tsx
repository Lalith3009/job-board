import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { jobsApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Briefcase,
  MapPin,
  DollarSign,
  FileText,
  Loader2,
  ArrowLeft,
  Wifi
} from 'lucide-react';

interface CreateJobData {
  title: string;
  company?: string;
  description: string;
  requirements?: string;
  location: string;
  jobType: 'full-time' | 'part-time' | 'internship' | 'contract';
  salaryMin?: number;
  salaryMax?: number;
  remoteOk?: boolean;
}

export default function PostJobPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateJobData>({
    title: '',
    company: user?.companyName || '',
    description: '',
    requirements: '',
    location: '',
    jobType: 'internship',
    salaryMin: undefined,
    salaryMax: undefined,
    remoteOk: false
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'salaryMin' || name === 'salaryMax') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await jobsApi.createJob(formData);
      toast.success('Job posted successfully!');
      navigate('/jobs/manage');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to post job';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const jobTypes = [
    { value: 'internship', label: 'Internship' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-gray-600 mt-1">Fill in the details to create a job posting</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            {/* Job Title */}
            <div>
              <label htmlFor="title" className="label">Job Title *</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="e.g. Frontend Developer Intern"
                  required
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label htmlFor="company" className="label">Company Name</label>
              <input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                className="input"
                placeholder="e.g. Acme Inc."
              />
            </div>

            {/* Job Type */}
            <div>
              <label htmlFor="jobType" className="label">Job Type *</label>
              <select
                id="jobType"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="input"
                required
              >
                {jobTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="label">Location *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="e.g. San Francisco, CA"
                  required
                />
              </div>
            </div>

            {/* Remote OK */}
            <div className="flex items-center gap-3">
              <input
                id="remoteOk"
                name="remoteOk"
                type="checkbox"
                checked={formData.remoteOk}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="remoteOk" className="flex items-center gap-2 text-gray-700">
                <Wifi className="w-4 h-4" />
                Remote work available
              </label>
            </div>
          </div>
        </div>

        {/* Salary Card */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Compensation (Optional)</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="salaryMin" className="label">Minimum Salary</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="salaryMin"
                  name="salaryMin"
                  type="number"
                  value={formData.salaryMin || ''}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="50000"
                />
              </div>
            </div>
            <div>
              <label htmlFor="salaryMax" className="label">Maximum Salary</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  value={formData.salaryMax || ''}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="70000"
                />
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Leave blank if you prefer not to disclose salary range
          </p>
        </div>

        {/* Description Card */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
          
          <div className="space-y-4">
            {/* Description */}
            <div>
              <label htmlFor="description" className="label">Job Description *</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input pl-10 min-h-[150px]"
                  placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
                  required
                />
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label htmlFor="requirements" className="label">Requirements (Optional)</label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                className="input min-h-[120px]"
                placeholder="List the skills, qualifications, and experience required..."
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Posting...
              </>
            ) : (
              'Post Job'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
