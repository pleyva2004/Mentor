'use client';

import { useState } from 'react';

interface MissingInfoFormProps {
  sectionId: string;
  onComplete: (content: string) => void;
  onCancel: () => void;
  rawText?: string;
}

const sectionFields = {
  header: [
    { id: 'name', label: 'Full Name', type: 'text', required: true },
    { id: 'email', label: 'Email Address', type: 'email', required: true },
    { id: 'phone', label: 'Phone Number', type: 'tel', required: false },
    { id: 'location', label: 'Location (City, State)', type: 'text', required: false },
    { id: 'linkedin', label: 'LinkedIn URL', type: 'url', required: false },
    { id: 'github', label: 'GitHub URL', type: 'url', required: false }
  ],
  experience: [
    { id: 'company', label: 'Company Name', type: 'text', required: true },
    { id: 'position', label: 'Job Title', type: 'text', required: true },
    { id: 'startDate', label: 'Start Date', type: 'text', required: true },
    { id: 'endDate', label: 'End Date', type: 'text', required: false },
    { id: 'description', label: 'Job Description', type: 'textarea', required: true }
  ],
  education: [
    { id: 'degree', label: 'Degree', type: 'text', required: true },
    { id: 'school', label: 'School/University', type: 'text', required: true },
    { id: 'location', label: 'Location', type: 'text', required: false },
    { id: 'graduationDate', label: 'Graduation Date', type: 'text', required: false },
    { id: 'gpa', label: 'GPA (optional)', type: 'text', required: false }
  ],
  projects: [
    { id: 'name', label: 'Project Name', type: 'text', required: true },
    { id: 'description', label: 'Project Description', type: 'textarea', required: true },
    { id: 'technologies', label: 'Technologies Used', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'text', required: false },
    { id: 'url', label: 'Project URL', type: 'url', required: false }
  ],
  skills: [
    { id: 'languages', label: 'Programming Languages', type: 'text', required: false },
    { id: 'frameworks', label: 'Frameworks/Libraries', type: 'text', required: false },
    { id: 'databases', label: 'Databases', type: 'text', required: false },
    { id: 'tools', label: 'Tools & Technologies', type: 'text', required: false }
  ]
};

export default function MissingInfoForm({ sectionId, onComplete, onCancel, rawText }: MissingInfoFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fields = sectionFields[sectionId as keyof typeof sectionFields] || [];

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const formatContent = (sectionId: string, data: Record<string, string>) => {
    switch (sectionId) {
      case 'header':
        const parts = [];
        if (data.name) parts.push(data.name);
        if (data.email) parts.push(data.email);
        if (data.phone) parts.push(data.phone);
        if (data.location) parts.push(data.location);
        if (data.linkedin) parts.push(data.linkedin);
        if (data.github) parts.push(data.github);
        return `<p>${parts.join(' | ')}</p>`;

      case 'experience':
        return `
          <h4>${data.position || 'Job Title'}</h4>
          <p><em>${data.company || 'Company'} | ${data.startDate || 'Start Date'} - ${data.endDate || 'Present'}</em></p>
          <ul>
            <li>${data.description || 'Job description'}</li>
          </ul>
        `;

      case 'education':
        return `
          <h4>${data.degree || 'Degree'}</h4>
          <p><em>${data.school || 'School'} | ${data.location || 'Location'} | ${data.graduationDate || 'Graduation Date'}</em></p>
          ${data.gpa ? `<p><strong>GPA:</strong> ${data.gpa}</p>` : ''}
        `;

      case 'projects':
        return `
          <h4>${data.name || 'Project Name'}</h4>
          <p><em>${data.description || 'Project description'} | ${data.technologies || 'Technologies'} | ${data.date || 'Date'}</em></p>
          ${data.url ? `<p><strong>URL:</strong> <a href="${data.url}" target="_blank">${data.url}</a></p>` : ''}
        `;

      case 'skills':
        const skillSections = [];
        if (data.languages) skillSections.push(`<p><strong>Languages:</strong> ${data.languages}</p>`);
        if (data.frameworks) skillSections.push(`<p><strong>Frameworks/Libraries:</strong> ${data.frameworks}</p>`);
        if (data.databases) skillSections.push(`<p><strong>Databases:</strong> ${data.databases}</p>`);
        if (data.tools) skillSections.push(`<p><strong>Tools & Technologies:</strong> ${data.tools}</p>`);
        return skillSections.join('');

      default:
        return `<p>No information available</p>`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const content = formatContent(sectionId, formData);
      onComplete(content);
    } catch (error) {
      console.error('Error formatting content:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSectionTitle = (sectionId: string) => {
    const titles = {
      header: 'Contact Information',
      experience: 'Work Experience',
      education: 'Education',
      projects: 'Projects',
      skills: 'Technical Skills'
    };
    return titles[sectionId as keyof typeof titles] || 'Information';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Add {getSectionTitle(sectionId)}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {rawText && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Extracted Text (for reference):</h3>
              <p className="text-sm text-gray-600 max-h-32 overflow-y-auto">
                {rawText.substring(0, 500)}...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.id}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    required={field.required}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                  />
                ) : (
                  <input
                    type={field.type}
                    id={field.id}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={field.required}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                  />
                )}
              </div>
            ))}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {isSubmitting ? 'Adding...' : 'Add Information'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
