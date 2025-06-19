import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Upload, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { FileUpload } from '../ui/file-upload';
import { EducationRecord } from '@/hooks/useCandidate';

interface EducationQualificationsProps {
  educationRecords: EducationRecord[];
  onAddEducation: (qualificationType: string, documentUrl?: string) => void;
  onDeleteEducation: (recordId: string) => void;
  uploadFile: (file: File, bucket: string, folder: string) => Promise<string>;
}

const QUALIFICATION_TYPES = [
  'High School Diploma',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'PhD/Doctorate',
  'Professional Certificate',
  'Trade Certification',
  'Diploma',
  'Online Course Certificate',
  'Bootcamp Certificate',
  'Industry Certification',
  'Other'
];

const EducationQualifications: React.FC<EducationQualificationsProps> = ({
  educationRecords,
  onAddEducation,
  onDeleteEducation,
  uploadFile
}) => {
  const [selectedQualification, setSelectedQualification] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocumentUrl, setUploadedDocumentUrl] = useState<string>('');

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const documentUrl = await uploadFile(file, 'documents', 'education/');
      setUploadedDocumentUrl(documentUrl);
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddQualification = () => {
    if (!selectedQualification) {
      toast.error('Please select a qualification type');
      return;
    }

    onAddEducation(selectedQualification, uploadedDocumentUrl || undefined);
    setSelectedQualification('');
    setUploadedDocumentUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Add New Qualification */}
      <Card>
        <CardHeader>
          <CardTitle>Add Educational Qualification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Qualification Type</label>
            <Select value={selectedQualification} onValueChange={setSelectedQualification}>
              <SelectTrigger>
                <SelectValue placeholder="Select qualification type" />
              </SelectTrigger>
              <SelectContent>
                {QUALIFICATION_TYPES.map((qualification) => (
                  <SelectItem key={qualification} value={qualification}>
                    {qualification}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Upload Document (Optional)</label>
            <FileUpload
              onFileSelect={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              maxSize={10}
              uploadType="document"
              currentFileUrl={uploadedDocumentUrl}
              isUploading={isUploading}
            />
          </div>

          <Button 
            onClick={handleAddQualification}
            disabled={!selectedQualification}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Add Qualification
          </Button>
        </CardContent>
      </Card>

      {/* Existing Qualifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Your Qualifications</h3>
        {educationRecords.length === 0 ? (
          <p className="text-muted-foreground">No qualifications added yet.</p>
        ) : (
          educationRecords.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">{record.qualification_type}</h4>
                      <p className="text-sm text-muted-foreground">
                        Added {new Date(record.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {record.document_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(record.document_url, '_blank')}
                      >
                        View Document
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteEducation(record.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EducationQualifications;
