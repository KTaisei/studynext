# StudyNext

## 概要
このSNSは、ユーザーがわからない問題を投稿し、他のユーザーが回答できる勉強サポートプラットフォームです。Supabase を使用し、ログイン認証を必須としています。

## 使用技術
- **バックエンド:** Supabase (データベース・認証)
- **デザイン/UI:** tailwindcssを採用

## 主な機能
- **ユーザー登録 & ログイン**（Supabase Auth 使用）
- **問題の投稿**
- **回答の投稿**
- **投稿・回答の閲覧**
- **ユーザープロフィール管理**

## 環境構築
### 1. リポジトリのクローン
```sh
git clone https://github.com/ktaisei/studynext
cd studynext
```

### 2. 環境変数の設定
`.env.local` を作成し、以下の環境変数を設定してください。
```sh
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 依存関係のインストール
```sh
npm install
```

### 4. 開発サーバーの起動
```sh
npm run dev
```

## 今後の機能追加予定
- **いいね機能**
- **通知機能**
- **タグ検索**
- **ランキング機能**
