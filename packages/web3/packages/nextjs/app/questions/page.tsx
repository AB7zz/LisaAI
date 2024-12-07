"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  id: number;
  text: string;
}

const Questions: React.FC = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    // Try to get questions from localStorage
    const storedQuestions = localStorage.getItem('generatedQuestions');
    if (storedQuestions) {
      // Assuming the API returns an array of question strings
      const parsedQuestions = JSON.parse(storedQuestions);
      
      // Transform the questions into the required format with IDs
      const formattedQuestions = parsedQuestions.map((text: string, index: number) => ({
        id: index + 1,
        text,
      }));
      
      setQuestions(formattedQuestions);
    }
  }, []);

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setEditText(question.text);
  };

  const handleSave = (id: number) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, text: editText } : q
    ));
    setEditingId(null);
    setEditText('');
  };

  const generateUrl = () => {
    const uniqueId = Math.random().toString(36).substr(2, 9);
    router.push(`/interview/${uniqueId}`);
  };

  return (
    <div className="w-1/2 mx-auto mt-16 p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Interview Questions</h2>
      
      <div className="space-y-4">
        {questions.map(question => (
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
                <span className="flex-1">{question.text}</span>
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
    </div>
  );
};

export default Questions;