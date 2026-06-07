
export default function RealisticMoon () {
    return (
        <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-xl"
        >
            <defs>
            {/* 1. Masking untuk membuat bentuk sabit */}
            <mask id="moon-mask">
                <rect width="200" height="200" fill="white" />
                {/* Lingkaran hitam ini memotong dasar putih untuk menciptakan bentuk sabit */}
                <circle cx="150" cy="80" r="100" fill="black" />
            </mask>

            {/* 2. Gradien warna bulan (lebih terang di luar, agak gelap ke dalam) */}
            <radialGradient id="moon-gradient" cx="30%" cy="70%" r="70%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="45%" stopColor="#F3E5DF" />
                <stop offset="85%" stopColor="#D6C2BC" />
                <stop offset="100%" stopColor="#A8948E" />
            </radialGradient>

            {/* 3. Filter blur untuk kawah agar terlihat menyatu (soft) */}
            <filter id="crater-blur">
                <feGaussianBlur stdDeviation="2" />
            </filter>
            </defs>

            {/* Grup utama bulan yang dikenakan mask */}
            <g mask="url(#moon-mask)">
            {/* Dasar bulan */}
            <circle cx="100" cy="100" r="90" fill="url(#moon-gradient)" />
            
            {/* Tekstur kawah bulan buatan */}
            <g filter="url(#crater-blur)" fill="#A8948E" opacity="0.3">
                <circle cx="50" cy="130" r="14" />
                <circle cx="35" cy="100" r="8" opacity="0.5" />
                <circle cx="85" cy="165" r="22" opacity="0.4" />
                <circle cx="75" cy="120" r="10" />
                <circle cx="95" cy="140" r="6" />
            </g>
            </g>
        </svg>
    )
};