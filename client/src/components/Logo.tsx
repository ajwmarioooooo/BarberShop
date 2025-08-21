import logoImagePath from "@assets/BlackSeaBarber_black_transparent_1753298127547.png";

interface LogoProps {
  className?: string;
  color?: string;
  variant?: "image" | "svg" | "transparent";
}

export default function Logo({ className = "w-12 h-12", color = "#111111", variant = "transparent" }: LogoProps) {
  if (variant === "image") {
    return (
      <div className={className}>
        <img 
          src={logoImagePath} 
          alt="Blacksea Barber Logo" 
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  if (variant === "transparent") {
    return (
      <div className={className}>
        <svg viewBox="0 0 200 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Hair flowing lines inspired by the original logo */}
          <path 
            d="M30 35 Q 50 25, 80 30 Q 110 35, 140 25" 
            stroke={color} 
            strokeWidth="1.5" 
            fill="none" 
            opacity="0.6"
          />
          <path 
            d="M35 40 Q 55 30, 85 35 Q 115 40, 145 30" 
            stroke={color} 
            strokeWidth="1.5" 
            fill="none" 
            opacity="0.4"
          />
          <path 
            d="M40 45 Q 60 35, 90 40 Q 120 45, 150 35" 
            stroke={color} 
            strokeWidth="1.5" 
            fill="none" 
            opacity="0.3"
          />
          
          {/* Razor/scissors element */}
          <line x1="80" y1="50" x2="120" y2="40" stroke={color} strokeWidth="2" opacity="0.8"/>
          <circle cx="77" cy="52" r="2" fill={color} opacity="0.8"/>
          <circle cx="123" cy="38" r="2" fill={color} opacity="0.8"/>
          
          {/* BLACKSEA text */}
          <text x="100" y="70" 
                fontFamily="serif" 
                fontSize="16" 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={color}
                letterSpacing="2px">
            BLACKSEA
          </text>
          
          {/* BARBER text */}
          <text x="100" y="85" 
                fontFamily="serif" 
                fontSize="8" 
                fontWeight="600" 
                textAnchor="middle" 
                fill={color}
                letterSpacing="4px">
            BARBER
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className={className}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Hair flowing lines */}
        <path 
          d="M20 40 Q 30 30, 45 35 Q 60 40, 75 30" 
          stroke={color} 
          strokeWidth="2" 
          fill="none" 
          opacity="0.8"
        />
        <path 
          d="M25 45 Q 35 35, 50 40 Q 65 45, 80 35" 
          stroke={color} 
          strokeWidth="2" 
          fill="none" 
          opacity="0.6"
        />
        <path 
          d="M30 50 Q 40 40, 55 45 Q 70 50, 85 40" 
          stroke={color} 
          strokeWidth="2" 
          fill="none" 
          opacity="0.4"
        />
        {/* Scissors */}
        <line x1="45" y1="55" x2="65" y2="45" stroke={color} strokeWidth="3"/>
        <circle cx="42" cy="57" r="3" fill={color}/>
        <circle cx="68" cy="43" r="3" fill={color}/>
      </svg>
    </div>
  );
}
