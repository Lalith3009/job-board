export type UserRole = 'student' | 'recruiter';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  companyName?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  resumeUrl?: string;
  profileImageUrl?: string;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface SignupData {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  companyName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export type JobType = 'full-time' | 'part-time' | 'internship' | 'contract';
export type JobStatus = 'open' | 'closed' | 'paused';
export type ApplicationStatus = 'pending' | 'reviewed' | 'interviewing' | 'rejected' | 'accepted';

export interface Job {
  id: number;
  recruiterId: number;
  title: string;
  company: string;
  description: string;
  requirements?: string;
  location: string;
  jobType: JobType;
  salaryMin?: number;
  salaryMax?: number;
  status: JobStatus;
  remoteOk: boolean;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  recruiterName?: string;
  applicationCount?: number;
}

export interface Application {
  id: number;
  jobId: number;
  studentId: number;
  coverLetter?: string;
  resumeUrl?: string;
  status: ApplicationStatus;
  recruiterNotes?: string;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  job?: Job;
  student?: User;
}
