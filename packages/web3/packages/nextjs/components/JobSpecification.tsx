"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';


interface Specification {
  role: string;
  requirements: string;
}

import { motion } from 'framer-motion';
import { FaBriefcase, FaList } from 'react-icons/fa';

const JobSpecification: React.FC = () => {
  const router = useRouter();
  const [jobRole, setJobRole] = useState<string>('');
  const [requirements, setRequirements] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isFormValid = jobRole.trim() !== '' && requirements.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const specification: Specification = {
      role: jobRole,
      requirements,
    };

    try {
      // Generate questions
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
      
      // Store in localStorage
      localStorage.setItem('generatedQuestions', JSON.stringify(generatedQuestions));

      // Navigate to questions page
      router.push(`/questions`);
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  // Loading spinner animation variants
  const spinTransition = {
    repeat: Infinity,
    duration: 1,
    ease: "linear"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-8"
    >
      <motion.div 
        className="w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.h2 
          className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <FaBriefcase className="text-blue-400" />
          Create Your Dream Team
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Input */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="flex items-center text-lg font-medium text-gray-300 gap-2">
              <FaBriefcase className="text-blue-400" />
              Job Role
            </label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g., Senior Frontend Developer"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl 
                         text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 
                         focus:border-transparent outline-none transition-all duration-300
                         hover:border-gray-600"
            />
          </motion.div>

          {/* Requirements Text Area */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="flex items-center text-lg font-medium text-gray-300 gap-2">
              <FaList className="text-blue-400" />
              Requirements
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="List the key requirements for this role..."
              className="w-full px-4 py-3 h-40 bg-gray-900 border border-gray-700 
                         rounded-xl text-white placeholder-gray-500 focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent outline-none 
                         transition-all duration-300 resize-none hover:border-gray-600"
            />
          </motion.div>

          {/* Generate Button */}
          <motion.button
            type="submit"
            disabled={!isFormValid || isLoading}
            whileHover={isFormValid && !isLoading ? { scale: 1.02 } : {}}
            whileTap={isFormValid && !isLoading ? { scale: 0.98 } : {}}
            className={`w-full px-6 py-4 rounded-full font-semibold text-lg transition-all duration-300 relative
              ${isFormValid && !isLoading
                ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 shadow-lg hover:shadow-blue-500/30' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <motion.span
                  className="inline-block w-6 h-6 border-4 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={spinTransition}
                />
                <span>Generating...</span>
              </div>
            ) : (
              "Generate Questions"
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default JobSpecification;
