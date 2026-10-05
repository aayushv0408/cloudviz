# ☁️ CloudStore - Personal Cloud Media Storage & Sharing Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![AWS S3 / R2](https://img.shields.io/badge/Object_Storage-AWS_S3_%7C_Cloudflare_R2-FF9900?logo=amazons3)](https://aws.amazon.com/s3/)
[![Security](https://img.shields.io/badge/Auth-Bcrypt_%2B_JWT_HttpOnly-success)](#-multi-user-authentication--security)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern, cloud-native media storage and streaming platform designed for individual and multi-user use. CloudStore provides **strict personal vault isolation**, direct **AWS S3 / Cloudflare R2 / Supabase Object Storage** integration via presigned URLs, rich media players (for images, 4K videos, audio waveforms, and documents), and secure link sharing with passwords, expiration, and mobile QR codes.

---

## 📑 Table of Contents

- [🌟 Key Highlights](#-key-highlights)
- [🛠️ Complete Tech Stack](#️-complete-tech-stack)
- [🏗️ System Architecture](#️-system-architecture)
- [🔐 Multi-User Authentication & Security](#-multi-user-authentication--security)
- [⚡ Quick Start & Installation](#-quick-start--installation)
- [👤 Demo Accounts & Testing Isolation](#-demo-accounts--testing-isolation)
- [🌐 Cloud Storage Configuration (AWS S3 & Cloudflare R2)](#-cloud-storage-configuration-aws-s3--cloudflare-r2)
- [🎬 Rich Media Preview Players](#-rich-media-preview-players)
- [📡 Full API Reference](#-full-api-reference)
- [📁 Project Directory Structure](#-project-directory-structure)
- [⌨️ Keyboard Shortcuts](#️-keyboard-shortcuts)
- [📜 License](#-license)

---

## 🌟 Key Highlights

- 🔐 **Multi-User Authentication & Private Vaults**
  - Instant user registration (`/signup`) & login (`/login`) with session management via HTTP-only JWT cookies.
  - **Complete Data Isolation**: Each user gets their own private vault. Media files, folders, favorites, and trash are strictly isolated per account.
  - **Personal Storage Quotas**: Dynamic personal quota tracking (e.g. 50 GB free tier for new accounts, 100 GB demo tier).
  - Passwords securely hashed with **Bcrypt**.

- ⚡ **Direct Cloud Object Storage (S3 & R2 Presigned Uploads)**
  - Compatible with **AWS S3**, **Cloudflare R2** (zero egress fees), **Supabase Storage**, or **MinIO**.
  - **Direct-to-Cloud Uploads**: Uploads are performed directly from the browser to your cloud bucket via presigned URLs, eliminating server bandwidth bottlenecks.
  - **Zero-Config Local Sandbox**: Out-of-the-box fallback to local disk storage if cloud credentials are not yet configured.
  - **In-App Cloud Settings**: Configure, test, and switch storage buckets live directly from the dashboard.

- 🎬 **Rich Media Preview Players & Lightbox**
  - **Photos & Images**: Smooth fullscreen lightbox with zoom (50% to 300%), 90° rotation, and metadata inspector.
  - **Videos**: Custom video player with scrubbing, duration formatting, volume slider, playback speeds (0.5x - 2x), and PiP (Picture-in-Picture).
  - **Audio & Music**: Lo-Fi/audio player with animated frequency visualizer waveforms, playback scrubbing, and speed toggle.
  - **Documents**: PDF embedded reader, code viewer, and direct file download.

- 📁 **File Organization & Batch Management**
  - Color-accented multi-level folders.
  - Media category filters: Photos, Videos, Audio, Documents, Starred/Favorites, and Trash.
  - Drag-and-drop batch upload dropzone with real-time per-file progress bars.
  - Multi-select actions: batch delete and batch move to folders.
  - Real-time search across filenames, extensions, and metadata tags.
  - Grid View & List Table View with sorting (Date, Name, File Size).

- 🔗 **Secure Sharing & Access Control**
  - Generate shareable links for any photo, video, song, or document.
  - Expiration dates (1 hour, 24 hours, 7 days, 30 days, or permanent).
  - View-only vs. allow original download permission toggle.
  - Optional password protection for shared links.
  - Mobile QR code generator for instant phone scanning.
  - Dedicated public streaming page (`/share/[token]`).

---

## 🛠️ Complete Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | [Next.js 15 (App Router)](https://nextjs.org/) | Server Components, Route Handlers, SSR & Static Optimization |
| **UI Library** | [React 19](https://react.dev/) | Modern state management, Concurrent rendering, Hooks |
| **Language** | [TypeScript 5.8](https://www.typescriptlang.org/) | Strict type checking and shared interfaces |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) | Dark-mode first UI, Glassmorphism gradients & blur filters |
| **Icons** | [Lucide React](https://lucide.dev/) | Modern lightweight SVG icon system |
| **Security & Hashing** | [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js) | Salted password hashing (10 rounds) |
| **JWT & Sessions** | [JOSE](https://github.com/panva/jose) | Universal Web-Crypto JSON Web Token signing & verification |
| **Cloud Storage** | [@aws-sdk/client-s3](https://github.com/aws/aws-sdk-js-v3) | S3 Object client & Request Presigner |
| **Streaming** | Native Web ReadableStream | Partial Content (`HTTP 206`) Range seekable media streaming |
| **Database** | Persistent JSON Store | Local schema with ACID-like atomic writes & user isolation |

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Browser Client                       │
│    (React 19 / Tailwind / HTML5 Players / Lightbox)    │
└───────────┬────────────────────────────────┬───────────┘
            │                                │
     Direct S3 Upload                API / Auth Requests
  (Presigned PUT URL)                 (HTTP-only Cookies)
            │                                │
            ▼                                ▼
┌───────────────────────┐        ┌───────────────────────┐
│  Cloud Object Store   │        │     Next.js 15        │
│ (AWS S3 / R2 / MinIO) │        │ (App Router & Route   │
│                       │        │      Handlers)        │
└───────────────────────┘        └───────────┬───────────┘
                                             │
                                    User & Vault Data
                                             │
                                             ▼
                                 ┌───────────────────────┐
                                 │     Metadata DB       │
                                 │ (Per-User Isolation)  │
                                 └───────────────────────┘
```

---

## 🔐 Multi-User Authentication & Security

- **Tamper-Proof Sessions**: Authentication uses **HTTP-Only Cookies** signed with `jose` Web-Crypto JWT tokens, preventing Client-Side XSS token theft.
- **Salted Password Hashing**: Passwords are never stored in plain text; they are hashed with `bcryptjs` using 10 salt rounds.
- **Strict User Scoping**:
  - `getFiles(userId, ...)` strictly checks that the requesting `userId` owns the files.
  - `getFolders(userId, ...)` isolates custom folders per user.
  - `getStorageStats(userId)` calculates personal storage consumption against the user's specific quota.
- **Global Auth Guard**: The root dashboard verifies user identity on the client and server. If unauthenticated, requests redirect smoothly to `/login`.

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js** v18 or later (recommended: Node v22)
- **npm**, **pnpm**, or **yarn**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/cloud-store.git
cd "cloud-store"

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 👤 Demo Accounts & Testing Isolation

To experience the platform immediately without registration:

| Role | Email | Password | Initial Quota |
| :--- | :--- | :--- | :--- |
| **Demo User** | `demo@cloudstore.io` | `password123` | **100 GB** |

> **Testing Multi-User Isolation**:
> 1. Log in with the pre-seeded account `demo@cloudstore.io` — you will see sample nature photos, 4K video clips, lo-fi audio, and whitepapers.
> 2. Open an incognito tab or sign out, then visit [`/signup`](http://localhost:3000/signup) to create your own personal account.
> 3. Notice that your new vault starts completely fresh and empty with **0 files** and your personal **50 GB** quota. Any files you upload are strictly private to you.

---

## 🌐 Cloud Storage Configuration (AWS S3 & Cloudflare R2)

CloudStore runs in **Local Sandbox Mode** by default. To connect production cloud buckets:

### Option 1: Live In-App Configuration (Recommended)
1. In the top navbar, click on the **Storage / Settings** pill.
2. Select your provider (**AWS S3**, **Cloudflare R2**, or **Supabase / MinIO**).
3. Enter your Bucket name, Region, and Access Keys.
4. Click **Test Connection** — the server performs an instant test handshake against your bucket.
5. Click **Save Configuration**.

### Option 2: Environment Variables (`.env.local`)
Create a `.env.local` file in your project root:

```env
# JWT Session Secret
JWT_SECRET=your-random-jwt-secret-key-32-chars

# --- OPTION A: AWS S3 ---
AWS_S3_BUCKET=my-cloudstore-bucket
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_PUBLIC_URL_PREFIX=https://my-cloudstore-bucket.s3.us-east-1.amazonaws.com

# --- OPTION B: Cloudflare R2 (Zero Egress Fees) ---
R2_BUCKET=my-r2-media-bucket
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_PUBLIC_URL_PREFIX=https://pub-yourdomain.r2.dev
```

### Bucket CORS Policy
For direct browser uploads via presigned URLs, enable CORS in your bucket settings:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

## 🎬 Rich Media Preview Players

CloudStore features dedicated, custom-engineered media players:

- 🖼️ **Image Lightbox**:
  - Fullscreen modal with responsive scaling
  - Zoom In / Zoom Out controls (50% to 300%)
  - 90° Clockwise Rotation
  - High-res EXIF and resolution metadata pill
- 📹 **Video Streaming Player**:
  - HTML5 video playback with Range headers support for instant seeking
  - Custom progress scrubber with current & total duration
  - Volume slider and one-click mute/unmute
  - Playback speed selectors (`0.5x`, `1x`, `1.5x`, `2x`)
  - Fullscreen and Picture-in-Picture (PiP) support
- 🎵 **Audio & Music Player**:
  - Real-time animated audio frequency waveforms
  - Lo-Fi player card with track artist and duration
  - Playback speed selector and time scrubber
- 📄 **Document Reader**:
  - Embedded PDF preview iframe
  - Direct download options for binary and office documents

---

## 📡 Full API Reference

### Authentication Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user account & set session cookie |
| `POST` | `/api/auth/login` | Authenticate user & issue session cookie |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & quota |

### Media & Files
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/files` | Get user's media files (supports `folderId`, `type`, `favorite`, `trash`, `search`) |
| `POST` | `/api/files` | Upload media or register direct S3 upload metadata |
| `GET` | `/api/files/[id]` | Get single file details |
| `PATCH` | `/api/files/[id]` | Update file (rename, favorite, move to folder, trash) |
| `DELETE` | `/api/files/[id]` | Soft delete (trash) or hard delete from storage |

### Folders
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/folders` | List all user folders |
| `POST` | `/api/folders` | Create a new colored folder |
| `DELETE` | `/api/folders?id={id}` | Delete folder (contents moved to root) |

### Sharing
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/share` | Generate secure share link with expiration and password |
| `GET` | `/api/share/[token]` | Fetch shared file details for public preview / download |

### Storage Engine
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/storage/presign` | Request presigned S3/R2 direct upload URL |
| `GET` | `/api/storage/settings` | Get current storage configuration |
| `POST` | `/api/storage/settings` | Test & save cloud bucket credentials |
| `GET` | `/api/storage/stream/[filename]` | Stream media files with HTTP Range seek support |

---

## 📁 Project Directory Structure

```
cloud-store/
├── data/                         # Persistent JSON DB & storage configuration
├── public/
│   └── uploads/                  # Local filesystem sandbox media storage
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/             # Login, Signup, Logout, Me
│   │   │   ├── files/            # Media list, upload, details, deletion
│   │   │   ├── folders/          # Folder creation, listing, deletion
│   │   │   ├── share/            # Link generation & token resolution
│   │   │   └── storage/          # Presigned URLs, settings, and streaming
│   │   ├── login/                # User login page
│   │   ├── signup/               # User registration page
│   │   ├── share/[token]/        # Public streaming & viewer page
│   │   ├── layout.tsx            # Global layout with AuthProvider
│   │   ├── page.tsx              # Main dashboard
│   │   └── globals.css           # Tailwind & dark theme styling
│   ├── components/
│   │   ├── Navbar.tsx            # Top bar with search, user avatar & upload
│   │   ├── Sidebar.tsx           # Category navigation & storage meter
│   │   ├── FileGrid.tsx          # Responsive media grid
│   │   ├── FileCard.tsx          # Card with thumbnail, favorite & menu
│   │   ├── FileList.tsx          # Detailed table list view
│   │   ├── MediaViewerModal.tsx  # Lightbox, Video player, Audio waveform
│   │   ├── UploadModal.tsx       # Drag-and-drop batch upload
│   │   ├── ShareModal.tsx        # Share link generator with QR code
│   │   ├── NewFolderModal.tsx    # Custom folder creator
│   │   ├── MoveModal.tsx         # Move files between folders
│   │   ├── RenameModal.tsx       # Rename files
│   │   ├── StorageMeter.tsx      # Quota usage bar & category breakdown
│   │   └── StorageSettingsModal.tsx # AWS S3 / R2 connection manager
│   ├── context/
│   │   └── AuthContext.tsx       # Authentication state & hook
│   └── lib/
│       ├── auth.ts               # Bcrypt password hashing & JWT handling
│       ├── db.ts                 # Database persistence & user isolation
│       ├── storage.ts            # AWS S3 client & presigner adapter
│       ├── types.ts              # TypeScript interfaces
│       └── utils.ts              # File formatting & media type detectors
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Context | Action |
| :--- | :--- | :--- |
| `Esc` | Any Modal / Lightbox | Close modal or preview |
| `Space` | Video / Audio Player | Play / Pause media |
| `→` (Right Arrow) | Lightbox Viewer | Next media file |
| `←` (Left Arrow) | Lightbox Viewer | Previous media file |

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
