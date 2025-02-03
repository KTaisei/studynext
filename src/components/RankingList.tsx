import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Medal } from 'lucide-react';

interface UserRanking {
  username: string;
  helpful_votes: number;
  questions_count: number;
  answers_count: number;
}

export default function RankingList() {
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRankings() {
      try {
        const { data } = await supabase
          .from('user_stats')
          .select(`
            helpful_votes,
            questions_count,
            answers_count,
            profiles:user_id(username)
          `)
          .order('helpful_votes', { ascending: false })
          .limit(10);

        if (data) {
          setRankings(data.map(item => ({
            ...item,
            username: item.profiles.username
          })));
        }
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRankings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">{index + 1}</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">ランキング</h2>
      <div className="space-y-4">
        {rankings.map((user, index) => (
          <div
            key={user.username}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-8">
                {getRankIcon(index)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.username}</p>
                <p className="text-sm text-gray-600">
                  質問: {user.questions_count} | 回答: {user.answers_count}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-amber-600">
              <Trophy className="h-4 w-4" />
              <span className="font-bold">{user.helpful_votes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}