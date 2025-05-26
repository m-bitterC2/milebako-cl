## Milebako - Frontend

**Milebako**は、シンプルなタスク管理アプリです。

このリポジトリでは、フロントエンドのソースコードを管理します。

---

#### 技術スタック

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** - UI コンポーネント
- **@dnd-kit** - ドラッグ&ドロップ機能
- **next-themes** - ダークモード対応
- **Lucide React** - アイコンライブラリ

---

#### セットアップ手順

###### 1. リポジトリをクローン

```bash
git clone https://github.com/m-bitterC2/milebako-cl.git
cd milebako-cl
```

###### 2. 依存パッケージをインストール

```bash
# UI関連
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-slot
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# ドラッグ&ドロップ
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# テーマ管理
npm install next-themes
```

###### 3. サーバー起動

```bash
npm run dev
```

---

#### 開発のポイント

###### コンポーネント設計

- UI・ロジック・状態管理の明確な分離

###### UX/UI

- **レスポンシブデザイン**: モバイル・デスクトップ対応
- **ダークモード**: システム設定に応じた自動切り替え
- **ドラッグ&ドロップ**: PC（マウス）・モバイル（タッチ）両対応
- **モバイル配慮**: カラム移動のためのセレクトボックス

###### パフォーマンス

- **楽観的更新**: UI 即座更新 → API 呼び出し → エラー時ロールバック
- **コード分割**: コンポーネント単位でのファイル分割

#### 今後の予定（ToDo）

- ユーザー認証機能
