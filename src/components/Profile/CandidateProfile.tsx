import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Upload, Download, User, MapPin, Phone, Mail, GraduationCap, Briefcase, Award, FileText, AlertCircle } from 'lucide-react';
import { useCandidate } from '@/hooks/useCandidate';
import { toast } from 'sonner';

const CandidateProfile = () => {
  const { profile, loading, updateProfile, uploadFile } = useCandidate();
  const [newSkill, setNewSkill] = useState('');
  const [isLookingForJob, setIsLookingForJob] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  // Form states for each section
  const [personalDetails, setPersonalDetails] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    idPassport: '',
    gender: '',
    age: ''
  });

  const [locationData, setLocationData] = useState('');
  const [educationData, setEducationData] = useState('');
  const [experienceData, setExperienceData] = useState('');
  const [licenseData, setLicenseData] = useState({
    type: '',
    number: ''
  });

  useEffect(() => {
    if (profile) {
      setPersonalDetails(prev => ({
        ...prev,
        name: profile.name || '',
        phone: profile.phone || ''
      }));
      setLocationData(profile.location || '');
      setEducationData(profile.education || '');
      setExperienceData(profile.experience || '');
      setLicenseData({
        type: profile.license_type || '',
        number: profile.license_number || ''
      });
    }
  }, [profile]);

  const handleAddSkill = () => {
    if (newSkill.trim() && profile && !profile.skills.includes(newSkill.trim())) {
      const updatedSkills = [...profile.skills, newSkill.trim()];
      updateProfile({ skills: updatedSkills });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (profile) {
      const updatedSkills = profile.skills.filter(skill => skill !== skillToRemove);
      updateProfile({ skills: updatedSkills });
    }
  };

  const validateResumeFile = (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return false;
    }
    
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file only');
      return false;
    }
    
    return true;
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateResumeFile(file)) {
      event.target.value = ''; // Clear the input
      return;
    }

    try {
      setUploadProgress('Uploading resume...');
      const resumeUrl = await uploadFile(file, 'resumes', 'profiles/');
      await updateProfile({ resume_url: resumeUrl });
      toast.success('Resume uploaded successfully');
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    } finally {
      setUploadProgress('');
      event.target.value = ''; // Clear the input
    }
  };

  const handleUpdateDetails = () => {
    updateProfile({
      name: personalDetails.name,
      phone: personalDetails.phone
    });
  };

  const handleUpdateLocation = () => {
    updateProfile({ location: locationData });
  };

  const handleUpdateEducation = () => {
    updateProfile({ education: educationData });
  };

  const handleUpdateExperience = () => {
    updateProfile({ experience: experienceData });
  };

  const handleUpdateLicense = () => {
    updateProfile({
      license_type: licenseData.type,
      license_number: licenseData.number
    });
  };

  const handleUpdateCVSkills = () => {
    toast.success('CV & Skills updated successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-2">Update your details below</p>
      </div>

      {/* Job Seeking Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Are you looking for a New job opportunity?</h3>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={isLookingForJob}
                  onChange={() => setIsLookingForJob(true)}
                  className="text-primary"
                />
                Yes
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!isLookingForJob}
                  onChange={() => setIsLookingForJob(false)}
                  className="text-primary"
                />
                No
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="details">MY DETAILS</TabsTrigger>
          <TabsTrigger value="location">MY LOCATION</TabsTrigger>
          <TabsTrigger value="cv">MY CV</TabsTrigger>
          <TabsTrigger value="education">MY EDUCATION</TabsTrigger>
          <TabsTrigger value="license">MY DRIVER'S LICENSE</TabsTrigger>
          <TabsTrigger value="employment">MY EMPLOYMENT</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={personalDetails.name}
                    onChange={(e) => setPersonalDetails(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="surname">Surname</Label>
                  <Input 
                    id="surname" 
                    value={personalDetails.surname}
                    onChange={(e) => setPersonalDetails(prev => ({ ...prev, surname: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalDetails.email}
                    onChange={(e) => setPersonalDetails(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Cellular Number</Label>
                  <Input
                    id="phone"
                    value={personalDetails.phone}
                    onChange={(e) => setPersonalDetails(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ID / Passport Number</Label>
                  <Input 
                    value={personalDetails.idPassport}
                    onChange={(e) => setPersonalDetails(prev => ({ ...prev, idPassport: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="gender" 
                        value="male"
                        checked={personalDetails.gender === 'male'}
                        onChange={(e) => setPersonalDetails(prev => ({ ...prev, gender: e.target.value }))}
                      />
                      Male
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="gender" 
                        value="female"
                        checked={personalDetails.gender === 'female'}
                        onChange={(e) => setPersonalDetails(prev => ({ ...prev, gender: e.target.value }))}
                      />
                      Female
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  type="number"
                  value={personalDetails.age}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, age: e.target.value }))}
                />
              </div>

              <Button onClick={() => updateProfile({ name: personalDetails.name, phone: personalDetails.phone })}>
                Update Details
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="location">Current Location</Label>
                  <Input
                    id="location"
                    value={locationData}
                    onChange={(e) => setLocationData(e.target.value)}
                  />
                </div>
                <Button onClick={() => updateProfile({ location: locationData })}>
                  Update Location
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cv">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Resume & Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {uploadProgress && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">{uploadProgress}</span>
                </div>
              )}
              
              {/* Resume Upload */}
              <div>
                <Label>Resume Upload (PDF only)</Label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload">
                    <Button variant="outline" className="cursor-pointer" disabled={!!uploadProgress}>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadProgress ? uploadProgress : 'Upload Resume'}
                    </Button>
                  </label>
                  {profile?.resume_url && (
                    <Button variant="outline" onClick={() => window.open(profile.resume_url, '_blank')}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Current Resume
                    </Button>
                  )}
                </div>
                {profile?.resume_url && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <FileText className="h-4 w-4" />
                    Resume uploaded successfully
                  </div>
                )}
              </div>

              {/* Skills */}
              <div>
                <Label>Skills</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile?.skills?.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer">
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 text-xs hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  />
                  <Button onClick={handleAddSkill}>Add</Button>
                </div>
              </div>

              <Button onClick={() => toast.success('CV & Skills updated successfully')}>
                Update CV & Skills
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Educational Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="education">Education</Label>
                  <Textarea
                    id="education"
                    value={educationData}
                    onChange={(e) => setEducationData(e.target.value)}
                    placeholder="Enter your educational qualifications"
                  />
                </div>
                <Button onClick={() => updateProfile({ education: educationData })}>
                  Update Education
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="license">
          <Card>
            <CardHeader>
              <CardTitle>Driver's License</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>License Type</Label>
                  <Input 
                    value={licenseData.type}
                    onChange={(e) => setLicenseData(prev => ({ ...prev, type: e.target.value }))}
                    placeholder="Enter license type" 
                  />
                </div>
                <div>
                  <Label>License Number</Label>
                  <Input 
                    value={licenseData.number}
                    onChange={(e) => setLicenseData(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="Enter license number" 
                  />
                </div>
                <Button onClick={() => updateProfile({ license_type: licenseData.type, license_number: licenseData.number })}>
                  Update License
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="experience">Work Experience</Label>
                  <Textarea
                    id="experience"
                    value={experienceData}
                    onChange={(e) => setExperienceData(e.target.value)}
                    placeholder="Describe your work experience"
                  />
                </div>
                <Button onClick={() => updateProfile({ experience: experienceData })}>
                  Update Experience
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateProfile;
