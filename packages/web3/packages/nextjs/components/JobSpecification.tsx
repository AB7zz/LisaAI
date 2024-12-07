"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Specification {
  role: string;
  requirements: string;
}

const JobSpecification: React.FC = () => {
  const router = useRouter();
  const [jobRole, setJobRole] = useState<string>('');
  const [requirements, setRequirements] = useState<string>('');

  const isFormValid = jobRole.trim() !== '' && requirements.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const specification: Specification = {
      role: jobRole,
      requirements,
    };

    try {
      // Make POST request to generate questions
      const response = await fetch('http://localhost:5000/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(specification),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const generatedQuestions = await response.json();
      
      // Store both specification and generated questions
      localStorage.setItem('jobSpecification', JSON.stringify(specification));
      localStorage.setItem('generatedQuestions', JSON.stringify(generatedQuestions));

      // Navigate to questions page
      router.push('/questions');
    } catch (error) {
      console.error('Error generating questions:', error);
      // Handle error appropriately
    }
  };

  return (
    <div className="w-1/2 mx-auto mt-16 p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Job Specification Form</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Input */}
        <div className="space-y-2">
          <label htmlFor="jobRole" className="block text-sm font-medium text-gray-700">
            Job Role
          </label>
          <input
            type="text"
            id="jobRole"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            placeholder="Specify the role to be hired"
            required
            className="w-full px-4 py-2 border bg-white border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-300 outline-none transition text-gray-700"
          />
        </div>

        {/* Requirements Text Area */}
        <div className="space-y-2">
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
            Requirements
          </label>
          <textarea
            id="requirements"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="List the requirements for the role"
            required
            className="w-full px-4 py-2 h-32 border bg-white border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-300 outline-none transition resize-none text-gray-700"
          />
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full px-4 py-2 text-white font-medium rounded-md transition-colors ${
            isFormValid 
              ? 'bg-gray-800 hover:bg-gray-900' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Generate Specification
        </button>
      </form>
    </div>
  );
};

export default JobSpecification;
