import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { MessageCircle, Trash2 } from 'lucide-react';
import SubjectFilter from '../components/SubjectFilter';
import RankingList from '../components/RankingList';
import PinnedComments from '../components/PinnedComments.tsx';

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
  subjects: {
    id: string;
    name: string;
  };
}

interface Subject {
  id: string;
  name: string;
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchData();
  }, [selectedSubject]);

  async function checkAdminStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          role_id,
          user_roles!inner (
            name
          )
        `)
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        setIsAdmin(data.user_roles.name === 'admin');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  }

  async function fetchData() {
    try {
      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (subjectsData) {
        setSubjects(subjectsData);
      }

      // Fetch questions
      let query = supabase
        .from('questions')
        .select(`
          *,
          profiles:user_id(username),
          answers(id),
          subjects(id, name)
        `)
        .order('created_at', { ascending: false });

      if (selectedSubject) {
        query = query.eq('subject_id', selectedSubject);
      }

      const { data: questionsData } = await query;

      if (questionsData) {
        setQuestions(questionsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!window.confirm('この質問を削除してもよろしいですか？')) {
      return;
    }

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);

    if (!error) {
      fetchData();
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PinnedComments />
          
          <SubjectFilter
            subjects={subjects}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
          />

          <div className="space-y-6">
            {questions.map((question) => (
              <div key={question.id} className="relative">
                <Link
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
                        {question.subjects && (
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
                  </div>
                </Link>
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteQuestion(question.id);
                    }}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 bg-white rounded-full shadow-sm hover:shadow-md transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <RankingList />
        </div>
      </div>
    </div>
  );
}