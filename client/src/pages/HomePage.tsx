import { Link } from 'react-router-dom';
import { Briefcase, Search, FileText, Users, ArrowRight, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Search,
      title: 'Find Your Dream Internship',
      description: 'Browse thousands of internship opportunities from top companies worldwide.'
    },
    {
      icon: FileText,
      title: 'Easy Applications',
      description: 'Apply with one click and track all your applications in one place.'
    },
    {
      icon: Users,
      title: 'Connect with Recruiters',
      description: 'Get noticed by recruiters from leading tech companies.'
    }
  ];

  const benefits = [
    'Free to use for students',
    'Verified company listings',
    'Real-time application tracking',
    'Resume builder included',
    'Interview preparation resources',
    'Salary insights and reviews'
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">JobBoard</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Sign in
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Your Perfect Internship
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Connect with top companies and kickstart your career. 
              Join thousands of students who found their dream internship through JobBoard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg">
                Start Your Journey
                <ArrowRight className="inline ml-2 w-5 h-5" />
              </Link>
              <Link to="/signup?role=recruiter" className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
                I'm a Recruiter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Land Your Internship
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to find, apply, and track internship opportunities.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose JobBoard?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-gray-600 mb-6">Active Internships</div>
                <div className="text-5xl font-bold text-green-600 mb-2">5,000+</div>
                <div className="text-gray-600 mb-6">Students Placed</div>
                <div className="text-5xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-gray-600">Partner Companies</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have found their dream internships through our platform.
          </p>
          <Link to="/signup" className="btn bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg inline-flex items-center">
            Create Free Account
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">JobBoard</span>
            </div>
            <p className="text-sm">
              © 2024 JobBoard. Built for CS students, by a CS student.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
