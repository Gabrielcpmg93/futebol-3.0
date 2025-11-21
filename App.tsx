
import React, { useState, useEffect, useRef } from 'react';
import { BRAZILIAN_TEAMS, Team, Player, ViewState, MatchResult, Position, TeamStats, Trophy as TrophyType, SocialPost, CareerData } from './types';
import { generateSquadForTeam, generateTransferMarket, simulateMatchWithGemini, generateScoutReport, generateFictionalTeamName, getFictionalLeagueNames, generateSocialFeed } from './services/geminiService';
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
    UserPlus,
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
    Target,
    Timer,
    Smartphone,
    Heart,
    MessageCircle,
    Send,
    Camera,
    Dumbbell,
    Coffee,
    Eye,
    EyeOff,
    ArrowLeft,
    Medal,
    TrendingUp
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
          history: []
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
          return {
              ...prev,
              matchesPlayed: prev.matchesPlayed + 1,
              goals: prev.goals + myGoals,
              assists: prev.assists + (assisted ? 1 : 0),
              rating: prev.rating + ratingImprovement,
              history: [resultText, ...prev.history]
          };
      });
      setLoading(false);
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
      setSocialPosts(prev => prev.map(post => {
          if (post.id === postId) {
              return {
                  ...post,
                  likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                  isLiked: !post.isLiked
              };
          }
          return post;
      }));
  };

  const handleCommentPost = (postId: string) => {
      const text = commentInputs[postId];
      if (!text || text.trim() === "") return;

      setSocialPosts(prev => prev.map(post => {
          if (post.id === postId) {
              return {
                  ...post,
                  comments: [...post.comments, { id: Math.random().toString(), author: "Você", text }]
              };
          }
          return post;
      }));
      
      setCommentInputs(prev => ({...prev, [postId]: ""}));
  };

  const togglePostImage = (postId: string) => {
      setExpandedPostIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(postId)) {
              newSet.delete(postId);
          } else {
              newSet.add(postId);
          }
          return newSet;
      });
  };

  // --- Buying / Negotiation Logic ---
  
  const handleOpenNegotiation = (player: Player) => {
      setNegotiationPlayer(player);
      // Suggest reasonable defaults based on player value
      const suggestedSalary = player.salary || Math.floor(player.value * 10 + 20);
      setNegotiationOffer({ salary: suggestedSalary, weeks: 52 });
  };

  const handleConfirmPurchase = () => {
      if (!negotiationPlayer) return;
      
      // Simple validation: Must pay transfer fee
      if (budget < negotiationPlayer.value) {
          alert("Orçamento insuficiente para pagar a taxa de transferência!");
          return;
      }

      setBudget(prev => prev - negotiationPlayer.value);
      setMarket(prev => prev.filter(p => p.id !== negotiationPlayer.id));
      setSquad(prev => [...prev, { 
          ...negotiationPlayer, 
          team: userTeam?.name, 
          contractWeeks: negotiationOffer.weeks,
          salary: negotiationOffer.salary,
          isLoaned: false
      }]);

      setNegotiationPlayer(null);
      alert(`Contratado! ${negotiationPlayer.name} se juntou ao time.`);
  };

  const handleLoanIn = (player: Player) => {
      // Loan fee is usually smaller, say 10% of value
      const loanFee = player.value * 0.1;
      
      if (budget < loanFee) {
          alert(`Orçamento insuficiente! Taxa de empréstimo: $${loanFee.toFixed(1)}M`);
          return;
      }

      if (window.confirm(`Contratar ${player.name} por empréstimo de 12 semanas? Custo: $${loanFee.toFixed(1)}M`)) {
        setBudget(prev => prev - loanFee);
        setMarket(prev => prev.filter(p => p.id !== player.id));
        setSquad(prev => [...prev, { 
            ...player, 
            team: userTeam?.name, 
            contractWeeks: 12, // Fixed 12 weeks
            salary: player.salary || 50,
            isLoaned: true
        }]);
        alert(`${player.name} contratado por empréstimo! (12 semanas)`);
      }
  };

  // --- Squad Management Handlers ---

  const handleInitiateSell = (player: Player) => {
      setSellingPlayer(player);
      // Offers from fictional teams in the current league context would be better, 
      // but for now random fictional names from service is fine.
      const potentialNames = getFictionalLeagueNames(3);
      
      const newOffers = potentialNames.map(name => {
          const variation = (Math.random() * 0.35) - 0.15;
          return {
              team: name,
              value: player.value * (1 + variation)
          };
      });
      setOffers(newOffers);
  };

  const handleConfirmSell = (offer: {team: string, value: number}) => {
      if (!sellingPlayer) return;
      setBudget(prev => prev + offer.value);
      setSquad(prev => prev.filter(p => p.id !== sellingPlayer.id));
      setMarket(prev => [...prev, sellingPlayer]); 
      setSellingPlayer(null);
      setOffers([]);
      alert(`Negócio fechado! ${sellingPlayer.name} vendido para ${offer.team} por $${offer.value.toFixed(1)}M.`);
  };

  const handleInitiateLoan = (player: Player) => {
      setLoaningPlayer(player);
      const offers = [
          { team: generateFictionalTeamName(), value: player.value * 0.15 },
          { team: generateFictionalTeamName(), value: player.value * 0.12 }
      ];
      if (offers[0].team === offers[1].team) {
          offers[1].team = generateFictionalTeamName();
      }
      setLoanOffers(offers);
  };

  const handleConfirmLoan = (offer: {team: string, value: number}) => {
      if (!loaningPlayer) return;
      setBudget(prev => prev + offer.value);
      setSquad(prev => prev.filter(p => p.id !== loaningPlayer.id));
      setLoaningPlayer(null);
      setLoanOffers([]);
      alert(`${loaningPlayer.name} foi emprestado ao ${offer.team} com sucesso! (+ $${offer.value.toFixed(1)}M)`);
  };

  const handleRenew = (player: Player) => {
      const cost = player.value * 0.1;
      if (budget < cost) {
          alert(`Fundos insuficientes! Custo da renovação: $${cost.toFixed(1)}M`);
          return;
      }
      
      if (window.confirm(`Renovar com ${player.name} por $${cost.toFixed(1)}M? (+50 semanas)`)) {
          setBudget(prev => prev - cost);
          setSquad(prev => prev.map(p => p.id === player.id ? { ...p, contractWeeks: p.contractWeeks + 50 } : p));
          alert(`Contrato de ${player.name} renovado com sucesso! Novo vínculo: ${player.contractWeeks + 50} semanas.`);
      }
  };

  // --- Match Logic ---

  const initializeMatchPositions = () => {
      // 4-4-2 Formation (percentages)
      // GK, Defs, Mids, Atts
      // Home attacks Left to Right (X: 0 -> 100)
      const homeBase = [
          {x: 5, y: 50}, // GK
          {x: 20, y: 20}, {x: 20, y: 40}, {x: 20, y: 60}, {x: 20, y: 80}, // DEF
          {x: 45, y: 20}, {x: 45, y: 40}, {x: 45, y: 60}, {x: 45, y: 80}, // MID
          {x: 65, y: 40}, {x: 65, y: 60}  // ATT
      ];

      // Mirror for away team
      const awayBase = homeBase.map(p => ({ x: 100 - p.x, y: p.y }));

      setHomePlayerPos(homeBase);
      setAwayPlayerPos(awayBase);
  };

  const prepareMatch = async (visual: boolean) => {
      if (!userTeam) return;

      // Pick random opponent FROM LEAGUE TABLE (not user team)
      const potentialOpponents = leagueTable.filter(t => t.id !== userTeam.id);
      if (potentialOpponents.length === 0) return;
      
      const opponentStats = potentialOpponents[Math.floor(Math.random() * potentialOpponents.length)];
      
      // Reconstruct Team object for visual match (give fictional teams random colors if needed)
      const opponent: Team = {
          id: opponentStats.id,
          name: opponentStats.name,
          primaryColor: 'bg-slate-700', // Default for fictional
          secondaryColor: 'text-white'
      };
      
      // Generate some color variation for fictional teams based on name hash (simple)
      const colors = ['bg-red-700', 'bg-blue-700', 'bg-green-700', 'bg-yellow-600', 'bg-purple-700', 'bg-orange-600', 'bg-teal-700'];
      const colorIndex = opponentStats.name.length % colors.length;
      opponent.primaryColor = colors[colorIndex];


      // ** CRITICAL FIX FOR MOBILE AUDIO **
      // Unlock audio immediately on user click
      if (visual) {
          setPreparingVisualMatch(true); // Prevent useEffect from pausing
          setSoundEnabled(true);
          setCurrentTactic('balanced'); // Reset tactic
          setIsHalftime(false);
          setHasPlayedSecondHalf(false);
          
          if (audioRef.current) {
              audioRef.current.volume = 0.4;
              // Try to play. This catches the "User Activation" token.
              audioRef.current.play().catch(e => console.warn("Audio unlock warning:", e));
          }
      }
      
      setCurrentOpponent(opponent);

      // Pre-calculate Result
      setIsSimulating(true);
      const result = await simulateMatchWithGemini(userTeam, squad, opponent);
      setMatchResult(result);
      setMatchEvents(result.events);
      
      if (visual) {
          setIsVisualMatch(true);
          setSimTime(0);
          setCurrentScore({ home: 0, away: 0 });
          initializeMatchPositions();
          setLastEventIndex(-1);
          setPreparingVisualMatch(false); // Handover to normal visual match logic
      } else {
          finishMatch(result, opponent);
      }
  };

  // Simulation Loop for Visual Match
  useEffect(() => {
      if (!isVisualMatch || !matchResult || simTime > 90) return;
      if (isHalftime) return; // Pause for halftime

      const timer = setInterval(() => {
          setSimTime(prev => {
              // Check for Halftime
              if (prev === 45 && !hasPlayedSecondHalf) {
                  setIsHalftime(true);
                  return 45;
              }

              const nextTime = prev + 1;
              if (nextTime > 90) {
                  finishMatch(matchResult, currentOpponent!);
                  return 92; // Stop
              }
              return nextTime;
          });

          // --- DYNAMIC TACTIC EVENT GENERATION ---
          // Chance to score randomly based on Tactic (Overriding pre-determined events)
          // Offensive: High chance score, High chance concede
          // Defensive: Low chance both
          // Counter: Med chance score
          const rand = Math.random();
          let homeGoalChance = 0;
          let awayGoalChance = 0;

          if (currentTactic === 'offensive') {
              homeGoalChance = 0.02; // 2% per tick
              awayGoalChance = 0.015; // Riskier
          } else if (currentTactic === 'defensive') {
              homeGoalChance = 0.002; // Very hard to score
              awayGoalChance = 0.002; // Very hard to concede
          } else if (currentTactic === 'counter') {
              homeGoalChance = 0.01; // Decent chance
              awayGoalChance = 0.005; // Good defense
          } else { // Balanced
              homeGoalChance = 0.005;
              awayGoalChance = 0.005;
          }

          // Only trigger if no event is happening this very second from the pre-scripted list
          const eventsNow = matchEvents.filter(e => e.minute === simTime);
          let dynamicEventHappened = false;

          if (eventsNow.length === 0) {
             if (rand < homeGoalChance) {
                 setCurrentScore(s => ({ ...s, home: s.home + 1 }));
                 setBallPosition({ x: 95, y: 50 });
                 dynamicEventHappened = true;
             } else if (rand > (1 - awayGoalChance)) {
                 setCurrentScore(s => ({ ...s, away: s.away + 1 }));
                 setBallPosition({ x: 5, y: 50 });
                 dynamicEventHappened = true;
             }
          }

          if (!dynamicEventHappened) {
            if (eventsNow.length > 0) {
                eventsNow.forEach(e => {
                    if (e.type === 'goal') {
                            if (e.team === 'home') {
                                setCurrentScore(s => ({ ...s, home: s.home + 1 }));
                                setBallPosition({ x: 95, y: 50 }); // Ball in away net
                            } else {
                                setCurrentScore(s => ({ ...s, away: s.away + 1 }));
                                setBallPosition({ x: 5, y: 50 }); // Ball in home net
                            }
                    }
                });
            } else {
                // --- MOVEMENT LOGIC BASED ON TACTIC ---
                
                // Base movement modifiers
                let homeXMod = 0;
                let awayXMod = 0;

                if (currentTactic === 'offensive') homeXMod = 25; // Push forward
                if (currentTactic === 'defensive') homeXMod = -20; // Park the bus
                if (currentTactic === 'counter') homeXMod = -5; // Sit deep initially

                // Random Movement + Tactic Offset
                setHomePlayerPos(prev => prev.map((p, idx) => {
                    // Special logic for Counter Attack: Attackers (last 2) stay high
                    let specificMod = homeXMod;
                    if (currentTactic === 'counter' && idx >= 9) specificMod = 30; // Attackers cheat forward

                    const targetX = p.x + specificMod; 
                    
                    // Move towards target X slowly, plus random noise
                    const moveX = (Math.random() - 0.5) * 3;
                    const moveY = (Math.random() - 0.5) * 3;
                    
                    // Bounded box 0-100
                    let newX = Math.max(2, Math.min(98, p.x + moveX));
                    // Bias towards tactical position
                    if (newX < targetX) newX += 0.5;
                    if (newX > targetX) newX -= 0.5;

                    return {
                        x: newX,
                        y: Math.max(2, Math.min(98, p.y + moveY))
                    };
                }));

                setAwayPlayerPos(prev => prev.map(p => ({
                    x: Math.max(2, Math.min(98, p.x + (Math.random() - 0.5) * 2)),
                    y: Math.max(2, Math.min(98, p.y + (Math.random() - 0.5) * 2))
                })));

                // Move Ball
                setBallPosition(prev => ({
                    x: Math.max(5, Math.min(95, prev.x + (Math.random() - 0.5) * 15)),
                    y: Math.max(5, Math.min(95, prev.y + (Math.random() - 0.5) * 10))
                }));
            }
          }

      }, 150); // Speed of simulation

      return () => clearInterval(timer);
  }, [isVisualMatch, simTime, matchResult, matchEvents, currentTactic, isHalftime, hasPlayedSecondHalf]);

  const startSecondHalf = () => {
      setIsHalftime(false);
      setHasPlayedSecondHalf(true);
      // Little push to prevent getting stuck at 45 if the interval triggers immediately again (though logic prevents it)
      setSimTime(46);
  };

  const finishMatch = (result: MatchResult, opponent: Team) => {
      setIsVisualMatch(false);
      setIsSimulating(false);
      setPreparingVisualMatch(false);
      setSoundEnabled(false);
      setIsHalftime(false);
      setHasPlayedSecondHalf(false);
      
      // Use the VISUAL score if it was a visual match, otherwise use calculated
      // This honors the "tactics changed the result" logic
      const finalHomeScore = isVisualMatch ? currentScore.home : result.homeScore;
      const finalAwayScore = isVisualMatch ? currentScore.away : result.awayScore;

      const finalWin = finalHomeScore > finalAwayScore;
      const finalDraw = finalHomeScore === finalAwayScore;

      // Update the matchResult object to reflect actual visual outcome
      const finalResult = {
          ...result,
          homeScore: finalHomeScore,
          awayScore: finalAwayScore,
          win: finalWin,
          draw: finalDraw,
          summary: isVisualMatch ? "Resultado influenciado pela estratégia do treinador." : result.summary
      };
      setMatchResult(finalResult);

      // UPDATE TABLE LOGIC
      setLeagueTable(prevTable => {
          const newTable = [...prevTable];
          let userPoints = 0;

          // Update User Team Stats
          const userStats = newTable.find(t => t.id === userTeam?.id);
          if (userStats) {
              userStats.played += 1;
              userStats.gf += finalHomeScore;
              userStats.ga += finalAwayScore;
              if (finalWin) {
                  userStats.points += 3;
                  userStats.won += 1;
              } else if (finalDraw) {
                  userStats.points += 1;
                  userStats.drawn += 1;
              } else {
                  userStats.lost += 1;
              }
              userPoints = userStats.points;
          }

          // CHECK FOR CHAMPION (89 POINTS)
          if (userPoints >= 89) {
              const hasTrophy = trophies.some(t => t.competition === 'Brasileirão Série A' && t.year === 2024);
              if (!hasTrophy) {
                  const newTrophy: TrophyType = {
                      id: Math.random().toString(),
                      name: 'Campeão Brasileiro',
                      competition: 'Brasileirão Série A',
                      year: 2024
                  };
                  setTrophies(prev => [...prev, newTrophy]);
                  setTimeout(() => alert("PARABÉNS! VOCÊ É CAMPEÃO BRASILEIRO! O troféu está na sua galeria."), 500);
              }
          }

          // Update Opponent Stats
          const oppStats = newTable.find(t => t.id === opponent.id);
          if (oppStats) {
              oppStats.played += 1;
              oppStats.gf += finalAwayScore;
              oppStats.ga += finalHomeScore;
              if (finalAwayScore > finalHomeScore) {
                  oppStats.points += 3;
                  oppStats.won += 1;
              } else if (finalDraw) {
                  oppStats.points += 1;
                  oppStats.drawn += 1;
              } else {
                  oppStats.lost += 1;
              }
          }

          // SIMULATE ROUND FOR OTHER TEAMS
          const otherTeams = newTable.filter(t => t.id !== userTeam?.id && t.id !== opponent.id);
          for (let i = 0; i < otherTeams.length; i += 2) {
              if (i + 1 < otherTeams.length) {
                  const t1 = otherTeams[i];
                  const t2 = otherTeams[i+1];
                  const score1 = Math.floor(Math.random() * 4);
                  const score2 = Math.floor(Math.random() * 4);
                  t1.played += 1; t2.played += 1;
                  t1.gf += score1; t1.ga += score2;
                  t2.gf += score2; t2.ga += score1;
                  if (score1 > score2) { t1.points += 3; t1.won += 1; t2.lost += 1; }
                  else if (score2 > score1) { t2.points += 3; t2.won += 1; t1.lost += 1; }
                  else { t1.points += 1; t1.drawn += 1; t2.points += 1; t2.drawn += 1; }
              }
          }

          return newTable.sort((a, b) => {
              if (b.points !== a.points) return b.points - a.points;
              if (b.won !== a.won) return b.won - a.won;
              const gdA = a.gf - a.ga;
              const gdB = b.gf - b.ga;
              return gdB - gdA;
          });
      });

      if (finalWin) setBudget(prev => prev + 2.5);
      if (finalDraw) setBudget(prev => prev + 1.0);
  };

  const updatePlayerName = (id: string, newName: string) => {
      setSquad(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const updateTeamName = (newName: string) => {
      if (userTeam) {
          setUserTeam({ ...userTeam, name: newName });
          setLeagueTable(prev => prev.map(t => t.id === userTeam.id ? { ...t, name: newName } : t));
      }
  };

  // Helper to check if we are in a career specific view that shouldn't show main selection
  const isCareerView = view === 'career-intro' || view === 'career-hub';

  if (!isCareerView && (view === 'select-team' || !userTeam)) {
    return <TeamSelection onSelect={handleTeamSelect} />;
  }

  const avgRating = (squad.reduce((acc, p) => acc + p.rating, 0) / (squad.length || 1)).toFixed(0);

  return (
    <div className={`flex flex-col lg:flex-row min-h-screen bg-slate-50 relative ${isCareerView ? 'overflow-hidden' : ''}`}>
      
      {/* SELL MODAL */}
      {sellingPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
              <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
                  <div className="bg-emerald-600 p-4 text-white">
                      <h3 className="font-bold text-lg">Propostas por {sellingPlayer.name}</h3>
                      <p className="text-emerald-100 text-sm">Valor de Mercado: ${sellingPlayer.value.toFixed(1)}M</p>
                  </div>
                  <div className="p-6 space-y-4">
                      <p className="text-slate-600 text-sm mb-2">Selecione a melhor oferta para fechar negócio:</p>
                      {offers.map((offer, idx) => (
                          <button 
                              key={idx}
                              onClick={() => handleConfirmSell(offer)}
                              className="w-full flex justify-between items-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                          >
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 text-xs">
                                      {offer.team.substring(0, 3).toUpperCase()}
                                  </div>
                                  <span className="font-bold text-slate-800">{offer.team}</span>
                              </div>
                              <span className="font-bold text-emerald-600 group-hover:scale-110 transition-transform">
                                  $ {offer.value.toFixed(1)}M
                              </span>
                          </button>
                      ))}
                  </div>
                  <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
                      <button 
                          onClick={() => { setSellingPlayer(null); setOffers([]); }}
                          className="text-slate-500 hover:text-slate-700 font-medium text-sm"
                      >
                          Cancelar Negociação
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* LOAN MODAL */}
      {loaningPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
              <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
                  <div className="bg-blue-600 p-4 text-white">
                      <h3 className="font-bold text-lg">Empréstimo: {loaningPlayer.name}</h3>
                      <p className="text-blue-100 text-sm">Escolha o destino do jogador</p>
                  </div>
                  <div className="p-6 space-y-4">
                      <p className="text-slate-600 text-sm mb-2">Clubes interessados:</p>
                      {loanOffers.map((offer, idx) => (
                          <button 
                              key={idx}
                              onClick={() => handleConfirmLoan(offer)}
                              className="w-full flex justify-between items-center p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                          >
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 text-xs">
                                      {offer.team.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div className="text-left">
                                      <span className="block font-bold text-slate-800">{offer.team}</span>
                                      <span className="text-[10px] text-slate-500">Liga Secundária</span>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <span className="block text-[10px] text-slate-500 uppercase">Taxa</span>
                                  <span className="font-bold text-blue-600 group-hover:scale-110 transition-transform">
                                      $ {offer.value.toFixed(1)}M
                                  </span>
                              </div>
                          </button>
                      ))}
                  </div>
                  <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
                      <button 
                          onClick={() => { setLoaningPlayer(null); setLoanOffers([]); }}
                          className="text-slate-500 hover:text-slate-700 font-medium text-sm"
                      >
                          Cancelar Empréstimo
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* BUY NEGOTIATION MODAL */}
      {negotiationPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
              <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
                  <div className="bg-emerald-700 p-4 text-white flex justify-between items-center">
                      <div>
                          <h3 className="font-bold text-lg">Negociar Contrato</h3>
                          <p className="text-emerald-100 text-xs uppercase tracking-wide">{negotiationPlayer.name}</p>
                      </div>
                      <Handshake size={28} className="text-emerald-200" />
                  </div>
                  
                  <div className="p-6 space-y-6">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                           <span className="text-sm text-slate-500 font-medium">Taxa de Transferência</span>
                           <span className="text-lg font-bold text-emerald-600">$ {negotiationPlayer.value.toFixed(1)}M</span>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                              Salário Semanal ($ mil)
                          </label>
                          <div className="flex items-center gap-4">
                              <input 
                                  type="range" 
                                  min="10" 
                                  max="500" 
                                  step="5"
                                  value={negotiationOffer.salary}
                                  onChange={(e) => setNegotiationOffer(prev => ({...prev, salary: parseInt(e.target.value)}))}
                                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                              />
                              <div className="bg-white border border-slate-300 w-24 text-center py-2 rounded-lg font-bold text-slate-800">
                                  ${negotiationOffer.salary}k
                              </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                              Duração do Contrato (Semanas)
                          </label>
                          <div className="flex items-center gap-4">
                              <input 
                                  type="range" 
                                  min="10" 
                                  max="156" 
                                  step="2"
                                  value={negotiationOffer.weeks}
                                  onChange={(e) => setNegotiationOffer(prev => ({...prev, weeks: parseInt(e.target.value)}))}
                                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                              />
                              <div className="bg-white border border-slate-300 w-24 text-center py-2 rounded-lg font-bold text-slate-800">
                                  {negotiationOffer.weeks}
                              </div>
                          </div>
                      </div>
                      
                      <div className="pt-2">
                           <button 
                              onClick={handleConfirmPurchase}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
                           >
                               <CheckCircle size={20} />
                               Assinar Contrato
                           </button>
                      </div>
                  </div>

                  <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
                      <button 
                          onClick={() => setNegotiationPlayer(null)}
                          className="text-slate-500 hover:text-slate-700 font-medium text-sm"
                      >
                          Cancelar
                      </button>
                  </div>
              </div>
          </div>
      )}

      {!isCareerView && (
          <Sidebar 
            currentView={view} 
            onChangeView={setView} 
            team={userTeam} 
          />
      )}
      
      <main className={`flex-1 p-4 pb-24 lg:p-8 overflow-y-auto h-screen scroll-smooth ${isCareerView ? 'bg-slate-900 text-white flex items-center justify-center' : ''}`}>
        
        {!isCareerView && view !== 'social' && (
            <div className="flex flex-row overflow-x-auto md:grid md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 pb-2 md:pb-0 snap-x snap-mandatory no-scrollbar">
                <StatsCard 
                    title="Orçamento" 
                    value={`$ ${budget.toFixed(1)} M`} 
                    icon={<DollarSign size={20} className="text-emerald-600" />} 
                    colorClass="border-emerald-500"
                    bgClass="bg-emerald-100"
                />
                <StatsCard 
                    title="Jogadores" 
                    value={squad.length} 
                    icon={<Users size={20} className="text-blue-600" />} 
                    colorClass="border-blue-500"
                    bgClass="bg-blue-100"
                />
                <StatsCard 
                    title="Média OVR" 
                    value={avgRating} 
                    icon={<Activity size={20} className="text-purple-600" />} 
                    colorClass="border-purple-500"
                    bgClass="bg-purple-100"
                />
                 <StatsCard 
                    title="Semana" 
                    value={week} 
                    icon={<Calendar size={20} className="text-amber-600" />} 
                    colorClass="border-amber-500"
                    bgClass="bg-amber-100"
                />
            </div>
        )}

        {/* Views Content */}
        
        {view === 'dashboard' && userTeam && (
            <div className="space-y-6 animate-fade-in">
                
                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <button 
                        onClick={handleSkipWeek}
                        className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors shadow-sm group text-center"
                    >
                        <div className="p-3 bg-slate-100 rounded-full text-slate-600 group-hover:bg-slate-200 transition-colors">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">Pular Semana</h3>
                            <p className="text-[10px] text-slate-500">Atualiza contratos</p>
                        </div>
                    </button>

                    <button 
                        onClick={handleStartCareer}
                        className="bg-white hover:bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors shadow-sm group text-center"
                    >
                         <div className="p-3 bg-amber-100 rounded-full text-amber-600 group-hover:scale-110 transition-transform">
                            <Medal size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900 text-sm">Rumo ao Estrelato</h3>
                            <p className="text-[10px] text-amber-700">Modo Carreira Jogador</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => setView('social')}
                        className="bg-white hover:bg-pink-50 border border-pink-200 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors shadow-sm group text-center"
                    >
                        <div className="p-3 bg-pink-100 rounded-full text-pink-600 group-hover:scale-110 transition-transform">
                            <Smartphone size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-pink-900 text-sm">Rede Social</h3>
                            <p className="text-[10px] text-pink-700">BrazucaGram</p>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => setView('trophies')}
                        className="bg-white hover:bg-purple-50 border border-purple-200 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors shadow-sm group text-center"
                    >
                        <div className="p-3 bg-purple-100 rounded-full text-purple-600 group-hover:scale-110 transition-transform">
                            <Award size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-purple-900 text-sm">Troféus</h3>
                            <p className="text-[10px] text-purple-700">Ver conquistas</p>
                        </div>
                    </button>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-6 text-white shadow-lg flex items-center justify-between">
                     <div>
                         <h2 className="text-2xl font-bold mb-1">Dia de Jogo</h2>
                         <p className="text-indigo-100 text-sm">Prepare seu time para o próximo desafio.</p>
                     </div>
                     <button 
                        onClick={() => setView('match')}
                        className="bg-white text-indigo-600 font-bold py-3 px-6 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-lg"
                    >
                        <PlayCircle size={20} />
                        Jogar
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    <Card title="Classificação Rápida">
                        <div className="space-y-2">
                             {leagueTable.slice(0, 5).map((t, i) => (
                                 <div key={t.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                     <div className="flex items-center gap-2">
                                         <span className="font-bold text-slate-400 w-4">{i + 1}</span>
                                         <span className={`text-sm font-medium ${t.id === userTeam.id ? 'text-emerald-600 font-bold' : ''}`}>{t.name}</span>
                                     </div>
                                     <span className="font-bold text-sm">{t.points} pts</span>
                                 </div>
                             ))}
                             <button onClick={() => setView('standings')} className="w-full text-center text-xs text-blue-600 hover:underline mt-2">Ver tabela completa</button>
                        </div>
                    </Card>
                    
                    <button 
                        onClick={() => setView('settings')}
                        className="bg-white hover:bg-slate-50 border border-slate-200 p-6 rounded-xl flex items-center justify-between transition-colors shadow-sm group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-slate-100 rounded-full text-slate-600 group-hover:scale-110 transition-transform">
                                <Settings size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-slate-800">Ajustes do Clube</h3>
                                <p className="text-xs text-slate-500">Editar nome, cores e elenco</p>
                            </div>
                        </div>
                        <MoveRight size={20} className="text-slate-400 group-hover:text-slate-600" />
                    </button>
                </div>
            </div>
        )}

        {/* CAREER MODE: INTRO / CREATION / OFFERS */}
        {view === 'career-intro' && (
            <div className="w-full max-w-2xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 animate-fade-in">
                {!loading && careerOffers.length === 0 && (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Inicie sua Lenda</h2>
                            <p className="text-slate-400">Crie seu jogador e prove seu valor na peneira.</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Nome do Atleta</label>
                                <input 
                                    type="text" 
                                    value={careerTempName}
                                    onChange={(e) => setCareerTempName(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors"
                                    placeholder="Ex: Ronaldinho Jr."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Posição Preferida</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[Position.ATT, Position.MID, Position.DEF, Position.GK].map(pos => (
                                        <button
                                            key={pos}
                                            onClick={() => setCareerTempPos(pos)}
                                            className={`p-3 rounded-lg border font-medium transition-all ${careerTempPos === pos ? 'bg-amber-500 border-amber-500 text-black' : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'}`}
                                        >
                                            {pos}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handlePlayAmateurMatch}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-4 rounded-xl text-lg shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02]"
                            >
                                Jogar Partida da Peneira
                            </button>
                             <button 
                                onClick={() => setView('dashboard')}
                                className="w-full text-slate-500 hover:text-white py-2 text-sm font-medium"
                            >
                                Cancelar e Voltar
                            </button>
                        </div>
                    </>
                )}

                {loading && (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-500 mx-auto mb-6"></div>
                        <h3 className="text-2xl font-bold text-white mb-2">Jogando Partida Amadora...</h3>
                        <p className="text-slate-400">Os olheiros estão observando seu desempenho.</p>
                    </div>
                )}

                {!loading && careerOffers.length > 0 && (
                    <div className="animate-fade-in">
                         <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center p-3 bg-green-500/20 text-green-400 rounded-full mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Aprovado!</h2>
                            <p className="text-slate-400">Você impressionou. Escolha seu primeiro clube profissional.</p>
                        </div>

                        <div className="space-y-4">
                            {careerOffers.map((offer, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleAcceptCareerOffer(offer)}
                                    className={`w-full bg-white text-slate-900 p-4 rounded-xl flex items-center justify-between group hover:bg-amber-50 transition-colors border-l-8 ${offer.color === 'bg-blue-600' ? 'border-blue-600' : offer.color === 'bg-red-600' ? 'border-red-600' : 'border-amber-500'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full ${offer.color} text-white flex items-center justify-center font-bold shadow-md`}>
                                            {offer.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="text-left">
                                            <span className="block font-bold text-lg">{offer.name}</span>
                                            <span className="text-sm text-slate-500">Contrato Profissional</span>
                                        </div>
                                    </div>
                                    <MoveRight className="text-slate-400 group-hover:text-slate-800" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* CAREER MODE: HUB (80 Matches) */}
        {view === 'career-hub' && careerData && (
            <div className="w-full max-w-4xl mx-auto animate-fade-in space-y-6">
                
                <div className="flex items-center justify-between bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full ${careerData.teamColor} flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-lg`}>
                            {careerData.teamName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{careerData.playerName}</h2>
                            <p className="text-slate-400">{careerData.position} • {careerData.teamName}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-amber-400">{careerData.rating}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">OVR</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
                        <TrendingUp className="text-emerald-400 mb-2" size={24} />
                        <span className="text-2xl font-bold text-white">{careerData.goals}</span>
                        <span className="text-xs text-slate-500 uppercase">Gols Marcados</span>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
                        <Users className="text-blue-400 mb-2" size={24} />
                        <span className="text-2xl font-bold text-white">{careerData.assists}</span>
                        <span className="text-xs text-slate-500 uppercase">Assistências</span>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
                        <div className="text-amber-500 mb-2 font-bold text-lg">
                             {careerData.matchesPlayed} / 80
                        </div>
                        <span className="text-xs text-slate-500 uppercase">Jogos na Temporada</span>
                        <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                            <div 
                                className="bg-amber-500 h-full transition-all duration-500" 
                                style={{ width: `${(careerData.matchesPlayed / 80) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {careerData.matchesPlayed < 80 ? (
                    <button 
                        onClick={handlePlayCareerMatch}
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-6 rounded-2xl text-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                Jogando...
                            </>
                        ) : (
                            <>
                                <PlayCircle size={28} />
                                Jogar Próxima Partida
                            </>
                        )}
                    </button>
                ) : (
                     <div className="bg-amber-500 text-black p-8 rounded-2xl text-center">
                        <h2 className="text-3xl font-bold mb-2">Temporada Encerrada!</h2>
                        <p className="mb-6 font-medium">Você completou os 80 jogos. Que carreira incrível!</p>
                        <button 
                            onClick={() => setView('dashboard')}
                            className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800"
                        >
                            Voltar ao Menu Principal
                        </button>
                    </div>
                )}

                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Histórico Recente</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {careerData.history.length === 0 ? (
                            <p className="text-slate-500 text-center py-4">Nenhuma partida jogada ainda.</p>
                        ) : (
                            careerData.history.map((log, i) => (
                                <div key={i} className="p-3 bg-slate-700/50 rounded-lg text-slate-300 text-sm border-l-2 border-slate-600">
                                    <span className="font-bold text-slate-500 mr-2">Jogo {careerData.matchesPlayed - i}</span>
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>
                
                <button 
                    onClick={() => setView('dashboard')}
                    className="w-full text-slate-500 hover:text-white py-4 text-sm font-medium"
                >
                    Sair do Modo Carreira
                </button>
            </div>
        )}

        {view === 'social' && (
            <div className="animate-fade-in max-w-2xl mx-auto">
                 <div className="flex items-center gap-2 mb-6 sticky top-0 bg-slate-50 z-40 py-2">
                    <button 
                        onClick={() => setView('dashboard')}
                        className="p-2 hover:bg-slate-200 rounded-full text-slate-700 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Smartphone size={28} className="text-pink-600" />
                        BrazucaGram
                    </h2>
                 </div>
                 
                 <div className="space-y-6">
                    {socialPosts.map((post) => (
                        <div key={post.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            {/* Header */}
                            <div className="p-3 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold text-xs">
                                    {post.authorName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 leading-none">{post.authorName}</p>
                                    {post.teamName && <p className="text-[10px] text-slate-500">{post.teamName}</p>}
                                </div>
                                <span className="ml-auto text-xs text-slate-400">{post.timeAgo}</span>
                            </div>
                            
                            {/* Toggle Photo Visibility */}
                            <div className="px-3 pb-2 flex justify-end">
                                <button 
                                    onClick={() => togglePostImage(post.id)}
                                    className="text-xs text-slate-500 flex items-center gap-1 hover:text-slate-800"
                                >
                                    {expandedPostIds.has(post.id) ? (
                                        <><EyeOff size={14} /> Ocultar Foto</>
                                    ) : (
                                        <><Eye size={14} /> Ver Foto</>
                                    )}
                                </button>
                            </div>

                            {/* Fake Photo (Conditional) */}
                            {expandedPostIds.has(post.id) && (
                                <div className={`aspect-square w-full flex items-center justify-center relative animate-fade-in
                                    ${post.imageType === 'training' ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 
                                      post.imageType === 'match' ? 'bg-gradient-to-br from-blue-500 to-indigo-700' :
                                      post.imageType === 'leisure' ? 'bg-gradient-to-br from-amber-300 to-orange-500' :
                                      'bg-gradient-to-br from-purple-500 to-pink-600'
                                    }
                                `}>
                                    <div className="text-white opacity-80 transform scale-150">
                                        {post.imageType === 'training' && <Dumbbell size={48} />}
                                        {post.imageType === 'match' && <Trophy size={48} />}
                                        {post.imageType === 'leisure' && <Coffee size={48} />}
                                        {post.imageType === 'celebration' && <Star size={48} />}
                                    </div>
                                    
                                    {/* Photo Tag/Overlay */}
                                    <div className="absolute bottom-3 right-3 bg-black/30 backdrop-blur-md px-2 py-1 rounded text-white text-[10px] font-bold flex items-center gap-1">
                                        <Camera size={10} /> 
                                        {post.imageType === 'training' ? 'CT do Clube' : 
                                         post.imageType === 'match' ? 'Dia de Jogo' : 
                                         'Lifestyle'}
                                    </div>
                                </div>
                            )}

                            {/* Actions & Content */}
                            <div className="p-3">
                                <div className="flex gap-4 mb-2">
                                    <button 
                                        onClick={() => handleLikePost(post.id)}
                                        className={`transition-transform active:scale-125 ${post.isLiked ? 'text-red-500' : 'text-slate-800 hover:text-slate-600'}`}
                                    >
                                        <Heart size={24} fill={post.isLiked ? "currentColor" : "none"} />
                                    </button>
                                    <button className="text-slate-800 hover:text-slate-600">
                                        <MessageCircle size={24} />
                                    </button>
                                </div>
                                
                                <p className="text-sm font-bold text-slate-800 mb-1">{post.likes} curtidas</p>
                                
                                <div className="text-sm text-slate-700 mb-2">
                                    <span className="font-bold mr-2">{post.authorName}</span>
                                    {post.content}
                                </div>

                                {/* Comments */}
                                {post.comments.length > 0 && (
                                    <div className="mb-2 space-y-1">
                                        {post.comments.map(c => (
                                            <p key={c.id} className="text-xs text-slate-600">
                                                <span className="font-bold text-slate-800 mr-1">{c.author}</span>
                                                {c.text}
                                            </p>
                                        ))}
                                    </div>
                                )}

                                {/* Add Comment Input */}
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                                    <input 
                                        type="text" 
                                        placeholder="Adicione um comentário..."
                                        value={commentInputs[post.id] || ""}
                                        onChange={(e) => setCommentInputs(prev => ({...prev, [post.id]: e.target.value}))}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCommentPost(post.id)}
                                        className="flex-1 text-xs outline-none bg-transparent"
                                    />
                                    <button 
                                        onClick={() => handleCommentPost(post.id)}
                                        className="text-blue-500 text-xs font-bold disabled:opacity-50"
                                        disabled={!commentInputs[post.id]}
                                    >
                                        Publicar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="h-20"></div>
                 </div>
            </div>
        )}

        {view === 'standings' && (
            <div className="animate-fade-in">
                <Card title="Tabela de Classificação">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">Time</th>
                                    <th className="px-4 py-3 text-center">PTS</th>
                                    <th className="px-4 py-3 text-center hidden md:table-cell">J</th>
                                    <th className="px-4 py-3 text-center hidden md:table-cell">V</th>
                                    <th className="px-4 py-3 text-center hidden md:table-cell">E</th>
                                    <th className="px-4 py-3 text-center hidden md:table-cell">D</th>
                                    <th className="px-4 py-3 text-center hidden sm:table-cell">GP</th>
                                    <th className="px-4 py-3 text-center hidden sm:table-cell">GC</th>
                                    <th className="px-4 py-3 text-center hidden sm:table-cell">SG</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leagueTable.map((team, index) => (
                                    <tr 
                                        key={team.id} 
                                        className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${team.id === userTeam?.id ? 'bg-emerald-50 hover:bg-emerald-100' : ''}`}
                                    >
                                        <td className="px-4 py-3 font-medium text-slate-400">
                                            {index < 4 ? <span className="text-blue-500 font-bold">{index + 1}</span> : 
                                             index >= leagueTable.length - 4 ? <span className="text-red-500 font-bold">{index + 1}</span> : 
                                             index + 1}
                                        </td>
                                        <td className={`px-4 py-3 font-medium ${team.id === userTeam?.id ? 'text-emerald-700 font-bold' : 'text-slate-800'}`}>
                                            {team.name}
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-slate-800">{team.points}</td>
                                        <td className="px-4 py-3 text-center hidden md:table-cell">{team.played}</td>
                                        <td className="px-4 py-3 text-center hidden md:table-cell text-emerald-600">{team.won}</td>
                                        <td className="px-4 py-3 text-center hidden md:table-cell text-amber-600">{team.drawn}</td>
                                        <td className="px-4 py-3 text-center hidden md:table-cell text-red-600">{team.lost}</td>
                                        <td className="px-4 py-3 text-center hidden sm:table-cell">{team.gf}</td>
                                        <td className="px-4 py-3 text-center hidden sm:table-cell">{team.ga}</td>
                                        <td className="px-4 py-3 text-center hidden sm:table-cell font-bold">{team.gf - team.ga}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        )}

        {view === 'squad' && (
             <div className="animate-fade-in space-y-6">
                 <Card 
                    title="Elenco Atual" 
                    action={
                        <div className="text-xs text-slate-500 font-normal">
                            Média Geral: <strong className="text-slate-800">{avgRating}</strong>
                        </div>
                    }
                 >
                    <div className="space-y-1">
                        <div className="bg-slate-50 p-2 rounded text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 grid grid-cols-[1fr_auto] gap-4">
                             <span>Jogador</span>
                             <div className="flex gap-6 mr-16">
                                 <span className="hidden sm:inline w-20 text-center">Contrato</span>
                                 <span className="w-[30px] text-center">OVR</span>
                                 <span className="w-16 md:w-24 text-right">Valor</span>
                             </div>
                        </div>
                        {squad.sort((a, b) => b.rating - a.rating).map((player) => (
                            <PlayerRow 
                                key={player.id} 
                                player={player} 
                                showPrice={true}
                                onSell={handleInitiateSell}
                                onLoan={handleInitiateLoan}
                                onRenew={handleRenew}
                            />
                        ))}
                    </div>
                 </Card>
             </div>
        )}

        {view === 'market' && (
             <div className="animate-fade-in space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Mercado da Bola</h2>
                    <button 
                        onClick={() => {
                            setMarket([]);
                            generateTransferMarket().then(setMarket);
                        }}
                        className="text-sm text-emerald-600 hover:underline"
                    >
                        Atualizar Lista
                    </button>
                 </div>

                 <Card>
                    <div className="space-y-1">
                        {market.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                Buscando jogadores disponíveis...
                            </div>
                        ) : (
                            market.map((player) => (
                                <PlayerRow 
                                    key={player.id} 
                                    player={player} 
                                    showPrice={true}
                                    actionButton={
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleLoanIn(player)}
                                                className="bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1.5 rounded text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm"
                                                title="Empréstimo (12 sem.)"
                                            >
                                                Emp. (12 sem.)
                                            </button>
                                            <button 
                                                onClick={() => handleOpenNegotiation(player)}
                                                className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs md:text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                                            >
                                                Comprar
                                            </button>
                                        </div>
                                    }
                                />
                            ))
                        )}
                    </div>
                 </Card>
             </div>
        )}

        {view === 'trophies' && (
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Sala de Troféus</h2>
                    <div className="text-sm text-slate-500">{trophies.length} Conquistas</div>
                </div>
                
                {trophies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                        <div className="bg-slate-100 p-4 rounded-full mb-4 opacity-50">
                            <Award size={48} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-600 mb-1">Nenhum troféu ainda</h3>
                        <p className="text-slate-400 text-sm text-center max-w-xs">Vença o campeonato atingindo 89 pontos para começar sua coleção.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {trophies.map((trophy) => (
                            <div key={trophy.id} className="bg-white p-6 rounded-xl shadow-sm border border-amber-100 flex flex-col items-center text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-amber-400"></div>
                                <div className="p-4 bg-amber-50 rounded-full mb-4 text-amber-500">
                                    <Trophy size={32} fill="#fbbf24" />
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1">{trophy.name}</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{trophy.competition}</p>
                                <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">{trophy.year}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {view === 'settings' && userTeam && (
            <div className="animate-fade-in max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Settings className="text-slate-400" />
                    Configurações do Clube
                </h2>

                <div className="space-y-8">
                    {/* Team Settings */}
                    <Card title="Detalhes do Time">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Clube</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={userTeam.name} 
                                        onChange={(e) => updateTeamName(e.target.value)}
                                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Isso alterará o nome do time na tabela e nos placares.</p>
                            </div>
                        </div>
                    </Card>

                    {/* Player Editor */}
                    <Card title="Editar Elenco">
                        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-2">
                            {squad.sort((a,b) => b.rating - a.rating).map((player) => (
                                <div key={player.id} className="py-3 flex items-center gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs text-slate-500 block mb-1">Nome do Jogador ({player.position})</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="text" 
                                                value={player.name} 
                                                onChange={(e) => updatePlayerName(player.id, e.target.value)}
                                                className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm focus:border-emerald-500 outline-none"
                                            />
                                            <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{player.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        )}

        {view === 'match' && userTeam && (
            <div className="max-w-4xl mx-auto animate-fade-in">
                {!isSimulating && !matchResult && !isVisualMatch && (
                    <div className="text-center py-12 md:py-20">
                        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-slate-100">
                            <Trophy size={48} className="md:w-16 md:h-16 text-yellow-500 mx-auto mb-6" />
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Dia de Jogo</h2>
                            <p className="text-slate-500 mb-8 text-sm md:text-base">Escolha como deseja acompanhar a partida.</p>
                            
                            <div className="flex flex-col md:flex-row gap-4 justify-center">
                                <button 
                                    onClick={() => prepareMatch(false)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Zap size={20} />
                                    Simulação Rápida
                                </button>
                                <button 
                                    onClick={() => prepareMatch(true)}
                                    className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-lg px-10 py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    <MonitorPlay size={24} />
                                    Assistir Partida 2D
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isVisualMatch && userTeam && currentOpponent && (
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl text-white">
                            <div className="p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${userTeam.primaryColor} ${userTeam.secondaryColor}`}>
                                        {userTeam.name.substring(0, 2)}
                                    </div>
                                    <span className="font-bold text-xl">{currentScore.home}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-800 px-3 py-1 rounded text-xs font-mono text-emerald-400 animate-pulse">
                                        {isHalftime ? "INTERVALO" : "AO VIVO"}
                                    </div>
                                    <button 
                                        onClick={() => setSoundEnabled(!soundEnabled)}
                                        className="p-2 hover:bg-slate-700 rounded-full transition-colors"
                                        title={soundEnabled ? "Desativar Som" : "Ativar Som"}
                                    >
                                        {soundEnabled ? <Volume2 size={18} className="text-slate-300" /> : <VolumeX size={18} className="text-slate-500" />}
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-xl">{currentScore.away}</span>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentOpponent.primaryColor} ${currentOpponent.secondaryColor}`}>
                                        {currentOpponent.name.substring(0, 2)}
                                    </div>
                                </div>
                            </div>
                            
                            {/* 2D Field */}
                            <div className="relative">
                                <SoccerField 
                                    homeTeam={userTeam}
                                    awayTeam={currentOpponent}
                                    gameTime={simTime}
                                    ballPos={ballPosition}
                                    homePositions={homePlayerPos}
                                    awayPositions={awayPlayerPos}
                                />

                                {/* Halftime Overlay */}
                                {isHalftime && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                                        <h2 className="text-3xl font-bold text-white mb-2">INTERVALO</h2>
                                        <p className="text-slate-300 mb-6">Fim do 1º Tempo</p>
                                        <button 
                                            onClick={startSecondHalf}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg"
                                        >
                                            Iniciar 2º Tempo
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* TACTIC CONTROLS (MOVED BELOW FIELD) */}
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            <button 
                                onClick={() => setCurrentTactic('balanced')}
                                className={`px-4 py-3 rounded-xl font-bold border transition-all flex-1 md:flex-none min-w-[100px] text-center ${currentTactic === 'balanced' ? 'bg-white text-slate-900 border-slate-300 shadow-md scale-105' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
                            >
                                Equilibrado
                            </button>
                            <button 
                                onClick={() => setCurrentTactic('offensive')}
                                className={`px-4 py-3 rounded-xl font-bold border transition-all flex-1 md:flex-none min-w-[100px] flex items-center justify-center gap-2 ${currentTactic === 'offensive' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
                            >
                                <Sword size={16} /> Ofensivo
                            </button>
                            <button 
                                onClick={() => setCurrentTactic('defensive')}
                                className={`px-4 py-3 rounded-xl font-bold border transition-all flex-1 md:flex-none min-w-[100px] flex items-center justify-center gap-2 ${currentTactic === 'defensive' ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                            >
                                <Shield size={16} /> Defensivo
                            </button>
                            <button 
                                onClick={() => setCurrentTactic('counter')}
                                className={`px-4 py-3 rounded-xl font-bold border transition-all flex-1 md:flex-none min-w-[100px] flex items-center justify-center gap-2 ${currentTactic === 'counter' ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-105' : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50'}`}
                            >
                                <MoveRight size={16} /> Contra-Ataque
                            </button>
                        </div>
                        
                        <div className="text-center text-slate-500 text-xs mt-2">
                            Estratégia Atual: <span className="font-bold text-slate-700 uppercase">
                                {currentTactic === 'balanced' && "Equilibrada"}
                                {currentTactic === 'offensive' && "Pressão Alta"}
                                {currentTactic === 'defensive' && "Retranca"}
                                {currentTactic === 'counter' && "Contra-Ataque Rápido"}
                            </span>
                        </div>
                    </div>
                )}

                {isSimulating && !isVisualMatch && (
                    <div className="text-center py-32">
                         <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-6"></div>
                         <h3 className="text-xl font-bold text-slate-700">Calculando Resultado...</h3>
                         {preparingVisualMatch && <p className="text-xs text-emerald-600 mt-2 font-medium">Som da torcida ativado</p>}
                    </div>
                )}

                {matchResult && !isSimulating && !isVisualMatch && (
                    <div className="space-y-6">
                        {/* Scoreboard */}
                        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl text-white">
                            <div className="p-6 md:p-8 flex justify-between items-center relative">
                                <div className="text-center w-1/3">
                                    <h3 className="text-sm md:text-2xl font-bold mb-1 md:mb-2 truncate">{userTeam.name}</h3>
                                    <div className={`text-3xl md:text-6xl font-bold ${matchResult.win ? 'text-emerald-400' : ''}`}>
                                        {matchResult.homeScore}
                                    </div>
                                </div>
                                <div className="text-slate-500 font-mono text-xs md:text-sm uppercase tracking-widest">Final</div>
                                <div className="text-center w-1/3">
                                    <h3 className="text-sm md:text-2xl font-bold mb-1 md:mb-2 truncate">{matchResult.opponentName}</h3>
                                    <div className="text-3xl md:text-6xl font-bold">
                                        {matchResult.awayScore}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-800 p-4 text-center border-t border-slate-700">
                                <p className="text-slate-300 text-sm md:text-base italic">"{matchResult.summary}"</p>
                            </div>
                        </div>

                        {/* Events Timeline */}
                        <Card title="Lances da Partida">
                            <div className="space-y-4">
                                {matchResult.events.map((event, idx) => (
                                    <div key={idx} className={`flex items-start gap-3 md:gap-4 ${event.team === 'away' ? 'flex-row-reverse text-right' : ''}`}>
                                        <div className="w-10 md:w-12 flex-shrink-0 text-center pt-1">
                                            <span className="font-mono font-bold text-slate-400 text-sm">{event.minute}'</span>
                                        </div>
                                        <div className={`flex-1 p-3 rounded-lg text-sm md:text-base ${
                                            event.type === 'goal' ? 'bg-emerald-50 border border-emerald-100' : 
                                            event.type === 'card' ? 'bg-yellow-50 border border-yellow-100' : 
                                            'bg-slate-50'
                                        }`}>
                                            <div className={`flex items-center gap-2 mb-1 ${event.team === 'away' ? 'justify-end' : ''}`}>
                                                {event.type === 'goal' && "⚽ GOL"}
                                                {event.type === 'card' && "🟨 Cartão"}
                                                {event.type === 'substitution' && "🔄 Troca"}
                                            </div>
                                            <p className="text-slate-800 font-medium leading-tight">{event.description}</p>
                                        </div>
                                    </div>
                                ))}
                                {matchResult.events.length === 0 && (
                                    <p className="text-center text-slate-400 py-4">Jogo truncado, poucas chances claras.</p>
                                )}
                            </div>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                             <button 
                                onClick={() => setView('standings')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <ListOrdered size={20} />
                                Ver Tabela
                            </button>
                            <button 
                                onClick={() => setMatchResult(null)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-4 rounded-xl transition-colors"
                            >
                                Voltar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}

      </main>
      
      {/* Hide MobileNav in career mode */}
      {!isCareerView && (
          <MobileNav 
            currentView={view} 
            onChangeView={setView} 
            team={userTeam} 
          />
      )}
    </div>
  );
}
