"use client"

import { useState, useEffect } from 'react';
import { type Song, getAllSongs, deleteSongs } from "../services/songServices";

export default function SongLists() {
  const [songs, setSongs] = useState<Song[]>([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const { data } = await getAllSongs();
        setSongs(data ?? []); 
      } catch (error) {
        console.error("Gagal mengambil data lagu:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchSongs();
  }, []);

  const filteredSongs = songs.filter((song) => {
    const matchTitle = song.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchArtist = song.artist.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTitle || matchArtist;
  });

  const handleDelete = async (song: Song) => {
    if (!window.confirm(`Yakin ingin menghapus lagu "${song.title}"?`)) return;
    setDeletingId(song.id);
    try {
      await deleteSongs(song.id);
      
      setSongs((prevSongs) => prevSongs.filter((s) => s.id !== song.id));
    } catch (error) {
      console.error("Gagal menghapus lagu:", error);
      alert("Terjadi kesalahan saat menghapus lagu.");
    } finally {
      setDeletingId(null); 
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Cari judul lagu atau musisi..."
        className="flex-1 rounded px-3 py-2 bg-slate-900 border border-slate-600 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors w-full md:w-1/3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="overflow-x-auto border border-slate-500 rounded-lg">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-900 uppercase text-xs font-semibold">
            <tr>
              <th className="p-4">Judul</th>
              <th className="p-4">Musisi</th>
              <th className="p-4">Deskripsi</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {
              isLoading ? (
                 <tr>
                  <td colSpan={4} className="p-4 text-center text-zinc-500 italic">
                    Memuat
                  </td>
                </tr>
              ) :
                (filteredSongs.length > 0 ? 
                  (
                    filteredSongs.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-400">
                        <td className="p-4 font-medium">{s.title}</td>
                        <td className="p-4 text-zinc-600 dark:text-zinc-400">{s.artist}</td>
                        <td className="p-4 text-zinc-500">{s.description}</td>
                        <td className="p-4 text-zinc-500">
                          <button 
                            className={`
                              ${
                                deletingId === s.id
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-red-500 hover:bg-red-700 cursor-pointer"
                              }
                             text-white font-bold py-2 px-4 rounded-full transition-colors`
                              } disabled={deletingId === s.id} onClick={() => handleDelete(s)}>Delete</button>
                        </td>
                      </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-zinc-500">
                        Lagu tidak ditemukan.
                      </td>
                    </tr>
                  )
                )
            }
          </tbody>
        </table>
      </div>
      
      <p className="text-xs text-zinc-500">
        Menampilkan {filteredSongs.length} dari {songs.length} lagu.
      </p>
      {deletingId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
          <div className="bg-white dark:bg-zinc-900 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 text-black dark:text-white">
            <div className="w-5 h-5 border-2 border-zinc-300 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="font-medium">Menghapus lagu...</span>
          </div>
        </div>
      )}
    </div>
  );
}