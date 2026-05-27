<div align="center">
  <img src="https://placehold.co/600x400/1F3552/FFF?text=Yoruuta" alt="Yoruuta" width="120" />
  
  # Yoruuta
  
  *Like a wildflower swaying in the night breeze. A quiet place to sing in solitude.*

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
</div>

<br />

## 📖 About The Project

**Yoruuta** is a modern, web-based song lyrics and karaoke platform. The name originates from the Japanese words *Yoru* (night) and *Uta* (singing). It is inspired by the quiet comfort of singing alone in the night and the deep emotional connection we share with music.

Furthermore, both the project's name and its visual identity—a lone flower swaying in the night breeze—draw deep inspiration from the Japanese band **Yorushika**. Known for beautifully weaving profound nature metaphors (like summer grass, spring winds, and fireworks) into their music, Yorushika's melancholic yet comforting artistry perfectly encapsulates the soul of this project.

> *"When you are happy, you enjoy the melody. When you are sad, you understand the lyrics."*

Built with modern web technologies, yoruuta goes beyond static lyrics by providing a synchronized karaoke experience directly in the browser, coupled with a robust Admin CMS for seamless content management.

### ✨ Key Features

**Public Interface:**
- 🎵 **Song Library:** Browse and search for songs easily.
- 📖 **Deep Dive Details:** Read trivia, meanings, and stories behind every song.
- 🎤 **Karaoke Player:** An HTML5 audio player synchronized with `.lrc` / `.ass` files to highlight lyrics in real-time, just like a real karaoke machine.

**Admin Dashboard (CMS):**
- 🔒 **Secure Access:** Protected routes requiring authentication.
- 📝 **Manage Content:** Full CRUD (Create, Read, Update, Delete) capabilities for the song database.
- ☁️ **Direct Uploads:** Upload album arts, `.mp3` audio, and `.lrc` / `.ass` subtitle files directly to cloud storage.
- 🗑️ **Smart Deletion:** Automatically cleans up "orphan files" in storage when a song is deleted from the database.

---

## 🛠️ Tech Stack

This project is built using a modern, 100% JavaScript/TypeScript stack, optimized for performance and ease of deployment.

- **Framework:** [Next.js (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Built on Radix UI for accessibility)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL)
- **File Storage:** Supabase Storage (for `.mp3`, images, and lyrics files)
- **Deployment:** Vercel / Netlify

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
Make sure you have Node.js installed on your machine.
* npm
  ```sh
  npm install npm@latest -g

- Installation & Setup
- Clone the repository
- Install NPM packages
- Create a .env.local file in the root directory and add your Supabase credentials:
  ```sh
  NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
- npm run dev
- Open http://localhost:3000 in your browser to see the app.

🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

📄 License
Distributed under the MIT License. See LICENSE for more information.