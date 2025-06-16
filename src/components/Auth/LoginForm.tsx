
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Briefcase } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const demoUsers = [
    { email: 'candidate@demo.com', role: 'Candidate' },
    { email: 'recruiter@demo.com', role: 'Recruiter' },
  ];

  const handleAdminLogin = () => {
    setEmail('rohankarthik402@gmail.com');
    setPassword('kairo1234');
  };

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
              <div className="text-sm text-gray-600 mb-3">Demo accounts:</div>
              <div className="space-y-2">
                {demoUsers.map((user) => (
                  <button
                    key={user.email}
                    onClick={() => {
                      setEmail(user.email);
                      setPassword('demo123');
                    }}
                    className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border"
                  >
                    <div className="font-medium">{user.role}</div>
                    <div className="text-gray-500">{user.email}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleAdminLogin}
                className="w-full text-left p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded border border-blue-200"
              >
                <div className="font-medium text-blue-700">Admin Access</div>
                <div className="text-blue-600 text-xs">rohankarthik402@gmail.com</div>
              </button>
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
