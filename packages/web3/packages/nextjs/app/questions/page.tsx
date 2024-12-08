"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaSave, FaLink, FaCopy, FaTrash } from 'react-icons/fa';
import confetti from 'canvas-confetti';

const API_BASE_URL = 'http://localhost:8000';

async function apiRequest(
  method: string, 
  endpoint: string, 
  data: any = null
) {
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}${endpoint}`,
      data,
    });
    console.log(response.data);
  } catch (error: any) {
    console.error(error.response ? error.response.data : error.message);
  }
}

interface Question {
  id: number;
  question: string;
}

const Questions: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Try to get questions from localStorage
    const storedQuestions = localStorage.getItem('generatedQuestions');
    if (storedQuestions) {
      // Assuming the API returns an array of question strings
      const parsedQuestions = JSON.parse(storedQuestions);
      
      setQuestions(parsedQuestions.questions);
    }
  }, []);

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setEditText(question.question);
  };

  const handleSave = (id: number) => {
    const updatedQuestions = questions.map(q => 
      q.id === id ? { ...q, question: editText } : q
    );
    setQuestions(updatedQuestions);
    // Update localStorage with edited questions
    localStorage.setItem('generatedQuestions', JSON.stringify({ questions: updatedQuestions }));
    setEditingId(null);
    setEditText('');
  };

  const generateUrl = async () => {
    setIsLoading(true);
    try {
      const uniqueId = Math.random().toString(36).substr(2, 9);

      await apiRequest('POST', '/buckets', { bucketName: uniqueId });
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bucketName: uniqueId,
          questions: questions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload questions');
      }

      const baseUrl = window.location.origin;
      setGeneratedUrl(`${baseUrl}/${uniqueId}`);
      launchConfetti();
    } catch (error) {
      console.error('Error uploading questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const launchConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 px-4"
    >
      <motion.div 
        className="max-w-3xl mx-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.h2 
          className="text-4xl font-bold text-white mb-8 text-center"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
        >
          Interview Questions
        </motion.h2>
        
        <motion.div className="space-y-4">
          <AnimatePresence mode='wait'>
            {questions && questions.map((question, index) => (
              <motion.div
                key={question.id}
                variants={item}
                layout
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="group"
              >
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-blue-500/10 transition-all duration-300
                             border border-gray-700 hover:border-blue-500/50">
                  {editingId === question.id ? (
                    <div className="flex gap-4">
                      <motion.input
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 
                                 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        autoFocus
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSave(question.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                                 transition-colors flex items-center gap-2"
                      >
                        <FaSave /> Save
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <motion.span 
                        className="text-gray-100 flex-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {index + 1}. {question.question}
                      </motion.span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(question)}
                          className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <FaEdit size={18} />
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateUrl}
          disabled={isLoading}
          className="mt-8 w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-700 
                     text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-800 
                     transition-all duration-300 shadow-lg hover:shadow-blue-500/30
                     flex items-center justify-center gap-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </div>
          ) : (
            <>
              <FaLink /> Generate Interview Link
            </>
          )}
        </motion.button>

        <AnimatePresence>
          {generatedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 p-6 bg-gray-800 rounded-xl border border-gray-700"
            >
              <p className="text-gray-300 mb-3">Share this link with the candidate:</p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={generatedUrl}
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    navigator.clipboard.writeText(generatedUrl);
                    launchConfetti();
                  }}
                  className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                           transition-colors flex items-center gap-2"
                >
                  <FaCopy /> Copy
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Questions;