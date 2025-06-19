
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';

interface SkillsSelectorProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  onUpdate: () => void;
}

const SKILL_OPTIONS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'C++',
  'HTML',
  'CSS',
  'SQL',
  'MongoDB',
  'PostgreSQL',
  'Git',
  'Docker',
  'AWS',
  'Azure',
  'Google Cloud',
  'Project Management',
  'Agile',
  'Scrum',
  'Leadership',
  'Communication',
  'Problem Solving',
  'Data Analysis',
  'Machine Learning',
  'Artificial Intelligence',
  'Cybersecurity',
  'DevOps',
  'Mobile Development',
  'Web Development',
  'UI/UX Design',
  'Graphic Design',
  'Digital Marketing',
  'SEO',
  'Content Writing',
  'Sales',
  'Customer Service',
  'Accounting',
  'Finance',
  'Human Resources',
  'Legal',
  'Healthcare',
  'Education',
  'Research',
  'Quality Assurance',
  'Testing',
  'Business Analysis',
  'Consulting',
  'Operations Management'
];

const SkillsSelector: React.FC<SkillsSelectorProps> = ({
  selectedSkills,
  onSkillsChange,
  onUpdate
}) => {
  const [selectedSkill, setSelectedSkill] = useState<string>('');

  const handleAddSkill = () => {
    if (selectedSkill && !selectedSkills.includes(selectedSkill)) {
      const updatedSkills = [...selectedSkills, selectedSkill];
      onSkillsChange(updatedSkills);
      setSelectedSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = selectedSkills.filter(skill => skill !== skillToRemove);
    onSkillsChange(updatedSkills);
  };

  const availableSkills = SKILL_OPTIONS.filter(skill => !selectedSkills.includes(skill));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Skills</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedSkills.map((skill, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {skill}
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="flex gap-2">
        <Select value={selectedSkill} onValueChange={setSelectedSkill}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a skill to add" />
          </SelectTrigger>
          <SelectContent>
            {availableSkills.map((skill) => (
              <SelectItem key={skill} value={skill}>
                {skill}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          onClick={handleAddSkill}
          disabled={!selectedSkill}
          variant="outline"
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default SkillsSelector;
