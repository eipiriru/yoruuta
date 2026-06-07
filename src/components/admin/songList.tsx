"use client"

import { useState, useEffect } from 'react';
import { type Song, getAllSongs, deleteSongs } from "../services/songServices";
import { useRouter, usePathname } from 'next/navigation';
import Input from '../form/input/InputField';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Image from "next/image";
import Badge from "../ui/badge/Badge";
import { TrashBinIcon, PencilIcon } from '@/icons';


export default function SongLists() {
  const router = useRouter();
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

  const handleEdit = async (s: Song) => {
    router.push(`/admin/songs/forms/${s.id}`);
  }

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Cari judul lagu atau musisi..."
        className="flex-1 rounded px-3 py-2 bg-slate-900 border border-slate-600 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors w-full md:w-1/3"
        defaultValue={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Judul
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Musisi
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Deskripsi
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Aksi
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {
                isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 italic">
                      Memuat
                    </TableCell>
                  </TableRow>
                ) :
                  (filteredSongs.length > 0 ? 
                    (
                      filteredSongs.map((s) => (
                        <TableRow key={s.id} className='hover:bg-slate-200 hover:text-dark-900'>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {s.title}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {s.artist}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {s.description}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 w-40">
                            <div className="grid grid-cols-2 gap-2 h-10.5">
                              <button 
                                className={`
                                  ${
                                    deletingId === s.id
                                      ? "bg-gray-400 cursor-not-allowed"
                                      : "bg-red-500 hover:bg-red-700 cursor-pointer"
                                  }
                                  active:border-b-0
                                  active:border-r-0  
                                  text-white flex justify-center items-center font-bold border-b-4 border-r-3 border-red-900 rounded-md transition-colors`
                                  } disabled={deletingId === s.id} onClick={() => handleDelete(s)} ><TrashBinIcon/></button>
                              <button 
                                className={`
                                  bg-yellow-500 hover:bg-yellow-700 cursor-pointer
                                  active:border-b-0
                                  active:border-r-0  
                                  text-white font-bold py-2 px-4 border-b-4 border-r-3 border-yellow-900 rounded-md transition-colors`
                                  } disabled={deletingId === s.id} onClick={() => handleEdit(s)}><PencilIcon/></button>
                            </div>
                          </TableCell>
                        </TableRow>
                        )
                      )
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 italic">
                          Lagu tidak ditemukan
                        </TableCell>
                      </TableRow>
                    )
                  )
              }
              </TableBody>
            </Table>
          </div>
        </div>
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