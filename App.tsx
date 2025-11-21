
import React, { useState, useEffect, useRef } from 'react';
import { BRAZILIAN_TEAMS, Team, Player, ViewState, MatchResult, Position, TeamStats, Trophy as TrophyType, SocialPost, CareerData } from './types';
import { generateSquadForTeam, generateTransferMarket, simulateMatchWithGemini, generateFictionalTeamName, getFictionalLeagueNames, generateSocialFeed } from './services/geminiService';
import { Card } from './components/Card';
import { PlayerRow } from './components/PlayerRow';
import { 
    LayoutDashboard, 
    Users, 
    ArrowLeftRight, 
    PlayCircle, 
    DollarSign,
    Activity,
    Trophy,
    Star,
    ListOrdered,
    Settings,
    Award,
    Briefcase,
    MonitorPlay,
    Zap,
    Volume2,
    VolumeX,
    Handshake,
    CheckCircle,
    Calendar,
    Shield,
    Sword,
    MoveRight,
    Timer,
    Smartphone,
    Heart,
    MessageCircle,
    Camera,
    Dumbbell,
    Coffee,
    Eye,
    EyeOff,
    ArrowLeft,
    Medal,
    TrendingUp,
    ShoppingBag,
    Wallet,
    Shirt,
    Crown,
    Filter,
    X
} from 'lucide-react';

// --- Sub-Components ---

