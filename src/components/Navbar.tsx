import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, LogIn, LogOut, PlusCircle, User } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800">Study Next</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/ask"
                  className="flex items-center space-x-1 text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span className="hidden sm:inline">質問する</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">マイページ</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">ログアウト</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
              >
                <LogIn className="h-5 w-5" />
                <span className="hidden sm:inline">ログイン</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}