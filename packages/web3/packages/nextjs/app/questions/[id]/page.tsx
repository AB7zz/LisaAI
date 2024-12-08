"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

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
    try {
      const uniqueId = Math.random().toString(36).substr(2, 9);

      // Create bucket first
      await apiRequest('POST', '/buckets', { bucketName: uniqueId });
      
      // Upload the current questions state to the server
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

      // Navigate to the interview page only after successful upload
      router.push(`/${uniqueId}`);
    } catch (error) {
      console.error('Error uploading questions:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="w-1/2 mx-auto mt-16 p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Interview Questions</h2>
      
      <div className="space-y-4">
        {questions && questions.map(question => (
          <div key={question.id} className="flex items-center space-x-4 p-4 border rounded-md hover:border-gray-400 transition-colors">
            {editingId === question.id ? (
              <>
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 px-4 py-2 border bg-white text-gray-800 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-300 outline-none transition"
                  autoFocus
                />
                <button
                  onClick={() => handleSave(question.id)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <span className="flex-1">{question.question}</span>
                <button
                  onClick={() => handleEdit(question)}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <span className="text-lg">✎</span>
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={generateUrl}
        className="mt-8 w-full px-4 py-2 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-900 transition-colors"
      >
        Generate URL
      </button>

      {generatedUrl && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <p className="text-gray-700 mb-2">Generated URL:</p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={generatedUrl}
              readOnly
              className="flex-1 px-4 py-2 bg-white border rounded-md"
            />
            <button
              onClick={() => navigator.clipboard.writeText(generatedUrl)}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;