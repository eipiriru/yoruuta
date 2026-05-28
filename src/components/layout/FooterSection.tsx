'use client'

import Image from 'next/image';
import '@vscode/codicons/dist/codicon.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-600 text-slate-100 mt-auto bottom-0">
      <div className="mx-auto px-4 py-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8">
          <div className="flex flex-col ms-12 gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo/icon.png"
                alt="Yoruuta Logo"
                width={40}
                height={40}
                className="w-10 h-10 opacity-90"
              />
              <h2 className="text-xl font-serif font-semibold tracking-wide">
                Yoruuta
              </h2>
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed">
              Seperti bunga liar yang berdesir dihembus angin malam. <br></br>Sebuah tempat yang tenang untuk menyanyi dan memaknai lagu dalam kesendirian.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-100 tracking-wider">
              Find us
            </h3>
            <div className="flex items-center gap-4 text-slate-400">
              <a href="https://github.com/eipiriru" className="hover:text-slate-200 transition-colors" aria-label="Github">
                <i className="codicon codicon-github"/>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-2 border-t border-slate-800 flex justify-center items-center flex-wrap gap-4 text-xs text-slate-500">
            <p>
                Yoruuta - eipiriru © {currentYear}
            </p>
            <p className="flex items-center font-mono">
                Built with
                <span className="text-slate-300 px-1">
                    &nbsp;<i className="codicon codicon-vm"/>&nbsp;
                </span> 
                on the lonely nights.
            </p>
            </div>
        
      </div>
    </footer>
  );
}