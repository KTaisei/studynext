import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { MessageCircle } from 'lucide-react';

interface Question {
  id: string;
  title: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
  };
  answers: {
    id: string;
  }[];
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          profiles:user_id(username),
          answers(id)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setQuestions(data);
      }
      setLoading(false);
    }

    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">最近の質問</h1>
      <div className="space-y-6">
        {questions.map((question) => (
          <Link
            key={question.id}
            to={`/question/${question.id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {question.title}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{question.content}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>{question.profiles.username}</span>
                  <span>{format(new Date(question.created_at), 'yyyy/MM/dd HH:mm')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{question.answers.length}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}