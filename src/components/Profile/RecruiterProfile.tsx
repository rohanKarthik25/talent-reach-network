
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileUpload } from '../ui/file-upload';
import { Building, MapPin } from 'lucide-react';
import { useRecruiter } from '@/hooks/useRecruiter';
import { toast } from 'sonner';

const RecruiterProfile = () => {
  const { profile, loading, updateProfile, uploadFile } = useRecruiter();
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    description: '',
    location: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        company_name: profile.company_name || '',
        industry: profile.industry || '',
        description: profile.description || '',
        location: profile.location || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const logoUrl = await uploadFile(file, 'company-logos', 'logos/');
      await updateProfile({ logo_url: logoUrl });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Company Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your company information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Company Details
          </CardTitle>
          <CardDescription>
            Update your company profile to attract the best candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Logo */}
            <div>
              <Label>Company Logo</Label>
              <div className="mt-2">
                <FileUpload
                  onFileSelect={handleLogoUpload}
                  onFileRemove={() => updateProfile({ logo_url: null })}
                  accept="image/*"
                  maxSize={5}
                  currentFileUrl={profile?.logo_url}
                  currentFileName={profile?.logo_url ? 'Company Logo' : undefined}
                  placeholder="Drop your company logo here to upload"
                />
              </div>
            </div>

            {/* Company Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Company headquarters location"
              />
            </div>

            <div>
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your company, culture, and what makes it unique"
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full">Update Company Profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecruiterProfile;