const TeamSelection = ({ onSelect }: { onSelect: (team: Team) => void }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = (team: Team) => {
    setLoading(team.id);
    onSelect(team);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 md:p-6">
      <div className="text-center mb-8 md:mb-10 mt-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">FUTEBOL <span className="text-emerald-400">BRASIL</span></h1>
        <p className="text-slate-400 text-sm md:text-base">Escolha seu clube para começar a temporada</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 w-full max-w-5xl pb-8">
        {BRAZILIAN_TEAMS.map((team) => (
          <button
            key={team.id}
            onClick={() => handleSelect(team)}
            disabled={!!loading}
            className={`
                relative group overflow-hidden rounded-xl p-4 md:p-6 transition-all duration-300
                bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500
                flex flex-col items-center gap-3 md:gap-4
                ${loading === team.id ? 'ring-2 ring-emerald-500' : ''}
            `}
          >
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-lg md:text-xl font-bold shadow-lg ${team.primaryColor} ${team.secondaryColor}`}>
               {team.name.substring(0, 3).toUpperCase()}
            </div>
            <span className="font-semibold text-white text-sm md:text-base group-hover:text-emerald-400 transition-colors truncate w-full text-center">{team.name}</span>
            
            {loading === team.id && (
                <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const Sidebar = ({ 
    currentView, 
    onChangeView, 
    team
}: { 
    currentView: ViewState, 
    onChangeView: (v: ViewState) => void, 
    team: Team | null
}) => {
    const menuItems = [
        { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
        { id: 'match', label: 'Jogar', icon: PlayCircle },
        { id: 'standings', label: 'Tabela', icon: ListOrdered },
        { id: 'squad', label: 'Elenco', icon: Users },
        { id: 'market', label: 'Transferências', icon: ArrowLeftRight },
        { id: 'trophies', label: 'Sala de Troféus', icon: Award },
        { id: 'settings', label: 'Configurações', icon: Settings },
    ];

    if (!team) return null;

    return (
        <div className="hidden lg:flex w-64 bg-slate-900 text-white flex-col h-screen sticky top-0 shrink-0">
            <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold ${team.primaryColor} ${team.secondaryColor}`}>
                    {team.name.substring(0, 2)}
                </div>
                <span className="font-bold truncate">{team.name}</span>
            </div>
            
            <nav className="flex-1 py-6 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onChangeView(item.id as ViewState)}
                            className={`w-full flex items-center gap-4 px-6 py-3 transition-colors ${active ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    )
                })}
            </nav>
        </div>
    );
};

const MobileNav = ({ 
    currentView, 
    onChangeView
}: { 
    currentView: ViewState, 
    onChangeView: (v: ViewState) => void, 
    team: Team | null
}) => {
    const menuItems = [
        { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
        { id: 'match', label: 'Jogar', icon: PlayCircle },
        { id: 'standings', label: 'Tabela', icon: ListOrdered },
        { id: 'squad', label: 'Elenco', icon: Users },
        { id: 'market', label: 'Mercado', icon: ArrowLeftRight },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-2 pt-2 px-4 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] safe-area-bottom">
            <div className="flex justify-around items-center h-14">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onChangeView(item.id as ViewState)}
                            className={`flex flex-col items-center justify-center w-16 gap-0.5 transition-colors ${active ? 'text-emerald-600' : 'text-slate-400'}`}
                        >
                            <div className={`p-1 rounded-full ${active ? 'bg-emerald-100' : 'bg-transparent'}`}>
                                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                            </div>
                            <span className="text-[10px] font-medium leading-none">{item.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

const StatsCard = ({ title, value, icon, colorClass, bgClass }: any) => (
    <div className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${colorClass} min-w-[160px] md:min-w-0 flex-1 flex items-center justify-between md:block snap-start flex-shrink-0`}>
        <div>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-wide">{title}</p>
            <p className="text-lg md:text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`${bgClass} p-2 rounded-full md:float-right md:-mt-8`}>
            {icon}
        </div>
    </div>
);

// --- 2D Field Component ---
const SoccerField = ({ 
    homeTeam, 
    awayTeam, 
    gameTime, 
    ballPos, 
    homePositions, 
    awayPositions 
}: { 
    homeTeam: Team, 
    awayTeam: Team, 
    gameTime: number, 
    ballPos: {x: number, y: number},
    homePositions: {x: number, y: number}[],
    awayPositions: {x: number, y: number}[]
}) => {
    return (
        <div className="w-full aspect-[16/9] bg-green-600 rounded-lg relative overflow-hidden border-4 border-slate-800 shadow-inner select-none">
            {/* Field Lines */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/50 transform -translate-x-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-20 h-20 md:w-32 md:h-32 border-2 border-white/50 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 left-0 w-full h-full border-2 border-white/50 m-2 md:m-4 box-border pointer-events-none"></div>
            
            {/* Penalty Areas */}
            <div className="absolute top-1/2 left-0 w-[15%] h-[40%] border-2 border-white/50 bg-transparent transform -translate-y-1/2 ml-2 md:ml-4"></div>
            <div className="absolute top-1/2 right-0 w-[15%] h-[40%] border-2 border-white/50 bg-transparent transform -translate-y-1/2 mr-2 md:mr-4"></div>

            {/* Goals */}
            <div className="absolute top-1/2 left-0 w-1 h-12 bg-white transform -translate-y-1/2 -translate-x-full"></div>
            <div className="absolute top-1/2 right-0 w-1 h-12 bg-white transform -translate-y-1/2 translate-x-full"></div>

            {/* Players - Home */}
            {homePositions.map((pos, i) => (
                <div 
                    key={`home-${i}`}
                    className={`absolute w-3 h-3 md:w-4 md:h-4 rounded-full shadow-sm border border-white transition-all duration-500 ease-linear z-10 flex items-center justify-center text-[6px] text-white font-bold ${homeTeam.primaryColor}`}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                    {/* Optional: Number */}
                </div>
            ))}

            {/* Players - Away */}
            {awayPositions.map((pos, i) => (
                <div 
                    key={`away-${i}`}
                    className={`absolute w-3 h-3 md:w-4 md:h-4 rounded-full shadow-sm border border-white transition-all duration-500 ease-linear z-10 flex items-center justify-center text-[6px] ${awayTeam.primaryColor} ${awayTeam.secondaryColor === 'text-white' ? 'text-white' : 'text-black'}`}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                </div>
            ))}

            {/* Ball */}
            <div 
                className="absolute w-2 h-2 md:w-2.5 md:h-2.5 bg-white rounded-full shadow-lg z-20 transition-all duration-500 ease-linear border border-slate-400"
                style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%`, transform: 'translate(-50%, -50%)' }}
            ></div>
            
            {/* Game Time Overlay */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full font-mono font-bold text-sm backdrop-blur-sm flex items-center gap-2">
                <Timer size={14} />
                {gameTime}'
            </div>
        </div>
    );
};


// Main App Component
export default function App() {
  const [view, setView] = useState<ViewState>('select-team');
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [squad, setSquad] = useState<Player[]>([]);
  const [market, setMarket] = useState<Player[]>([]);
  const [budget, setBudget] = useState<number>(50); // Millions
  const [week, setWeek] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [trophies, setTrophies] = useState<TrophyType[]>([]);
  
  // Buying / Negotiating State
  const [negotiationPlayer, setNegotiationPlayer] = useState<Player | null>(null);
  const [negotiationOffer, setNegotiationOffer] = useState<{salary: number, weeks: number}>({ salary: 50, weeks: 52 });
  
  // Selling State
  const [sellingPlayer, setSellingPlayer] = useState<Player | null>(null);
  const [offers, setOffers] = useState<{team: string, value: number}[]>([]);

  // Loan OUT State
  const [loaningPlayer, setLoaningPlayer] = useState<Player | null>(null);
  const [loanOffers, setLoanOffers] = useState<{team: string, value: number}[]>([]);

  // Match State
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [leagueTable, setLeagueTable] = useState<TeamStats[]>([]);
  
  // 2D Match Simulation State
  const [isVisualMatch, setIsVisualMatch] = useState(false);
  const [preparingVisualMatch, setPreparingVisualMatch] = useState(false); // To handle loading state audio
  const [simTime, setSimTime] = useState(0);
  const [currentOpponent, setCurrentOpponent] = useState<Team | null>(null);
  const [currentScore, setCurrentScore] = useState({ home: 0, away: 0 });
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const [homePlayerPos, setHomePlayerPos] = useState<{x:number, y:number}[]>([]);
  const [awayPlayerPos, setAwayPlayerPos] = useState<{x:number, y:number}[]>([]);
  const [matchEvents, setMatchEvents] = useState<any[]>([]);
  const [lastEventIndex, setLastEventIndex] = useState(-1);

  // Halftime State
  const [isHalftime, setIsHalftime] = useState(false);
  const [hasPlayedSecondHalf, setHasPlayedSecondHalf] = useState(false);

  // TACTICS STATE
  const [currentTactic, setCurrentTactic] = useState<'balanced' | 'offensive' | 'defensive' | 'counter'>('balanced');

  // Audio State
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // CAREER MODE STATE (Rumo ao Estrelato)
  const [careerData, setCareerData] = useState<CareerData | null>(null);
  const [careerTempName, setCareerTempName] = useState("");
  const [careerTempPos, setCareerTempPos] = useState<Position>(Position.ATT);
  const [careerOffers, setCareerOffers] = useState<Array<{name: string, color: string}>>([]);
  
  const [showShop, setShowShop] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [showCareerTrophies, setShowCareerTrophies] = useState(false);
  const [careerTransferOffers, setCareerTransferOffers] = useState<Array<{name: string, color: string}>>([]);
  // New: Trophy Filter State
  const [trophyFilterSeason, setTrophyFilterSeason] = useState<number | 'all'>('all');

  const shopItems = [
      { id: 'phone', name: 'iPhone 15 Pro', price: 5000, icon: <Smartphone size={20} /> },
      { id: 'boots', name: 'Chuteira Elite', price: 1200, icon: <Shirt size={20} /> },
      { id: 'watch', name: 'Relógio de Luxo', price: 15000, icon: <Timer size={20} /> },
      { id: 'car', name: 'Carro Esportivo', price: 150000, icon: <Zap size={20} /> },
      { id: 'house', name: 'Apartamento', price: 500000, icon: <Briefcase size={20} /> },
      { id: 'console', name: 'Videogame', price: 3500, icon: <MonitorPlay size={20} /> }
  ];

  // Social Feed State
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
  // NEW: Expand/Collapse images state
  const [expandedPostIds, setExpandedPostIds] = useState<Set<string>>(new Set());

  // Logic to initialize table with FICTIONAL TEAMS + USER TEAM
  const initializeTable = (selectedTeam: Team) => {
      const fictionalNames = getFictionalLeagueNames(11); // Get 11 random fictional team names
      
      // 1. User Team
      const userStats: TeamStats = {
          id: selectedTeam.id,
          name: selectedTeam.name,
          points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0
      };

      // 2. Fictional Opponents
      const opponentStats: TeamStats[] = fictionalNames.map((name, index) => ({
          id: `fictional-${index}`,
          name: name,
          points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0
      }));

      setLeagueTable([userStats, ...opponentStats]);
  };

  // Audio Initialization
  useEffect(() => {
    const audio = new Audio('https://actions.google.com/sounds/v1/ambiences/stadium_crowd_cheering.ogg');
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;
    
    // Try to load
    audio.load();

    return () => {
        audio.pause();
        audioRef.current = null;
    };
  }, []);

  // Manage Audio Playback
  useEffect(() => {
    const shouldPlay = (isVisualMatch || preparingVisualMatch) && soundEnabled && !isHalftime;
    
    if (shouldPlay && audioRef.current) {
         const playPromise = audioRef.current.play();
         if (playPromise !== undefined) {
             playPromise.catch(error => {
                 console.log("Autoplay prevented/interrupted (normal in some flows):", error);
             });
         }
    } else if ((!shouldPlay || isHalftime) && audioRef.current) {
        audioRef.current.pause();
    }
  }, [isVisualMatch, preparingVisualMatch, soundEnabled, isHalftime]);


  // Initialization logic
  const handleTeamSelect = async (team: Team) => {
    setLoading(true);
    try {
        const players = await generateSquadForTeam(team.name);
        setUserTeam(team);
        setSquad(players);
        initializeTable(team); // Pass team to init table
        setSocialPosts(generateSocialFeed()); // Generate social feed
        setView('dashboard');
        
        // Pre-fetch market in background
        generateTransferMarket().then(setMarket);
    } catch (error) {
        console.error("Failed to start game", error);
        alert("Erro ao iniciar o jogo. Verifique a conexão ou a chave da API.");
        setUserTeam(null);
    } finally {
        setLoading(false);
    }
  };

  // --- Career Mode Handlers ---
  
  const handleStartCareer = () => {
      setCareerData(null);
      setCareerTempName("");
      setCareerTempPos(Position.ATT);
      setView('career-intro');
  };

  const handlePlayAmateurMatch = async () => {
      if (!careerTempName) {
          alert("Digite o nome do seu jogador!");
          return;
      }
      setLoading(true);
      
      // Simulate "Playing"
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate Offers
      // Requirement: Cruzeiro with different name (Raposa Celeste)
      const offers = [
          { name: "Raposa Celeste", color: "bg-blue-600" }, // The "Cruzeiro" fake
          { name: generateFictionalTeamName(), color: "bg-red-600" },
          { name: generateFictionalTeamName(), color: "bg-amber-500" }
      ];
      setCareerOffers(offers);
      setLoading(false);
  };

  const handleAcceptCareerOffer = (offer: {name: string, color: string}) => {
      setCareerData({
          playerName: careerTempName,
          position: careerTempPos,
          teamName: offer.name,
          teamColor: offer.color,
          matchesPlayed: 0,
          goals: 0,
          assists: 0,
          rating: 65, // Start rating
          history: [],
          cash: 0,
          inventory: [],
          season: 1,
          trophies: [] // Start with no trophies
      });
      setView('career-hub');
  };

  const handlePlayCareerMatch = async () => {
      if (!careerData || careerData.matchesPlayed >= 80) return;
      
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Fast sim
      
      // Random performance logic
      const scored = Math.random() > 0.6; // 40% chance to score
      const assisted = Math.random() > 0.8; // 20% chance to assist
      const ratingImprovement = Math.random() > 0.5 ? 1 : 0;
      
      const opponent = generateFictionalTeamName();
      const myGoals = scored ? (Math.random() > 0.9 ? 2 : 1) : 0;
      const resultText = scored 
        ? `Vitória! Você marcou ${myGoals} gol(s) contra ${opponent}.`
        : `Empate/Derrota contra ${opponent}. Atuação discreta.`;

      setCareerData(prev => {
          if (!prev) return null;
          
          const newMatchesPlayed = prev.matchesPlayed + 1;
          const currentGoals = prev.goals + myGoals;
          const currentAssists = prev.assists + (assisted ? 1 : 0);
          
          let newTrophies = [...prev.trophies];
          
          // Trophy Logic: 80 Matches
          if (newMatchesPlayed === 80) {
              const trophyName = "Lenda da Temporada";
              if (!newTrophies.some(t => t.name === trophyName && t.season === prev.season)) {
                  newTrophies.push({
                      name: trophyName,
                      season: prev.season,
                      description: "Completou 80 jogos na temporada"
                  });
                  setTimeout(() => alert(`PARABÉNS! Você completou 80 jogos e ganhou o troféu 'Lenda da Temporada'!`), 500);
              }
          }

          // Trophy Logic: 60 Goals (Artilheiro)
          if (prev.goals < 60 && currentGoals >= 60) {
               const trophyName = "Artilheiro de Ouro";
               if (!newTrophies.some(t => t.name === trophyName && t.season === prev.season)) {
                   newTrophies.push({
                       name: trophyName,
                       season: prev.season,
                       description: "Marcou 60 gols na temporada"
                   });
                   setTimeout(() => alert(`INCRÍVEL! 60 Gols! Você recebeu o troféu 'Artilheiro de Ouro'!`), 500);
               }
          }

          // Trophy Logic: 20 Assists (Rei das Assistências)
          if (prev.assists < 20 && currentAssists >= 20) {
               const trophyName = "Rei das Assistências";
               if (!newTrophies.some(t => t.name === trophyName && t.season === prev.season)) {
                   newTrophies.push({
                       name: trophyName,
                       season: prev.season,
                       description: "Deu 20 assistências na temporada"
                   });
                   setTimeout(() => alert(`QUE VISÃO! 20 Assistências! Você recebeu o troféu 'Rei das Assistências'!`), 500);
               }
          }

          return {
              ...prev,
              matchesPlayed: newMatchesPlayed,
              goals: currentGoals,
              assists: currentAssists,
              rating: prev.rating + ratingImprovement,
              history: [resultText, ...prev.history],
              cash: prev.cash + 1500, // Earn salary
              trophies: newTrophies
          };
      });
      setLoading(false);
  };

  const handleTrainPlayer = () => {
      if (!careerData) return;
      setCareerData(prev => {
          if (!prev) return null;
          return {
              ...prev,
              rating: Math.min(99, prev.rating + 1)
          }
      });
      alert("Treino concluído! +1 OVR");
  };

  const handleBuyItem = (item: any) => {
      if (!careerData) return;
      if (careerData.cash < item.price) {
          alert("Dinheiro insuficiente!");
          return;
      }
      setCareerData(prev => {
          if (!prev) return null;
          return {
              ...prev,
              cash: prev.cash - item.price,
              inventory: [...prev.inventory, item.name]
          }
      });
      alert(`${item.name} comprado com sucesso!`);
  };

  const handleOpenContract = () => {
      const t1 = generateFictionalTeamName();
      const t2 = generateFictionalTeamName();
      setCareerTransferOffers([
          { name: t1, color: "bg-slate-600" },
          { name: t2, color: "bg-indigo-600" }
      ]);
      setShowContract(true);
  };

  const handleContractDecision = (stay: boolean, newTeam?: {name: string, color: string}) => {
      if (!careerData) return;
      
      setCareerData(prev => {
          if (!prev) return null;
          return {
              ...prev,
              matchesPlayed: 0,
              goals: 0, // Reset goals for new season
              assists: 0, // Reset assists for new season
              season: prev.season + 1,
              teamName: stay ? prev.teamName : (newTeam?.name || prev.teamName),
              teamColor: stay ? prev.teamColor : (newTeam?.color || prev.teamColor),
              history: [] // Clear history for new season
          }
      });
      setShowContract(false);
      alert(stay ? "Contrato renovado! Nova temporada iniciada." : `Bem-vindo ao ${newTeam?.name}! Nova temporada iniciada.`);
  };

  // --- End Career Mode Handlers ---

  const handleSkipWeek = () => {
      setWeek(prev => prev + 1);
      
      const updatedSquad = squad.map(p => ({
          ...p,
          contractWeeks: p.contractWeeks - 1
      })).filter(p => {
          if (p.contractWeeks <= 0) {
              const reason = p.isLoaned ? "O empréstimo acabou" : "O contrato expirou";
              alert(`${reason}: ${p.name} deixou o clube!`);
              return false;
          }
          return true;
      });

      setSquad(updatedSquad);
      setSocialPosts(generateSocialFeed()); // Refresh feed each week
      setExpandedPostIds(new Set()); // Reset open photos
      alert("Semana pulada! Contratos atualizados.");
  };

  // Social Feed Handlers
  const handleLikePost = (postId: string) => {
      setSocialPosts(prev => prev.map(post => 
          post.id === postId ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked } : post
      ));
  };
  
  // --- Render ---

  if (view === 'select-team') {
    return <TeamSelection onSelect={handleTeamSelect} />;
  }

  if (view === 'career-intro') {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative">
              <button 
                  onClick={() => setView('dashboard')}
                  className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
              >
                  <ArrowLeft size={24} />
                  <span className="font-bold">Voltar ao Início</span>
              </button>

              <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
                  <h1 className="text-3xl font-bold text-white mb-6 text-center">Rumo ao Estrelato</h1>
                  
                  {careerOffers.length > 0 ? (
                      <div className="space-y-4">
                          <h2 className="text-xl text-emerald-400 font-bold text-center mb-4">Ofertas Recebidas!</h2>
                          {careerOffers.map((offer, idx) => (
                              <button 
                                  key={idx}
                                  onClick={() => handleAcceptCareerOffer(offer)}
                                  className={`w-full p-4 rounded-xl flex items-center justify-between transition-all hover:scale-105 ${offer.color} text-white`}
                              >
                                  <span className="font-bold text-lg">{offer.name}</span>
                                  <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">Contrato Inicial</div>
                              </button>
                          ))}
                      </div>
                  ) : (
                      <div className="space-y-6">
                          <div>
                              <label className="block text-slate-400 mb-2 text-sm font-bold">Nome do Jogador</label>
                              <input 
                                  type="text" 
                                  value={careerTempName}
                                  onChange={(e) => setCareerTempName(e.target.value)}
                                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                                  placeholder="Seu nome..."
                              />
                          </div>
                          <div>
                              <label className="block text-slate-400 mb-2 text-sm font-bold">Posição</label>
                              <div className="grid grid-cols-2 gap-2">
                                  {Object.values(Position).map(pos => (
                                      <button
                                          key={pos}
                                          onClick={() => setCareerTempPos(pos)}
                                          className={`p-2 rounded-lg text-sm font-medium border transition-colors ${careerTempPos === pos ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}
                                      >
                                          {pos}
                                      </button>
                                  ))}
                              </div>
                          </div>

                          <button 
                              onClick={handlePlayAmateurMatch}
                              disabled={loading}
                              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                              {loading ? 'Jogando...' : 'Jogar Peneira (Partida Amadora)'}
                              {!loading && <PlayCircle size={20} />}
                          </button>
                          <p className="text-xs text-center text-slate-500">Jogue bem para receber propostas de clubes profissionais.</p>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  if (view === 'career-hub' && careerData) {
      return (
          <div className="min-h-screen bg-slate-950 text-white pb-20 relative">
              {/* Header */}
              <div className={`h-48 ${careerData.teamColor} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full flex justify-between items-end">
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">Temporada {careerData.season}</span>
                              <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">{careerData.position}</span>
                          </div>
                          <h1 className="text-3xl font-bold">{careerData.playerName}</h1>
                          <p className="text-white/80 font-medium flex items-center gap-1"><Shield size={14} /> {careerData.teamName}</p>
                      </div>
                      <div className="text-right">
                          <div className="text-4xl font-bold text-emerald-400">{careerData.rating}</div>
                          <div className="text-xs text-slate-400 font-bold uppercase">OVR</div>
                      </div>
                  </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-2 p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                  <div className="text-center">
                      <p className="text-slate-500 text-[10px] font-bold uppercase">Jogos</p>
                      <p className="font-bold text-lg">{careerData.matchesPlayed}</p>
                  </div>
                  <div className="text-center">
                      <p className="text-slate-500 text-[10px] font-bold uppercase">Gols</p>
                      <p className="font-bold text-lg">{careerData.goals}</p>
                  </div>
                  <div className="text-center">
                      <p className="text-slate-500 text-[10px] font-bold uppercase">Assists</p>
                      <p className="font-bold text-lg">{careerData.assists}</p>
                  </div>
                  <div className="text-center border-l border-slate-800 pl-2">
                      <p className="text-emerald-500 text-[10px] font-bold uppercase">Caixa</p>
                      <p className="font-bold text-sm md:text-lg text-emerald-400">R$ {careerData.cash}</p>
                  </div>
              </div>

              {/* Main Actions */}
              <div className="p-4 grid grid-cols-2 gap-4">
                  <button 
                      onClick={handlePlayCareerMatch}
                      disabled={loading || careerData.matchesPlayed >= 80}
                      className="col-span-2 bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-2xl flex items-center justify-between shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95 group disabled:opacity-50"
                  >
                      <div className="text-left">
                          <h3 className="text-xl font-bold mb-1">Próxima Partida</h3>
                          <p className="text-emerald-100 text-sm">Campeonato Nacional</p>
                      </div>
                      <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform">
                          <PlayCircle size={32} fill="currentColor" className="text-white" />
                      </div>
                  </button>

                  <button onClick={handleTrainPlayer} className="bg-slate-800 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-slate-700 active:scale-95 transition-all">
                      <Dumbbell size={24} className="text-blue-400" />
                      <span className="font-bold text-sm">Treino (+1 OVR)</span>
                  </button>

                  <button onClick={() => setShowShop(true)} className="bg-slate-800 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-slate-700 active:scale-95 transition-all">
                      <ShoppingBag size={24} className="text-purple-400" />
                      <span className="font-bold text-sm">Loja</span>
                  </button>

                  <button 
                    onClick={() => setShowCareerTrophies(true)} 
                    className="bg-slate-800 border border-amber-500/30 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-slate-800/80 active:scale-95 transition-all relative overflow-hidden group"
                  >
                      <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity"/>
                      <div className="p-3 bg-slate-900 rounded-full border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all">
                          <Trophy size={24} className="text-amber-400" />
                      </div>
                      <span className="font-bold text-slate-200 z-10">Sala de Troféus</span>
                  </button>

                  <button onClick={handleOpenContract} disabled={careerData.matchesPlayed < 80} className="bg-slate-800 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-30">
                      <Briefcase size={24} className="text-slate-400" />
                      <span className="font-bold text-sm">Contrato</span>
                  </button>
              </div>

              {/* Recent History */}
              <div className="px-4 mt-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Histórico Recente</h3>
                  <div className="space-y-2">
                      {careerData.history.slice(0, 5).map((event, i) => (
                          <div key={i} className="bg-slate-900 p-3 rounded-lg text-sm text-slate-300 border border-slate-800">
                              {event}
                          </div>
                      ))}
                      {careerData.history.length === 0 && (
                          <p className="text-slate-600 text-sm italic text-center py-4">Nenhuma partida jogada ainda.</p>
                      )}
                  </div>
              </div>

              {/* MODALS */}
              
              {/* Shop Modal */}
              {showShop && (
                  <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                      <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700 p-6 shadow-2xl">
                          <div className="flex justify-between items-center mb-6">
                              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingBag className="text-purple-400"/> Loja de Luxo</h2>
                              <button onClick={() => setShowShop(false)} className="p-1 bg-slate-800 rounded-full"><X size={20}/></button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                              {shopItems.map(item => (
                                  <button 
                                      key={item.id}
                                      onClick={() => handleBuyItem(item)}
                                      disabled={careerData.inventory.includes(item.name)}
                                      className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${careerData.inventory.includes(item.name) ? 'bg-slate-800 border-slate-700 opacity-50' : 'bg-slate-800 border-slate-600 hover:border-purple-500 hover:bg-slate-700'}`}
                                  >
                                      <div className="text-purple-400">{item.icon}</div>
                                      <span className="text-sm font-bold">{item.name}</span>
                                      <span className="text-xs text-emerald-400">R$ {item.price}</span>
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              {/* Contract Modal */}
              {showContract && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 p-6 shadow-2xl">
                          <h2 className="text-2xl font-bold mb-2 text-center">Fim de Temporada!</h2>
                          <p className="text-slate-400 text-center text-sm mb-6">Escolha seu destino para a próxima temporada.</p>
                          
                          <div className="space-y-3">
                              <button onClick={() => handleContractDecision(true)} className={`w-full p-4 rounded-xl border-2 border-emerald-600 bg-emerald-500/10 flex items-center justify-between hover:bg-emerald-500/20 transition-all`}>
                                  <span className="font-bold">Renovar com {careerData.teamName}</span>
                                  <CheckCircle className="text-emerald-500"/>
                              </button>
                              <div className="relative flex py-2 items-center">
                                  <div className="flex-grow border-t border-slate-700"></div>
                                  <span className="flex-shrink-0 mx-4 text-slate-600 text-xs uppercase font-bold">Ou Transferir-se</span>
                                  <div className="flex-grow border-t border-slate-700"></div>
                              </div>
                              {careerTransferOffers.map((offer, i) => (
                                  <button key={i} onClick={() => handleContractDecision(false, offer)} className={`w-full p-4 rounded-xl border border-slate-700 bg-slate-800 flex items-center justify-between hover:border-white hover:bg-slate-700 transition-all`}>
                                      <div className="flex items-center gap-3">
                                          <div className={`w-8 h-8 rounded-full ${offer.color}`}></div>
                                          <span className="font-bold">{offer.name}</span>
                                      </div>
                                      <MoveRight size={16} className="text-slate-500"/>
                                  </button>
                              ))}
                          </div>
                          <button onClick={() => setShowContract(false)} className="mt-4 w-full py-3 text-slate-500 text-sm hover:text-white">Decidir Depois</button>
                      </div>
                  </div>
              )}

               {/* Trophy Modal */}
              {showCareerTrophies && careerData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="bg-slate-900 w-full max-w-4xl rounded-2xl border border-amber-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                       {/* Header */}
                       <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
                           <div className="flex items-center gap-3">
                               <Trophy className="text-amber-400" size={28} />
                               <div>
                                   <h2 className="text-2xl font-bold text-white">Sala de Troféus</h2>
                                   <p className="text-slate-400 text-sm">Suas conquistas lendárias</p>
                               </div>
                           </div>
                           <button onClick={() => setShowCareerTrophies(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                               <X size={24} />
                           </button>
                       </div>

                       {/* Filters */}
                       <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex gap-2 overflow-x-auto no-scrollbar">
                           <button
                               onClick={() => setTrophyFilterSeason('all')}
                               className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${trophyFilterSeason === 'all' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                           >
                               Todas
                           </button>
                           {Array.from(new Set(careerData.trophies.map(t => t.season))).sort((a: number, b: number) => a - b).map(s => (
                               <button
                                   key={s}
                                   onClick={() => setTrophyFilterSeason(s)}
                                   className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${trophyFilterSeason === s ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                               >
                                   Temporada {s}
                               </button>
                           ))}
                       </div>

                       {/* Grid */}
                       <div className="p-6 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                           {careerData.trophies.filter(t => trophyFilterSeason === 'all' || t.season === trophyFilterSeason).length === 0 ? (
                               <div className="col-span-full py-12 text-center text-slate-500">
                                   <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                                   <p>Nenhum troféu encontrado nesta categoria.</p>
                               </div>
                           ) : (
                               careerData.trophies
                                   .filter(t => trophyFilterSeason === 'all' || t.season === trophyFilterSeason)
                                   .map((trophy, idx) => (
                                       <div key={idx} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-4 rounded-xl flex flex-col items-center text-center group hover:border-amber-500/50 transition-colors relative overflow-hidden">
                                           <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                           <div className="w-16 h-16 mb-3 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                                               <Trophy size={32} className="text-amber-400 drop-shadow-md" />
                                           </div>
                                           <h3 className="font-bold text-white text-sm mb-1">{trophy.name}</h3>
                                           <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 mb-2">Temporada {trophy.season}</span>
                                           <p className="text-xs text-slate-400 leading-tight">{trophy.description}</p>
                                       </div>
                                   ))
                           )}
                       </div>
                    </div>
                </div>
              )}

              <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 flex justify-around z-40">
                  <button onClick={() => setView('dashboard')} className="flex flex-col items-center text-slate-500 hover:text-white">
                      <ArrowLeft size={20} />
                      <span className="text-[10px] mt-1">Voltar ao Início</span>
                  </button>
              </div>
          </div>
      );
  }

  return (
      <div className="min-h-screen flex bg-slate-100">
          <Sidebar currentView={view} onChangeView={setView} team={userTeam} />
          
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
              <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 lg:pb-6">
                  {/* ... Main Manager Mode Logic ... */}
                  <div className="flex items-center justify-between mb-6">
                       <h1 className="text-2xl font-bold text-slate-900">
                         {view === 'dashboard' && 'Visão Geral'}
                         {view === 'squad' && 'Gerenciar Elenco'}
                         {view === 'match' && 'Dia de Jogo'}
                         {view === 'market' && 'Mercado da Bola'}
                         {view === 'standings' && 'Tabela do Campeonato'}
                       </h1>
                       <div className="flex items-center gap-4">
                           <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
                               <DollarSign size={16} className="text-emerald-600" />
                               <span className="font-bold text-slate-700 text-sm">${budget.toFixed(1)}M</span>
                           </div>
                           <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
                               <Calendar size={16} className="text-blue-600" />
                               <span className="font-bold text-slate-700 text-sm">Semana {week}</span>
                           </div>
                           <button 
                               onClick={handleSkipWeek}
                               className="bg-slate-800 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-slate-700 transition-colors"
                           >
                               Pular Semana
                           </button>
                           <button
                               onClick={handleStartCareer}
                               className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:shadow-lg transition-all animate-pulse"
                           >
                               Modo Estrela
                           </button>
                       </div>
                  </div>

                  {view === 'dashboard' && (
                      <div className="space-y-6">
                          {/* Top Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <StatsCard 
                                  title="Jogos" 
                                  value={userTeam && leagueTable.find(t => t.id === userTeam.id)?.played || 0} 
                                  icon={<Activity size={20} className="text-blue-600" />} 
                                  colorClass="border-l-blue-500" 
                                  bgClass="bg-blue-100"
                              />
                              <StatsCard 
                                  title="Vitórias" 
                                  value={userTeam && leagueTable.find(t => t.id === userTeam.id)?.won || 0} 
                                  icon={<Trophy size={20} className="text-amber-500" />} 
                                  colorClass="border-l-amber-500" 
                                  bgClass="bg-amber-100"
                              />
                              <StatsCard 
                                  title="Média OVR" 
                                  value={Math.round(squad.reduce((acc, p) => acc + p.rating, 0) / (squad.length || 1))} 
                                  icon={<Star size={20} className="text-emerald-500" />} 
                                  colorClass="border-l-emerald-500" 
                                  bgClass="bg-emerald-100"
                              />
                              <StatsCard 
                                  title="Torcida" 
                                  value="Apaixonada" 
                                  icon={<Heart size={20} className="text-red-500" />} 
                                  colorClass="border-l-red-500" 
                                  bgClass="bg-red-100"
                              />
                          </div>

                          {/* Dashboard Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Social Feed */}
                              <div className="lg:col-span-2 space-y-6">
                                  <div className="flex items-center justify-between">
                                      <h2 className="text-lg font-bold text-slate-800">Rede Social</h2>
                                      <button onClick={() => setSocialPosts(generateSocialFeed())} className="text-sm text-blue-600 hover:underline">Atualizar</button>
                                  </div>
                                  
                                  <div className="space-y-4">
                                      {socialPosts.map(post => (
                                          <Card key={post.id} className="p-0 overflow-hidden">
                                              <div className="p-4 flex items-center gap-3">
                                                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                                      {post.authorName[0]}
                                                  </div>
                                                  <div>
                                                      <p className="font-bold text-slate-800 text-sm">{post.authorName}</p>
                                                      {post.teamName && <p className="text-xs text-slate-500">{post.teamName}</p>}
                                                  </div>
                                                  <span className="ml-auto text-xs text-slate-400">{post.timeAgo}</span>
                                              </div>
                                              
                                              {/* Fake Photo Area */}
                                              <div className={`w-full bg-slate-200 relative flex items-center justify-center overflow-hidden transition-all duration-300 ${expandedPostIds.has(post.id) ? 'h-96' : 'h-48 cursor-pointer'}`} onClick={() => {
                                                  const newSet = new Set(expandedPostIds);
                                                  if (newSet.has(post.id)) newSet.delete(post.id);
                                                  else newSet.add(post.id);
                                                  setExpandedPostIds(newSet);
                                              }}>
                                                  <img 
                                                      src={`https://source.unsplash.com/800x600/?soccer,${post.imageType}`} 
                                                      alt="Post" 
                                                      className="w-full h-full object-cover"
                                                      onError={(e) => {e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Carregando+Imagem'}} 
                                                  />
                                                  {!expandedPostIds.has(post.id) && (
                                                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                          <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full">Ver Foto</span>
                                                      </div>
                                                  )}
                                              </div>

                                              <div className="p-4">
                                                  <div className="flex gap-4 mb-3">
                                                      <button 
                                                          onClick={() => handleLikePost(post.id)}
                                                          className={`flex items-center gap-1.5 text-sm ${post.isLiked ? 'text-red-500' : 'text-slate-600 hover:text-red-500'}`}
                                                      >
                                                          <Heart size={20} fill={post.isLiked ? "currentColor" : "none"} />
                                                      </button>
                                                      <button className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-500">
                                                          <MessageCircle size={20} />
                                                      </button>
                                                  </div>
                                                  <p className="text-sm text-slate-800 mb-2">
                                                      <span className="font-bold mr-2">{post.authorName}</span>
                                                      {post.content}
                                                  </p>
                                                  <p className="text-xs text-slate-500 font-bold">{post.likes} curtidas</p>
                                              </div>
                                          </Card>
                                      ))}
                                  </div>
                              </div>

                              {/* Side Widgets */}
                              <div className="space-y-6">
                                  <Card title="Próximo Jogo">
                                      <div className="text-center py-4">
                                          <div className="flex items-center justify-center gap-4 mb-4">
                                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${userTeam?.primaryColor} ${userTeam?.secondaryColor}`}>
                                                  {userTeam?.name.substring(0, 3).toUpperCase()}
                                              </div>
                                              <span className="text-slate-400 font-bold">VS</span>
                                              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                                  ???
                                              </div>
                                          </div>
                                          <button 
                                              onClick={() => setView('match')}
                                              className="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                                          >
                                              Ir para o Jogo
                                          </button>
                                      </div>
                                  </Card>

                                  <Card title="Top Jogadores">
                                      <div className="space-y-3">
                                          {squad.sort((a,b) => b.rating - a.rating).slice(0, 3).map(p => (
                                              <div key={p.id} className="flex items-center gap-3">
                                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
                                                      {p.rating}
                                                  </div>
                                                  <div className="min-w-0">
                                                      <p className="text-sm font-bold truncate">{p.name}</p>
                                                      <p className="text-xs text-slate-500">{p.position}</p>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </Card>
                              </div>
                          </div>
                      </div>
                  )}

                  {view === 'squad' && (
                      <div className="space-y-6">
                         <Card title="Seu Elenco">
                             <div className="space-y-1">
                                 {squad.sort((a,b) => b.rating - a.rating).map(player => (
                                     <PlayerRow 
                                         key={player.id} 
                                         player={player} 
                                         onRenew={(p) => {
                                             alert(`Contrato de ${p.name} renovado!`);
                                             setSquad(prev => prev.map(pl => pl.id === p.id ? {...pl, contractWeeks: pl.contractWeeks + 52} : pl));
                                         }}
                                     />
                                 ))}
                             </div>
                         </Card>
                      </div>
                  )}
                  
                   {view === 'standings' && (
                      <Card title="Tabela do Campeonato">
                          <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left">
                                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                      <tr>
                                          <th className="p-3 font-bold w-10">#</th>
                                          <th className="p-3 font-bold">Clube</th>
                                          <th className="p-3 font-bold text-center">P</th>
                                          <th className="p-3 font-bold text-center hidden sm:table-cell">J</th>
                                          <th className="p-3 font-bold text-center hidden sm:table-cell">V</th>
                                          <th className="p-3 font-bold text-center hidden sm:table-cell">E</th>
                                          <th className="p-3 font-bold text-center hidden sm:table-cell">D</th>
                                          <th className="p-3 font-bold text-center hidden md:table-cell">SG</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {leagueTable.sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga)).map((team, index) => (
                                          <tr key={team.id} className={`border-b border-slate-100 hover:bg-slate-50 ${team.id === userTeam?.id ? 'bg-emerald-50' : ''}`}>
                                              <td className="p-3 font-bold text-slate-400">{index + 1}</td>
                                              <td className="p-3 font-semibold text-slate-800 flex items-center gap-2">
                                                 {team.id === userTeam?.id && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                                                 {team.name}
                                              </td>
                                              <td className="p-3 font-bold text-center text-slate-900">{team.points}</td>
                                              <td className="p-3 text-center hidden sm:table-cell text-slate-600">{team.played}</td>
                                              <td className="p-3 text-center hidden sm:table-cell text-green-600 font-medium">{team.won}</td>
                                              <td className="p-3 text-center hidden sm:table-cell text-slate-500">{team.drawn}</td>
                                              <td className="p-3 text-center hidden sm:table-cell text-red-500">{team.lost}</td>
                                              <td className="p-3 text-center hidden md:table-cell text-slate-600 font-mono">{team.gf - team.ga > 0 ? `+${team.gf - team.ga}` : team.gf - team.ga}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </Card>
                  )}

                  {/* Placeholder for other views to keep code clean */}
                  {view === 'market' && <div className="text-center py-20 text-slate-500">Mercado de Transferências (Em Breve)</div>}
                  {view === 'match' && <div className="text-center py-20 text-slate-500">Simulação de Partida (Use o Menu Principal)</div>}
              </main>
          </div>
          
          <MobileNav currentView={view} onChangeView={setView} team={userTeam} />
      </div>
  );
}
