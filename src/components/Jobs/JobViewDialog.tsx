
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Building, MapPin, Clock, GraduationCap, Users, Bell, Calendar, Globe } from 'lucide-react';

interface JobViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: {
    id: string;
    job_title: string;
    employer: string;
    website?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    qualification: string;
    experience_level: string;
    notice_period?: string;
    job_description: string;
    skills_required: string[];
    post_duration: string;
    expires_at: string;
    created_at: string;
    status: string;
  };
}

const JobViewDialog: React.FC<JobViewDialogProps> = ({
  open,
  onOpenChange,
  job
}) => {
  const formatAddress = () => {
    const addressParts = [
      job.address_line1,
      job.address_line2,
      job.city,
      job.state,
      job.zip_code,
      job.country
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

  const formatDuration = (duration: string) => {
    const durationMap: { [key: string]: string } = {
      '7-days': '7 Days',
      '15-days': '15 Days',
      '30-days': '30 Days',
      '60-days': '60 Days',
      '90-days': '90 Days'
    };
    return durationMap[duration] || duration;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{job.job_title}</DialogTitle>
              <DialogDescription className="text-lg mt-1">
                Posted Job Details
              </DialogDescription>
            </div>
            <Badge className={getStatusColor(job.status)}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{job.employer}</span>
                  </div>
                  {job.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={job.website.startsWith('http') ? job.website : `https://${job.website}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {job.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
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
                    <span className="text-sm ml-2">{formatQualification(job.qualification)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Experience:</span>
                    <span className="text-sm ml-2">{formatExperience(job.experience_level)}</span>
                  </div>
                </div>
                
                {job.notice_period && (
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium">Notice Period:</span>
                      <span className="text-sm ml-2">{formatNoticePeriod(job.notice_period)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills */}
              {job.skills_required.length > 0 && (
                <div>
                  <span className="text-sm font-medium mb-2 block">Required Skills:</span>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill, index) => (
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
                  {job.job_description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Posting Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Posting Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Posted On:</span>
                    <span className="text-sm ml-2">{formatDate(job.created_at)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Duration:</span>
                    <span className="text-sm ml-2">{formatDuration(job.post_duration)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Expires On:</span>
                    <span className="text-sm ml-2">{formatDate(job.expires_at)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobViewDialog;
