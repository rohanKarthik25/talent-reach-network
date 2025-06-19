import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Building, MapPin, Clock, GraduationCap, Users, Bell } from 'lucide-react';

interface JobPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobData: {
    jobTitle: string;
    employer: string;
    website: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    qualification: string;
    experienceLevel: string;
    noticePeriod: string;
    jobDescription: string;
  };
  skills: string[];
  onConfirmPost: (duration: string) => Promise<void>;
}

const JobPreviewDialog: React.FC<JobPreviewDialogProps> = ({
  open,
  onOpenChange,
  jobData,
  skills,
  onConfirmPost
}) => {
  const [postDuration, setPostDuration] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleConfirmPost = async () => {
    if (postDuration) {
      setIsPosting(true);
      try {
        await onConfirmPost(postDuration);
      } finally {
        setIsPosting(false);
      }
    }
  };

  const formatAddress = () => {
    const addressParts = [
      jobData.addressLine1,
      jobData.addressLine2,
      jobData.city,
      jobData.state,
      jobData.zipCode,
      jobData.country
    ].filter(Boolean);
    
    return addressParts.join(', ');
  };

  const formatQualification = (qual: string) => {
    const qualMap: { [key: string]: string } = {
      'bachelors': "Bachelor's Degree",
      'masters': "Master's Degree",
      'phd': 'PhD',
      'diploma': 'Diploma'
    };
    return qualMap[qual] || qual;
  };

  const formatExperience = (exp: string) => {
    return exp === 'fresher' ? 'Fresher' : 'Experienced';
  };

  const formatNoticePeriod = (period: string) => {
    const periodMap: { [key: string]: string } = {
      'immediate': 'Immediate',
      '15-days': '15 Days',
      '1-month': '1 Month',
      '2-months': '2 Months',
      '3-months': '3 Months'
    };
    return periodMap[period] || period;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Job Preview</DialogTitle>
          <DialogDescription>
            Review your job posting before it goes live
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-primary">{jobData.jobTitle}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{jobData.employer}</span>
                    {jobData.website && (
                      <span className="text-muted-foreground">• {jobData.website}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{formatAddress()}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Job Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Qualification:</span>
                    <span className="text-sm ml-2">{formatQualification(jobData.qualification)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Experience:</span>
                    <span className="text-sm ml-2">{formatExperience(jobData.experienceLevel)}</span>
                  </div>
                </div>
                
                {jobData.noticePeriod && (
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium">Notice Period:</span>
                      <span className="text-sm ml-2">{formatNoticePeriod(jobData.noticePeriod)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills */}
              {skills.length > 0 && (
                <div>
                  <span className="text-sm font-medium mb-2 block">Required Skills:</span>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {jobData.jobDescription}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Post Duration Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Post Duration
              </CardTitle>
              <CardDescription>
                Select how long you want this job posting to remain active
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Select value={postDuration} onValueChange={setPostDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select posting duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7-days">7 Days</SelectItem>
                    <SelectItem value="15-days">15 Days</SelectItem>
                    <SelectItem value="30-days">30 Days</SelectItem>
                    <SelectItem value="60-days">60 Days</SelectItem>
                    <SelectItem value="90-days">90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPosting}>
            Edit Job
          </Button>
          <Button 
            onClick={handleConfirmPost}
            disabled={!postDuration || isPosting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPosting ? 'Posting...' : 'Confirm & Post Job'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobPreviewDialog;
