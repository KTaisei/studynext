import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { HelpCircle } from 'lucide-react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ImageUpload from '../components/ImageUpload';
import MathKeyboard from '../components/MathKeyboard';

export default function AskQuestion() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [mathInput, setMathInput] = useState('');
  const [showMathKeyboard, setShowMathKeyboard] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error: insertError, data } = await supabase
        .from('questions')
        .insert([
          {
            user_id: user.id,
            title,
            content,
            images,
            math_content: mathInput,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      if (data) {
        navigate(`/question/${data.id}`);
      }
    } catch (err) {
      setError('質問の投稿に失敗しました。');
    }
  };

  const handleMathSymbolInsert = (symbol: string) => {
    setMathInput((prev) => prev + symbol);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center mb-8">
          <HelpCircle className="h-8 w-8 text-indigo-600" />
          <h1 className="text-2xl font-bold ml-2">質問を投稿する</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              タイトル
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="質問のタイトルを入力してください"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              質問内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 h-48"
              placeholder="質問の詳細を入力してください"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              画像
            </label>
            <ImageUpload images={images} onImagesChange={setImages} />
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
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200"
          >
            質問を投稿する
          </button>
        </form>
      </div>
    </div>
  );
}