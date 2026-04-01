'use client'

export function BrainwaveAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`overflow-hidden ${className}`} aria-hidden="true">
      <div className="flex animate-brainwave" style={{ width: '200%' }}>
        <svg
          viewBox="0 0 1200 80"
          className="w-1/2 shrink-0"
          preserveAspectRatio="none"
          height="80"
        >
          <path
            d="M0,40 L30,40 L40,20 L50,60 L55,10 L60,70 L65,30 L75,50 L85,40
               L130,40 L140,25 L148,55 L153,15 L158,65 L163,35 L170,40
               L220,40 L230,22 L238,58 L243,12 L248,68 L253,32 L262,40
               L320,40 L328,28 L334,52 L340,18 L346,62 L352,36 L360,40
               L420,40 L432,15 L440,65 L447,8 L454,72 L460,28 L470,40
               L540,40 L550,24 L558,56 L564,14 L570,66 L576,34 L584,40
               L640,40 L650,20 L658,60 L663,10 L668,70 L673,30 L682,40
               L740,40 L750,26 L758,54 L763,16 L768,64 L774,36 L782,40
               L850,40 L860,18 L868,62 L874,8 L880,72 L886,30 L894,40
               L960,40 L970,22 L978,58 L984,12 L990,68 L996,32 L1004,40
               L1060,40 L1070,28 L1078,52 L1084,20 L1090,60 L1096,38 L1104,40
               L1160,40 L1170,24 L1178,56 L1184,15 L1190,65 L1196,35 L1200,40"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            className="text-primary/30"
          />
          <path
            d="M0,55 L60,55 L68,38 L74,58 L80,42 L86,52 L92,55
               L180,55 L188,40 L195,60 L201,44 L207,54 L213,55
               L320,55 L328,42 L334,62 L340,46 L346,56 L352,55
               L460,55 L468,38 L475,58 L481,44 L487,52 L493,55
               L600,55 L608,41 L614,61 L620,45 L626,55 L632,55
               L740,55 L748,40 L755,60 L761,44 L767,54 L773,55
               L880,55 L888,42 L895,62 L901,46 L907,56 L913,55
               L1020,55 L1028,38 L1035,58 L1041,42 L1047,52 L1053,55
               L1200,55"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            className="text-primary/20"
            strokeDasharray="4 2"
          />
        </svg>
        <svg
          viewBox="0 0 1200 80"
          className="w-1/2 shrink-0"
          preserveAspectRatio="none"
          height="80"
        >
          <path
            d="M0,40 L30,40 L40,20 L50,60 L55,10 L60,70 L65,30 L75,50 L85,40
               L130,40 L140,25 L148,55 L153,15 L158,65 L163,35 L170,40
               L220,40 L230,22 L238,58 L243,12 L248,68 L253,32 L262,40
               L320,40 L328,28 L334,52 L340,18 L346,62 L352,36 L360,40
               L420,40 L432,15 L440,65 L447,8 L454,72 L460,28 L470,40
               L540,40 L550,24 L558,56 L564,14 L570,66 L576,34 L584,40
               L640,40 L650,20 L658,60 L663,10 L668,70 L673,30 L682,40
               L740,40 L750,26 L758,54 L763,16 L768,64 L774,36 L782,40
               L850,40 L860,18 L868,62 L874,8 L880,72 L886,30 L894,40
               L960,40 L970,22 L978,58 L984,12 L990,68 L996,32 L1004,40
               L1060,40 L1070,28 L1078,52 L1084,20 L1090,60 L1096,38 L1104,40
               L1160,40 L1170,24 L1178,56 L1184,15 L1190,65 L1196,35 L1200,40"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            className="text-primary/30"
          />
          <path
            d="M0,55 L60,55 L68,38 L74,58 L80,42 L86,52 L92,55
               L180,55 L188,40 L195,60 L201,44 L207,54 L213,55
               L320,55 L328,42 L334,62 L340,46 L346,56 L352,55
               L460,55 L468,38 L475,58 L481,44 L487,52 L493,55
               L600,55 L608,41 L614,61 L620,45 L626,55 L632,55
               L740,55 L748,40 L755,60 L761,44 L767,54 L773,55
               L880,55 L888,42 L895,62 L901,46 L907,56 L913,55
               L1020,55 L1028,38 L1035,58 L1041,42 L1047,52 L1053,55
               L1200,55"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            className="text-primary/20"
            strokeDasharray="4 2"
          />
        </svg>
      </div>
    </div>
  )
}
