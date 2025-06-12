
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Building, MapPin, Clock, FileText, Download } from 'lucide-react';

const CandidateApplications = () => {
  const [statusFilter, setStatusFilter] = useState('all');

  const mockApplications = [
    {
      id: '1',
      jobTitle: 'Frontend Developer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      appliedDate: '2024-01-15',
      deadline: '2024-02-15',
      status: 'under_review',
      salary: 'INR 800000 - 1200000',
      skills: ['React', 'TypeScript', 'CSS'],
    },
    {
      id: '2',
      jobTitle: 'React Developer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      appliedDate: '2024-01-14',
      deadline: '2024-02-10',
      status: 'applied',
      salary: 'INR 600000 - 900000',
      skills: ['React', 'JavaScript', 'HTML'],
    },
    {
      id: '3',
      jobTitle: 'Full Stack Developer',
      company: 'Innovation Labs',
      location: 'Austin, TX',
      appliedDate: '2024-01-12',
      deadline: '2024-02-05',
      status: 'rejected',
      salary: 'INR 1000000 - 1500000',
      skills: ['Node.js', 'React', 'MongoDB'],
    },
    {
      id: '4',
      jobTitle: 'Software Engineer',
      company: 'Global Tech',
      location: 'Remote',
      appliedDate: '2024-01-10',
      deadline: '2024-01-30',
      status: 'pending_submission',
      salary: 'INR 700000 - 1000000',
      skills: ['Python', 'Django', 'PostgreSQL'],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending_submission':
        return 'bg-orange-100 text-orange-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'applied':
        return 'Applied';
      case 'under_review':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      case 'pending_submission':
        return 'Pending Submission';
      case 'hired':
        return 'Hired';
      default:
        return status;
    }
  };

  const filteredApplications = mockApplications.filter(app => 
    statusFilter === 'all' || app.status === statusFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
          <p className="text-muted-foreground mt-2">
            Track your job applications and their current status
          </p>
        </div>
      </div>

      {/* Tabs for different application views */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="pending_submission">Pending Submission</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {filteredApplications.length} application(s) found
          </div>
          
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold">{application.jobTitle}</h3>
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusText(application.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {application.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {application.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Applied: {application.appliedDate}
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-3">
                        <strong>Salary:</strong> {application.salary} | <strong>Deadline:</strong> {application.deadline}
                      </div>
                      
                      <div className="flex gap-2 mb-3">
                        {application.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Active applications will be shown here</p>
          </div>
        </TabsContent>

        <TabsContent value="submitted">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Submitted applications will be shown here</p>
          </div>
        </TabsContent>

        <TabsContent value="archived">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Archived applications will be shown here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateApplications;
