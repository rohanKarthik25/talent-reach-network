
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { User, MapPin, GraduationCap, Briefcase, Award, FileText } from 'lucide-react';
import { useCandidate } from '@/hooks/useCandidate';
import { FileUpload } from '../ui/file-upload';
import { toast } from 'sonner';
import SkillsSelector from './SkillsSelector';
import EducationQualifications from './EducationQualifications';

const CandidateProfile = () => {
  const { profile, educationRecords, loading, updateProfile, addEducationRecord, deleteEducationRecord, uploadFile } = useCandidate();
  const [isLookingForJob, setIsLookingForJob] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Form states for each section
  const [personalDetails, setPersonalDetails] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    id_passport: '',
    gender: '',
    age: ''
  });

  const [locationData, setLocationData] = useState('');
  const [experienceData, setExperienceData] = useState('');
  const [licenseData, setLicenseData] = useState({
    type: '',
    number: ''
  });

  useEffect(() => {
    if (profile) {
      setPersonalDetails({
        name: profile.name || '',
        surname: profile.surname || '',
        email: profile.email || '',
        phone: profile.phone || '',
        id_passport: profile.id_passport || '',
        gender: profile.gender || '',
        age: profile.age?.toString() || ''
      });
      setLocationData(profile.location || '');
      setExperienceData(profile.experience || '');
      setLicenseData({
        type: profile.license_type || '',
        number: profile.license_number || ''
      });
    }
  }, [profile]);

  const handlePersonalDetailsUpdate = () => {
    const updates = {
      name: personalDetails.name,
      surname: personalDetails.surname,
      email: personalDetails.email,
      phone: personalDetails.phone,
      id_passport: personalDetails.id_passport,
      gender: personalDetails.gender,
      age: personalDetails.age ? parseInt(personalDetails.age) : undefined
    };
    updateProfile(updates);
  };

  const handleSkillsUpdate = (skills: string[]) => {
    updateProfile({ skills });
  };

  const handleResumeUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const resumeUrl = await uploadFile(file, 'resumes', 'profiles/');
      await updateProfile({ resume_url: resumeUrl });
      toast.success('Resume uploaded successfully');
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
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
                    value={personalDetails.id_passport}
                    onChange={(e) => setPersonalDetails(prev => ({ ...prev, id_passport: e.target.value }))}
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

              <Button onClick={handlePersonalDetailsUpdate}>
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
              {/* Resume Upload */}
              <div>
                <Label>Resume Upload</Label>
                <div className="mt-2">
                  <FileUpload
                    onFileSelect={handleResumeUpload}
                    accept=".pdf"
                    maxSize={10}
                    uploadType="resume"
                    currentFileUrl={profile?.resume_url}
                    isUploading={isUploading}
                  />
                </div>
              </div>

              {/* Skills */}
              <SkillsSelector
                selectedSkills={profile?.skills || []}
                onSkillsChange={handleSkillsUpdate}
                onUpdate={() => {}}
              />
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
              <EducationQualifications
                educationRecords={educationRecords}
                onAddEducation={addEducationRecord}
                onDeleteEducation={deleteEducationRecord}
                uploadFile={uploadFile}
              />
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
