import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Pin, X, PlusCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

interface PinnedComment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
  };
}

export default function PinnedComments() {
  const [comments, setComments] = useState<PinnedComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
    checkAdminStatus();
  }, [user]);

  async function checkAdminStatus() {
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

  async function fetchComments() {
    const { data } = await supabase
      .from('pinned_comments')
      .select('*, profiles:created_by(username)')
      .order('created_at', { ascending: false });

    if (data) {
      setComments(data);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    const { error } = await supabase
      .from('pinned_comments')
      .insert([
        {
          content: newComment.trim(),
          created_by: user.id
        }
      ]);

    if (!error) {
      setNewComment('');
      setShowAddForm(false);
      fetchComments();
    }
  }

  async function handleDeleteComment(id: string) {
    const { error } = await supabase
      .from('pinned_comments')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchComments();
    }
  }

  if (comments.length === 0 && !isAdmin) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Pin className="h-5 w-5 text-indigo-600 mr-2" />
          お知らせ
        </h2>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-1" />
            <span>追加</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="お知らせ内容を入力"
            rows={3}
            required
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              投稿
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-indigo-50 rounded-lg p-4 relative"
          >
            <p className="text-gray-800 mb-2">{comment.content}</p>
            <div className="text-sm text-gray-600">
              <span>{comment.profiles.username}</span>
              <span className="mx-2">•</span>
              <span>{format(new Date(comment.created_at), 'yyyy/MM/dd HH:mm')}</span>
            </div>
            {isAdmin && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}