
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import JobViewDialog from '../components/Jobs/JobViewDialog';
import { Briefcase, Users, Eye, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePostedJobs } from '../hooks/usePostedJobs';

const PostedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const { jobs, isLoading } = usePostedJobs();

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

  const filteredJobs = jobs.filter(job => 
    statusFilter === 'all' || job.status === statusFilter
  );

  const formatLocation = (job: any) => {
    return `${job.city}, ${job.state}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewJob = (job: any) => {
    setSelectedJob(job);
    setIsViewDialogOpen(true);
  };

  const getJobStats = () => {
    const activeJobs = jobs.filter(job => job.status === 'active').length;
    const totalApplications = 0; // This would come from applications table when implemented
    const avgApplications = jobs.length > 0 ? Math.round(totalApplications / jobs.length) : 0;
    
    return {
      total: jobs.length,
      active: activeJobs,
      totalApplications,
      avgApplications
    };
  };

  const stats = getJobStats();

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
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Posted Jobs</h1>
                <p className="text-muted-foreground mt-2">
                  Manage your job postings and track applications
                </p>
              </div>
              <Button onClick={() => navigate('/jobs/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Jobs</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Jobs</p>
                      <p className="text-2xl font-bold">{stats.active}</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Applications</p>
                      <p className="text-2xl font-bold">{stats.totalApplications}</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Applications</p>
                      <p className="text-2xl font-bold">{stats.avgApplications}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-muted-foreground">
                    {filteredJobs.length} job(s) found
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading jobs...</span>
              </div>
            )}

            {/* Jobs List */}
            {!isLoading && (
              <div className="space-y-4">
                {filteredJobs.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                      <p className="text-muted-foreground mb-4">
                        {statusFilter === 'all' 
                          ? "You haven't posted any jobs yet." 
                          : `No ${statusFilter} jobs found.`}
                      </p>
                      <Button onClick={() => navigate('/jobs/create')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Post Your First Job
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  filteredJobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-semibold">{job.job_title}</h3>
                              <Badge className={getStatusColor(job.status)}>
                                {job.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Company</p>
                                <p className="font-medium">{job.employer}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Location</p>
                                <p className="font-medium">{formatLocation(job)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Experience</p>
                                <p className="font-medium capitalize">{job.experience_level}</p>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-sm text-muted-foreground mb-1">Required Skills</p>
                              <div className="flex gap-2">
                                {job.skills_required.slice(0, 3).map((skill, index) => (
                                  <Badge key={index} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))}
                                {job.skills_required.length > 3 && (
                                  <Badge variant="secondary">
                                    +{job.skills_required.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-sm text-muted-foreground">
                              <strong>Posted:</strong> {formatDate(job.created_at)} | 
                              <strong> Expires:</strong> {formatDate(job.expires_at)}
                            </div>
                          </div>
                          
                          <div className="ml-4 flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewJob(job)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Job View Dialog */}
      {selectedJob && (
        <JobViewDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          job={selectedJob}
        />
      )}
    </div>
  );
};

export default PostedJobs;
