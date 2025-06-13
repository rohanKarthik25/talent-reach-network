
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Job } from '@/types';
import { useCandidate } from '@/hooks/useCandidate';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

interface JobApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

const JobApplicationModal = ({ job, isOpen, onClose }: JobApplicationModalProps) => {
  const { profile, uploadFile } = useCandidate();
  const [loading, setLoading] = useState(false);
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
      toast.error('Profile not found');
      return;
    }

    setLoading(true);
    try {
      let resumeUrl = '';
      let additionalDocsUrl = '';

      if (resumeFile) {
        resumeUrl = await uploadFile(resumeFile, 'resumes', 'applications/');
      }

      if (additionalDocsFile) {
        additionalDocsUrl = await uploadFile(additionalDocsFile, 'documents', 'applications/');
      }

      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          candidate_id: profile.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          applied_position: formData.appliedPosition,
          earliest_start_date: formData.earliestStartDate || null,
          preferred_interview_date: formData.preferredInterviewDate || null,
          cover_letter: formData.coverLetter,
          resume_url: resumeUrl,
          additional_documents_url: additionalDocsUrl
        });

      if (error) throw error;

      toast.success('Application submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Job Application Form</DialogTitle>
        </DialogHeader>
        
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
            />
          </div>

          <div>
            <Label>Resume Upload (PDF only) *</Label>
            <div className="mt-2">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="hidden"
                id="resume-upload"
                required
              />
              <label htmlFor="resume-upload">
                <Button type="button" variant="outline" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {resumeFile ? resumeFile.name : 'Upload Resume'}
                </Button>
              </label>
            </div>
          </div>

          <div>
            <Label>Additional Documents</Label>
            <div className="mt-2">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setAdditionalDocsFile(e.target.files?.[0] || null)}
                className="hidden"
                id="docs-upload"
              />
              <label htmlFor="docs-upload">
                <Button type="button" variant="outline" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {additionalDocsFile ? additionalDocsFile.name : 'Upload Documents'}
                </Button>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Apply'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationModal;
