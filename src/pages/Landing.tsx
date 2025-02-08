import React, { useState } from 'react';
import { GraduationCap, Users, BookOpen, ArrowRight, Github, Menu, X  } from 'lucide-react';
import { Link } from 'react-router-dom';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Mathematical formulas to be displayed as decorative elements
  const mathFormulas = [
    'E = mc²',
    'F = ma',
    'a² + b² = c²',
    'y = mx + b',
    '∫(x²)dx',
    'eiπ + 1 = 0'
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa]" style={{
      backgroundImage: 'linear-gradient(#e3e8f0 1px, transparent 1px), linear-gradient(90deg, #e3e8f0 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      backgroundPosition: 'center center'
    }}>
      {/* Decorative Math Formulas */}
      {mathFormulas.map((formula, index) => (
        <div
          key={index}
          className="fixed text-blue-400/30 text-2xl font-serif select-none"
          style={{
            transform: `rotate(${Math.random() * 40 - 20}deg)`,
            top: `${Math.random() * 100}vh`,
            left: `${Math.random() * 100}vw`,
            zIndex: 1
          }}
        >
          {formula}
        </div>
      ))}

      {/* Main Content Container */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="px-4 md:px-6 py-4 border-b border-blue-100 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <span className="text-xl md:text-2xl font-bold text-blue-600" style={{ fontFamily: 'cursive' }}>
                  Study Next
                </span>
              </div>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 text-blue-600"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {/* Desktop navigation */}
              <div className="hidden md:flex space-x-4">
                <button className="px-6 py-2 text-blue-600 hover:text-blue-700 transition font-medium border-b-2 border-blue-600">
                  <Link to="/login">ログイン</Link>
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  <Link to="/register">新規登録</Link>
                </button>
              </div>
            </div>

            {/* Mobile navigation */}
            {isMenuOpen && (
              <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-blue-100 p-4 space-y-3">
                <button className="block w-full px-4 py-2 text-blue-600 hover:text-blue-700 transition font-medium text-left">
                  ログイン
                </button>
                <button className="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-left">
                  新規登録
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 pt-20 text-center sm:text-left">
            <div className="border-b-2 border-blue-200 pb-12">
                <h1 className="text-3xl sm:text-5xl mb-6 text-blue-600" style={{ fontFamily: 'cursive' }}>
                    今日の『なぜ？』が、
                <br  />
                    明日の力になる。
                </h1>
                <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-md sm:max-w-2xl mx-auto sm:mx-0" style={{ fontFamily: 'cursive' }}>
                    学びは、ひとつじゃない。つながることで広がっていく。
                    Study Nextは、お互いで高め合い、学び合うためのコミュニティです。
                </p>
                <button className="px-6 py-2 sm:px-8 sm:py-3 bg-blue-600 text-white rounded text-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center space-x-2 mx-auto sm:mx-0">
                    <Link to="/register">始めてみる</Link>
                    <ArrowRight className="h-5 w-5" />
                </button>
            </div>
        </div>

        {/* Features */}
        <div className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  icon: <Users className="h-8 w-8 text-blue-600" />,
                  title: "質問と回答",
                  description: "数学、物理、化学など、様々な教科の質問ができます。わかりやすい回答で、理解を深めましょう。"
                },
                {
                  icon: <BookOpen className="h-8 w-8 text-blue-600" />,
                  title: "数式エディタ",
                  description: "LaTeX形式の数式入力に対応。複雑な数式も美しく表示できます。"
                },
                {
                  icon: <GraduationCap className="h-8 w-8 text-blue-600" />,
                  title: "ポイントシステム",
                  description: "質の高い回答にはいいねが付きます。たくさんの人の学習をサポートしましょう。"
                }
              ].map((feature, index) => (
                <div key={index} className="border-l-2 border-blue-200 pl-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-blue-600" style={{ fontFamily: 'cursive' }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-600" style={{ fontFamily: 'cursive' }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Developer Section */}
        <div className="py-24 border-t-2 border-blue-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-16 text-blue-600" style={{ fontFamily: 'cursive' }}>
                開発者紹介
              </h2>
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-blue-200">
                  <img
                    src="https://ktaisei.github.io/stophone_tsx/profile.JPG"
                    alt="Developer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-blue-600" style={{ fontFamily: 'cursive' }}>
                  川上 泰正
                </h3>
                <p className="text-gray-600 mb-6" style={{ fontFamily: 'cursive' }}>
                    普段はフロントエンドエンジニアとして、ホームページやwebアプリの開発を行なっています。
                </p>
                <a
                  href="https://github.com/KTaisei"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <Github className="h-5 w-5" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t-2 border-blue-200 py-12">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-blue-600" style={{ fontFamily: 'cursive' }}>
                StudyNext
              </span>
            </div>
            <p className="text-gray-600">
              © 2025 Kawakami Taisei. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;