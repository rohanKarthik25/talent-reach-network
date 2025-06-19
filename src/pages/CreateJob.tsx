import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import SkillsSelector from '../components/Profile/SkillsSelector';
import JobPreviewDialog from '../components/Jobs/JobPreviewDialog';
import { useNavigate } from 'react-router-dom';
import { countries, getStatesForCountry } from '../utils/locationData';
import { toast } from 'sonner';
import { useJobPosting } from '../hooks/useJobPosting';

const CreateJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { postJob, isPosting } = useJobPosting();
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState<string[]>([]);
  const [availableStates, setAvailableStates] = useState<{ value: string; label: string }[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    jobTitle: '',
    employer: '',
    website: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    qualification: '',
    experienceLevel: '',
    noticePeriod: '',
    jobDescription: '',
    location: '',
    salary: '',
    employmentType: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If country changes, update available states and reset state selection
    if (field === 'country') {
      const states = getStatesForCountry(value);
      setAvailableStates(states);
      setFormData(prev => ({ ...prev, state: '' })); // Reset state when country changes
    }
  };

  const handleSkillsChange = (newSkills: string[]) => {
    setSkills(newSkills);
  };

  // Initialize states when component mounts
  useEffect(() => {
    if (formData.country) {
      const states = getStatesForCountry(formData.country);
      setAvailableStates(states);
    }
  }, [formData.country]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = [
      'jobTitle', 'employer', 'addressLine1', 'city', 'state', 'zipCode', 
      'country', 'qualification', 'experienceLevel', 'jobDescription'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Show preview dialog
    setShowPreview(true);
  };

  const handleConfirmPost = async (duration: string) => {
    const success = await postJob(formData, skills, duration);
    
    if (success) {
      setShowPreview(false);
      navigate('/jobs/posted');
    }
  };

  if (user?.role !== 'recruiter') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-gray-600">This page is only available for recruiters.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Post A Job</h1>
              <div className="text-right">
                <h2 className="text-xl font-semibold">Preview Job Post</h2>
                <p className="text-sm text-muted-foreground">Preview your post before you purchase.</p>
                <Button 
                  className="mt-2 bg-gray-600 hover:bg-gray-700"
                  onClick={() => setShowPreview(true)}
                  disabled={!formData.jobTitle || !formData.employer}
                >
                  PREVIEW
                </Button>
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium">Job Post Details</span>
                
                <div className="w-12 h-px bg-gray-300"></div>
                
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium">Post Duration</span>
                
                <div className="w-12 h-px bg-gray-300"></div>
                
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  3
                </div>
                <span className="text-sm font-medium">Payment Details</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                  <CardDescription>Provide information about the job position</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="jobTitle">Job Title *</Label>
                      <Input
                        id="jobTitle"
                        placeholder="e.g. Marketing Manager"
                        value={formData.jobTitle}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        required
                      />
                      <div className="text-xs text-muted-foreground mt-1">17/100</div>
                    </div>

                    <div>
                      <Label htmlFor="employer">Employer *</Label>
                      <Input
                        id="employer"
                        placeholder="Company name"
                        value={formData.employer}
                        onChange={(e) => handleInputChange('employer', e.target.value)}
                        required
                      />
                      <div className="text-xs text-muted-foreground mt-1">12/150</div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website">Employer Website</Label>
                    <Input
                      id="website"
                      placeholder="www.company.com"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                    />
                    <div className="text-xs text-muted-foreground mt-1">20/150</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="addressLine1">Address Line 1 *</Label>
                      <Input
                        id="addressLine1"
                        placeholder="Street address"
                        value={formData.addressLine1}
                        onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                        required
                      />
                      <div className="text-xs text-muted-foreground mt-1">28/250</div>
                    </div>

                    <div>
                      <Label htmlFor="addressLine2">Address Line 2</Label>
                      <Input
                        id="addressLine2"
                        placeholder="Apt, suite, etc."
                        value={formData.addressLine2}
                        onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      />
                      <div className="text-xs text-muted-foreground mt-1">15/250</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        required
                      />
                      <div className="text-xs text-muted-foreground mt-1">7/250</div>
                    </div>

                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select 
                        value={formData.state} 
                        onValueChange={(value) => handleInputChange('state', value)}
                        disabled={!formData.country}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={formData.country ? "Select state" : "Select country first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStates.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="zipCode">Zip Code *</Label>
                      <Input
                        id="zipCode"
                        placeholder="Zip code"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="qualification">Qualification Required *</Label>
                      <Select value={formData.qualification} onValueChange={(value) => handleInputChange('qualification', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select qualification" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                          <SelectItem value="masters">Master's Degree</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                          <SelectItem value="diploma">Diploma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="experienceLevel">Experience Level *</Label>
                      <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange('experienceLevel', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fresher">Fresher</SelectItem>
                          <SelectItem value="experienced">Experienced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="noticePeriod">Preferred Notice Period</Label>
                    <Select value={formData.noticePeriod} onValueChange={(value) => handleInputChange('noticePeriod', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select notice period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="15-days">15 Days</SelectItem>
                        <SelectItem value="1-month">1 Month</SelectItem>
                        <SelectItem value="2-months">2 Months</SelectItem>
                        <SelectItem value="3-months">3 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <SkillsSelector
                    selectedSkills={skills}
                    onSkillsChange={handleSkillsChange}
                    onUpdate={() => {}} // No need for explicit update since skills are stored in local state
                  />

                  <div>
                    <Label htmlFor="jobDescription">Job Description *</Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Describe the job responsibilities, requirements, and benefits..."
                      rows={6}
                      value={formData.jobDescription}
                      onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/jobs/posted')}>
                  Cancel
                </Button>
                <Button type="submit">
                  Post Job
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Job Preview Dialog */}
      <JobPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        jobData={formData}
        skills={skills}
        onConfirmPost={handleConfirmPost}
      />
    </div>
  );
};

export default CreateJob;
