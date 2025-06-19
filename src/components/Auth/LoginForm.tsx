
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await login(email, password);
      if (!error) {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'candidate' | 'recruiter' | 'admin') => {
    setDemoLoading(role);
    try {
      await loginDemo(role);
      // Navigation will happen automatically due to auth state change
      // But we can also navigate here as a fallback
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (error: any) {
      console.error('Demo login failed:', error);
      toast.error('Demo login failed');
    } finally {
      setDemoLoading(null);
    }
  };

  const demoUsers = [
    { role: 'candidate' as const, label: 'Candidate Demo', email: 'candidate@demo.com', description: 'Access the Candidate Portal instantly' },
    { role: 'recruiter' as const, label: 'Recruiter Demo', email: 'recruiter@demo.com', description: 'Access the Recruiter Portal instantly' },
    { role: 'admin' as const, label: 'Admin Demo', email: 'admin@demo.com', description: 'Access the Admin Portal instantly' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Briefcase className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to JobPortal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your gateway to career opportunities
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="text-sm text-gray-600 mb-3 font-medium">Try Demo Accounts (No signup required):</div>
              <div className="space-y-2">
                {demoUsers.map((user) => (
                  <button
                    key={user.role}
                    onClick={() => handleDemoLogin(user.role)}
                    disabled={demoLoading !== null}
                    className="w-full text-left p-3 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg border border-blue-200 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-blue-900">{user.label}</div>
                        <div className="text-blue-700 text-xs">{user.description}</div>
                      </div>
                      {demoLoading === user.role && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button 
                  onClick={() => navigate('/register')}
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Sign up
                </button>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
