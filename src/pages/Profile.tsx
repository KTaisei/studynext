import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { User, MessageCircle, Trophy } from 'lucide-react';

interface UserStats {
  questions_count: number;
  answers_count: number;
  helpful_votes: number;
}

interface Question {
  id: string;
  title: string;
  created_at: string;
  answers: { id: string }[];
  subjects: { name: string };
}

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      if (!user) return;

      try {
        // Fetch user stats
        const { data: statsData } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (statsData) {
          setStats(statsData);
        }

        // Fetch user's questions
        const { data: questionsData } = await supabase
          .from('questions')
          .select(`
            id,
            title,
            created_at,
            answers(id),
            subjects(name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (questionsData) {
          setQuestions(questionsData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-6">
          <User className="h-12 w-12 text-indigo-600 p-2 bg-indigo-100 rounded-full" />
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <MessageCircle className="h-8 w-8 opacity-80" />
              <span className="text-2xl font-bold">{stats?.questions_count || 0}</span>
            </div>
            <p className="mt-2 text-indigo-100">質問数</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <MessageCircle className="h-8 w-8 opacity-80" />
              <span className="text-2xl font-bold">{stats?.answers_count || 0}</span>
            </div>
            <p className="mt-2 text-emerald-100">回答数</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <Trophy className="h-8 w-8 opacity-80" />
              <span className="text-2xl font-bold">{stats?.helpful_votes || 0}</span>
            </div>
            <p className="mt-2 text-amber-100">いいね数</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">自分の質問</h2>
          <div className="space-y-4">
            {questions.map((question) => (
              <a
                key={question.id}
                href={`/question/${question.id}`}
                className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {question.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>{format(new Date(question.created_at), 'yyyy/MM/dd HH:mm')}</span>
                    {question.subjects?.name && (
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
                        {question.subjects.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{question.answers.length}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}