
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { FileUpload } from '../ui/file-upload';
import { Job } from '@/types';
import { useCandidate } from '@/hooks/useCandidate';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

interface JobApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

const JobApplicationModal = ({ job, isOpen, onClose }: JobApplicationModalProps) => {
  const { profile, uploadFile } = useCandidate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    appliedPosition: job.title,
    earliestStartDate: '',
    preferredInterviewDate: '',
    coverLetter: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [additionalDocsFile, setAdditionalDocsFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast.error('Profile not found. Please complete your profile first.');
      return;
    }

    if (!resumeFile) {
      toast.error('Please upload a resume');
      return;
    }

    setLoading(true);
    setUploadProgress('Preparing application...');

    try {
      let resumeUrl = '';
      let additionalDocsUrl = '';

      // Upload resume
      setUploadProgress('Uploading resume...');
      resumeUrl = await uploadFile(resumeFile, 'resumes', 'applications/');
      
      // Upload additional documents if provided
      if (additionalDocsFile) {
        setUploadProgress('Uploading additional documents...');
        additionalDocsUrl = await uploadFile(additionalDocsFile, 'documents', 'applications/');
      }

      setUploadProgress('Submitting application...');

      // Insert into applications table with only the required fields
      const applicationData = {
        job_id: job.id,
        candidate_id: profile.id,
        status: 'applied' as const
      };

      console.log('Submitting application data:', applicationData);

      const { data: applicationResult, error: applicationError } = await supabase
        .from('applications')
        .insert(applicationData)
        .select()
        .single();

      if (applicationError) {
        console.error('Application submission error:', applicationError);
        throw applicationError;
      }

      // Store additional application details in a separate table or update candidate profile
      // For now, we'll update the candidate's resume_url if it's their latest
      if (resumeUrl && profile.resume_url !== resumeUrl) {
        await supabase
          .from('candidates')
          .update({ resume_url: resumeUrl })
          .eq('id', profile.id);
      }

      console.log('Application submitted successfully:', applicationResult);
      toast.success('Application submitted successfully!');
      onClose();
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        appliedPosition: job.title,
        earliestStartDate: '',
        preferredInterviewDate: '',
        coverLetter: ''
      });
      setResumeFile(null);
      setAdditionalDocsFile(null);
      
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error(`Failed to submit application: ${error.message}`);
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for {job.title}</DialogTitle>
        </DialogHeader>
        
        {uploadProgress && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">{uploadProgress}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="appliedPosition">Applied Position</Label>
            <Input
              id="appliedPosition"
              value={formData.appliedPosition}
              onChange={(e) => setFormData(prev => ({ ...prev, appliedPosition: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="earliestStartDate">Earliest Start Date</Label>
              <Input
                id="earliestStartDate"
                type="date"
                value={formData.earliestStartDate}
                onChange={(e) => setFormData(prev => ({ ...prev, earliestStartDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="preferredInterviewDate">Preferred Interview Date</Label>
              <Input
                id="preferredInterviewDate"
                type="date"
                value={formData.preferredInterviewDate}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredInterviewDate: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="coverLetter">Cover Letter</Label>
            <Textarea
              id="coverLetter"
              rows={4}
              value={formData.coverLetter}
              onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
              placeholder="Tell us why you're interested in this position..."
            />
          </div>

          <div>
            <Label>Resume Upload (PDF only) *</Label>
            <div className="mt-2">
              <FileUpload
                onFileSelect={setResumeFile}
                onFileRemove={() => setResumeFile(null)}
                accept=".pdf"
                maxSize={10}
                currentFile={resumeFile}
                currentFileName={resumeFile?.name}
                placeholder="Drop your resume here to upload"
                disabled={!!uploadProgress}
              />
            </div>
          </div>

          <div>
            <Label>Additional Documents</Label>
            <div className="mt-2">
              <FileUpload
                onFileSelect={setAdditionalDocsFile}
                onFileRemove={() => setAdditionalDocsFile(null)}
                accept=".pdf,.doc,.docx"
                maxSize={10}
                currentFile={additionalDocsFile}
                currentFileName={additionalDocsFile?.name}
                placeholder="Drop additional documents here to upload"
                disabled={!!uploadProgress}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !resumeFile}>
              {loading ? uploadProgress || 'Submitting...' : 'Apply'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationModal;
