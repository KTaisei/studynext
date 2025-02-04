import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ImageUpload from '../components/ImageUpload';
import MathKeyboard from '../components/MathKeyboard';

interface Question {
  id: string;
  title: string;
  content: string;
  images: string[];
  math_content: string;
  created_at: string;
  profiles: {
    username: string;
  };
}

interface Answer {
  id: string;
  content: string;
  images: string[];
  math_content: string;
  created_at: string;
  likes_count: number;
  user_has_liked: boolean;
  profiles: {
    username: string;
  };
}

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [answerImages, setAnswerImages] = useState<string[]>([]);
  const [mathInput, setMathInput] = useState('');
  const [showMathKeyboard, setShowMathKeyboard] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    async function fetchQuestionAndAnswers() {
      if (!id) return;

      const { data: questionData } = await supabase
        .from('questions')
        .select(`
          *,
          profiles:user_id(username)
        `)
        .eq('id', id)
        .single();

      if (questionData) {
        setQuestion(questionData);
      }

      const { data: answersData } = await supabase
        .from('answers')
        .select(`
          *,
          profiles:user_id(username),
          likes:answer_likes(user_id)
        `)
        .eq('question_id', id)
        .order('created_at', { ascending: true });

      if (answersData) {
        const formattedAnswers = answersData.map(answer => ({
          ...answer,
          likes_count: answer.likes?.length || 0,
          user_has_liked: answer.likes?.some(like => like.user_id === user?.id) || false
        }));
        setAnswers(formattedAnswers);
      }
    }

    fetchQuestionAndAnswers();
  }, [id, user?.id]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    try {
      const { error: insertError, data } = await supabase
        .from('answers')
        .insert([
          {
            question_id: id,
            user_id: user.id,
            content: newAnswer,
            images: answerImages,
            math_content: mathInput,
          },
        ])
        .select(`
          *,
          profiles:user_id(username)
        `)
        .single();

      if (insertError) throw insertError;
      if (data) {
        const newAnswerWithLikes = {
          ...data,
          likes_count: 0,
          user_has_liked: false
        };
        setAnswers([...answers, newAnswerWithLikes]);
        setNewAnswer('');
        setAnswerImages([]);
        setMathInput('');
      }
    } catch (err) {
      setError('回答の投稿に失敗しました。');
    }
  };

  const handleToggleLike = async (answerId: string, currentLiked: boolean) => {
    if (!user) return;

    try {
      if (currentLiked) {
        await supabase
          .from('answer_likes')
          .delete()
          .eq('answer_id', answerId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('answer_likes')
          .insert([{ answer_id: answerId, user_id: user.id }]);
      }

      setAnswers(answers.map(answer => {
        if (answer.id === answerId) {
          return {
            ...answer,
            likes_count: currentLiked ? answer.likes_count - 1 : answer.likes_count + 1,
            user_has_liked: !currentLiked
          };
        }
        return answer;
      }));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleMathSymbolInsert = (symbol: string) => {
    setMathInput((prev) => prev + symbol);
  };

  if (!question) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{question.content}</p>
        
        {question.images && question.images.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4">
              {question.images.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Question image ${index + 1}`}
                  className="rounded-lg max-h-96 object-contain"
                />
              ))}
            </div>
          </div>
        )}

        {question.math_content && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <BlockMath math={question.math_content} />
          </div>
        )}

        <div className="text-sm text-gray-500">
          <span className="font-medium">{question.profiles.username}</span>
          <span className="mx-2">•</span>
          <span>{format(new Date(question.created_at), 'yyyy/MM/dd HH:mm')}</span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          回答 ({answers.length})
        </h2>
        <div className="space-y-6">
          {answers.map((answer) => (
            <div key={answer.id} className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{answer.content}</p>
              
              {answer.images && answer.images.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    {answer.images.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Answer image ${index + 1}`}
                        className="rounded-lg max-h-96 object-contain"
                      />
                    ))}
                  </div>
                </div>
              )}

              {answer.math_content && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <BlockMath math={answer.math_content} />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{answer.profiles.username}</span>
                  <span className="mx-2">•</span>
                  <span>{format(new Date(answer.created_at), 'yyyy/MM/dd HH:mm')}</span>
                </div>
                <button
                  onClick={() => handleToggleLike(answer.id, answer.user_has_liked)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                    answer.user_has_liked
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'text-gray-500 hover:text-indigo-600'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{answer.likes_count}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {user && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <MessageSquare className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold ml-2">回答を投稿する</h2>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitAnswer}>
            <div className="mb-4">
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32"
                placeholder="回答を入力してください"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                画像
              </label>
              <ImageUpload images={answerImages} onImagesChange={setAnswerImages} />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                数式
              </label>
              <div className="space-y-4">
                <textarea
                  value={mathInput}
                  onChange={(e) => setMathInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="LaTeX形式で数式を入力してください"
                />
                <button
                  type="button"
                  onClick={() => setShowMathKeyboard(!showMathKeyboard)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  {showMathKeyboard ? '数式キーボードを隠す' : '数式キーボードを表示'}
                </button>
                {showMathKeyboard && (
                  <MathKeyboard onInsert={handleMathSymbolInsert} />
                )}
                {mathInput && (
                  <div className="p-4 border rounded-md">
                    <p className="text-sm text-gray-600 mb-2">プレビュー:</p>
                    <BlockMath math={mathInput} />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              回答を投稿
            </button>
          </form>
        </div>
      )}
    </div>
  );
}