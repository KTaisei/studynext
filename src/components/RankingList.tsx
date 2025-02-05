import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, MessageCircle, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface QuestionRanking {
  id: string;
  title: string;
  answers_count: number;
  created_at: string;
  profiles: {
    username: string;
  };
  subjects: {
    name: string;
  } | null;
}

export default function RankingList() {
  const [topQuestions, setTopQuestions] = useState<QuestionRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopQuestions() {
      try {
        // First, get all questions with their answer counts
        const { data } = await supabase
          .from('questions')
          .select(`
            id,
            title,
            created_at,
            profiles:user_id(username),
            subjects:subject_id(name),
            answers(id)
          `);

        if (data) {
          // Sort questions by answer count and take top 10
          const sortedQuestions = data
            .map(question => ({
              ...question,
              answers_count: question.answers.length
            }))
            .sort((a, b) => b.answers_count - a.answers_count)
            .slice(0, 10);

          setTopQuestions(sortedQuestions);
        }
      } catch (error) {
        console.error('Error fetching top questions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopQuestions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <Trophy className="h-6 w-6 text-amber-500 mr-2" />
        回答数ランキング
      </h2>
      <div className="space-y-4">
        {topQuestions.map((question, index) => (
          <Link
            key={question.id}
            to={`/question/${question.id}`}
            className="block p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-full flex-shrink-0">
                <span className="text-sm font-bold">{index + 1}</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-gray-900 font-medium mb-1 line-clamp-2">
                  {question.title}
                </h3>
                <div className="flex items-center text-sm text-gray-600 space-x-3">
                  <span>{question.profiles.username}</span>
                  <span>{format(new Date(question.created_at), 'yyyy/MM/dd')}</span>
                  {question.subjects && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                      {question.subjects.name}
                    </span>
                  )}
                  <div className="flex items-center text-amber-600">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span>{question.answers_count}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}