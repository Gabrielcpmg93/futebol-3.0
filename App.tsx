
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
    X,
    User,
    Target,
    Footprints
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
        { id: 'social', label: 'Rede Social', icon: MessageCircle },
        { id: 'match', label: 'Jogar', icon: PlayCircle },
        { id: 'standings', label: 'Tabela', icon: ListOrdered },
        { id: 'squad', label: 'Elenco', icon: Users },
        { id: 'market', label: 'Transferências', icon: ArrowLeftRight },
        { id: 'trophies', label: 'Sala de Troféus', icon: Award },
        { id: 'career-intro', label: 'Rumo ao Estrelato', icon: Star },
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
                    const active = currentView === item.id || (item.id === 'career-intro' && currentView === 'career-hub');
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
        { id: 'social', label: 'Rede Social', icon: MessageCircle },
        { id: 'match', label: 'Jogar', icon: PlayCircle },
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
      
      // Generate random offers
      const potentialTeams = [...BRAZILIAN_TEAMS].sort(() => 0.5 - Math.random()).slice(0, 3);
      const newOffers = potentialTeams.map(t => ({
          name: t.name,
          color: t.primaryColor
      }));
      
      setCareerOffers(newOffers);
      setLoading(false);
  };

  const handleSelectOffer = (offer: {name: string, color: string}) => {
      const initialData: CareerData = {
          playerName: careerTempName,
          position: careerTempPos,
          teamName: offer.name,
          teamColor: offer.color,
          matchesPlayed: 0,
          goals: 0,
          assists: 0,
          rating: 70,
          history: [],
          cash: 500, // Initial R$
          inventory: [],
          season: 1,
          trophies: []
      };
      setCareerData(initialData);
      setView('career-hub');
  };

  const handleSimulateWeek = async () => {
      if (!careerData) return;
      setLoading(true);
      await new Promise(r => setTimeout(r, 1500));

      // Random Performance
      const performance = Math.floor(Math.random() * 10) + 1; // 1-10 rating
      const goalsScored = careerData.position === Position.ATT ? (performance > 7 ? Math.floor(Math.random() * 3) : 0) : (performance > 9 ? 1 : 0);
      const assistsMade = performance > 6 ? Math.floor(Math.random() * 2) : 0;
      const cashEarned = 200 + (goalsScored * 100) + (performance * 20);

      // Check for Transfer Offers (Random chance if performing well)
      if (performance >= 8 && Math.random() > 0.7) {
           const randomTeam = BRAZILIAN_TEAMS[Math.floor(Math.random() * BRAZILIAN_TEAMS.length)];
           if (randomTeam.name !== careerData.teamName) {
               setCareerTransferOffers(prev => [...prev, { name: randomTeam.name, color: randomTeam.primaryColor }]);
           }
      }

      // Check for Trophies (Simple logic: every 10 games played, get a "Season Best" etc just for demo)
      let newTrophies = [...careerData.trophies];
      if ((careerData.matchesPlayed + 1) % 10 === 0 && performance > 8) {
          newTrophies.push({
              name: "Craque da Rodada",
              season: careerData.season,
              description: "Foi o melhor em campo na décima partida."
          });
      }

      const newData: CareerData = {
          ...careerData,
          matchesPlayed: careerData.matchesPlayed + 1,
          goals: careerData.goals + goalsScored,
          assists: careerData.assists + assistsMade,
          rating: Math.min(99, careerData.rating + (performance > 7 ? 1 : 0)),
          history: [...careerData.history, `Jogo ${careerData.matchesPlayed + 1}: Nota ${performance} - ${goalsScored} Gols`],
          cash: careerData.cash + cashEarned,
          trophies: newTrophies
      };

      setCareerData(newData);
      setLoading(false);
  };

  // --- View Renderers ---

  const renderCareerIntro = () => (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
          {/* Background Ambience */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-800 via-slate-900 to-black"></div>
          
          <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row gap-8 items-center">
              
              {/* Left: Dynamic Player Card (FUT Style) */}
              <div className="hidden md:flex flex-col items-center animate-in slide-in-from-left duration-700">
                   <div className="w-72 h-[26rem] bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 rounded-t-3xl rounded-b-[3rem] border-4 border-yellow-100 shadow-2xl relative overflow-hidden flex flex-col">
                        {/* Card Content */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        
                        <div className="p-5 pt-8 flex flex-col h-full relative z-10 text-amber-950">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col items-center">
                                    <span className="text-4xl font-black leading-none">60</span>
                                    <span className="text-lg font-bold uppercase">{careerTempPos === Position.GK ? 'GOL' : careerTempPos === Position.DEF ? 'DEF' : careerTempPos === Position.MID ? 'MEI' : 'ATA'}</span>
                                </div>
                                <div className="w-8 h-5 bg-blue-700 rounded-sm border border-white opacity-80"></div> {/* Brazil Flag simplified */}
                            </div>

                            <div className="flex-1 flex items-center justify-center">
                                <User size={110} className="text-amber-900/80 drop-shadow-md" />
                            </div>

                            <div className="text-center pb-4">
                                <h2 className="text-2xl font-black uppercase tracking-tighter truncate mb-1">
                                    {careerTempName || "JOGADOR"}
                                </h2>
                                <div className="w-full h-0.5 bg-amber-900/30 mb-2"></div>
                                <div className="flex justify-center gap-3 text-xs font-black opacity-75">
                                     <span>PAC 65</span>
                                     <span>SHO 60</span>
                                     <span>PAS 62</span>
                                     <span>DRI 64</span>
                                </div>
                            </div>
                        </div>
                   </div>
                   <div className="mt-6 text-center">
                       <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">Sua Carta de Estreia</p>
                   </div>
              </div>

              {/* Right: Creation Form */}
              <div className="flex-1 w-full max-w-lg">
                  <div className="mb-6 flex items-center">
                      <button 
                          onClick={() => setView(userTeam ? 'dashboard' : 'select-team')}
                          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                      >
                          <ArrowLeft size={20} />
                          <span className="font-bold">Voltar</span>
                      </button>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
                      {!careerOffers.length ? (
                          <>
                              <div className="mb-8">
                                  <h2 className="text-3xl font-bold text-white mb-2">Crie sua Lenda</h2>
                                  <p className="text-slate-400">Defina sua identidade antes da peneira.</p>
                              </div>

                              <div className="space-y-6">
                                  <div>
                                      <label className="block text-xs font-bold text-emerald-400 uppercase mb-2">Nome do Craque</label>
                                      <input 
                                          type="text" 
                                          className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-lg"
                                          placeholder="Como serás chamado?"
                                          value={careerTempName}
                                          onChange={e => setCareerTempName(e.target.value)}
                                      />
                                  </div>

                                  <div>
                                      <label className="block text-xs font-bold text-emerald-400 uppercase mb-2">Posição Preferida</label>
                                      <div className="grid grid-cols-2 gap-3">
                                          {[
                                              { id: Position.ATT, label: 'Atacante', icon: Target },
                                              { id: Position.MID, label: 'Meio-Campo', icon: Activity },
                                              { id: Position.DEF, label: 'Defensor', icon: Shield },
                                              { id: Position.GK, label: 'Goleiro', icon: Handshake }
                                          ].map((pos) => (
                                              <button
                                                  key={pos.id}
                                                  onClick={() => setCareerTempPos(pos.id)}
                                                  className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${careerTempPos === pos.id ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/50' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                              >
                                                  <pos.icon size={20} />
                                                  <span className="font-bold text-sm">{pos.label}</span>
                                              </button>
                                          ))}
                                      </div>
                                  </div>

                                  <button 
                                      onClick={handlePlayAmateurMatch}
                                      disabled={loading}
                                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 mt-4 group"
                                  >
                                      {loading ? (
                                          <>
                                              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                              <span>Jogando Peneira...</span>
                                          </>
                                      ) : (
                                          <>
                                              <span>Entrar em Campo</span>
                                              <PlayCircle size={20} className="group-hover:scale-110 transition-transform" />
                                          </>
                                      )}
                                  </button>
                              </div>
                          </>
                      ) : (
                          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <div className="text-center mb-6">
                                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                                      <CheckCircle size={32} className="text-white" />
                                  </div>
                                  <h3 className="text-2xl font-bold text-white">Aprovado na Peneira!</h3>
                                  <p className="text-slate-400 mt-1">Esses clubes querem assinar com você.</p>
                              </div>
                              
                              <div className="space-y-3">
                                  {careerOffers.map((offer, idx) => (
                                      <button
                                          key={idx}
                                          onClick={() => handleSelectOffer(offer)}
                                          className={`w-full p-4 rounded-xl border-l-4 hover:translate-x-1 transition-all flex items-center justify-between group bg-white hover:bg-slate-50 border-transparent hover:border-l-emerald-500`}
                                      >
                                          <div className="flex items-center gap-4">
                                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${offer.color}`}>
                                                  {offer.name.substring(0, 2)}
                                              </div>
                                              <span className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{offer.name}</span>
                                          </div>
                                          <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase">
                                              Contrato
                                          </div>
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>
  );

  const renderCareerHub = () => {
      if (!careerData) return null;

      // Filter Trophies
      const filteredTrophies = trophyFilterSeason === 'all' 
          ? careerData.trophies 
          : careerData.trophies.filter(t => t.season === trophyFilterSeason);
      
      // Get unique seasons for filter
      const seasons = Array.from(new Set(careerData.trophies.map(t => t.season))).sort((a: number, b: number) => b - a);

      return (
          <div className="p-4 md:p-8 pb-24 space-y-6 bg-slate-50 min-h-screen">
              {/* Header Profile */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-6">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg ${careerData.teamColor}`}>
                      {careerData.teamName.substring(0, 2)}
                  </div>
                  <div className="text-center md:text-left flex-1">
                      <h2 className="text-2xl font-bold text-slate-800">{careerData.playerName}</h2>
                      <p className="text-slate-500 font-medium">{careerData.teamName} • {careerData.position}</p>
                      <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
                              <Star size={16} fill="currentColor" />
                              {careerData.rating} OVR
                          </div>
                          <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                              R$ {careerData.cash.toLocaleString()}
                          </div>
                      </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center w-full md:w-auto">
                      <div>
                          <p className="text-xs text-slate-500 uppercase font-bold">Jogos</p>
                          <p className="text-xl font-bold text-slate-800">{careerData.matchesPlayed}</p>
                      </div>
                      <div>
                          <p className="text-xs text-slate-500 uppercase font-bold">Gols</p>
                          <p className="text-xl font-bold text-slate-800">{careerData.goals}</p>
                      </div>
                      <div>
                          <p className="text-xs text-slate-500 uppercase font-bold">Assist.</p>
                          <p className="text-xl font-bold text-slate-800">{careerData.assists}</p>
                      </div>
                  </div>
              </div>

              {/* Main Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <button 
                      onClick={handleSimulateWeek}
                      disabled={loading}
                      className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-between"
                   >
                       <div>
                           <p className="text-indigo-200 font-medium mb-1">Próxima Partida</p>
                           <h3 className="text-2xl font-bold">Jogar Semana {careerData.matchesPlayed + 1}</h3>
                       </div>
                       <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                           {loading ? <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" /> : <PlayCircle size={32} />}
                       </div>
                   </button>

                   <div className="grid grid-cols-2 gap-4">
                       <button 
                          onClick={() => setShowShop(true)}
                          className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors flex flex-col items-center justify-center gap-2 text-slate-700"
                       >
                           <ShoppingBag size={24} className="text-emerald-600" />
                           <span className="font-bold">Loja</span>
                       </button>
                       <button 
                          onClick={() => setShowCareerTrophies(true)}
                          className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-amber-500 hover:bg-amber-50 transition-colors flex flex-col items-center justify-center gap-2 text-slate-700"
                       >
                           <Trophy size={24} className="text-amber-500" />
                           <span className="font-bold">Conquistas</span>
                       </button>
                   </div>
              </div>

              {/* Feed / History */}
              <Card title="Histórico da Temporada">
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                      {[...careerData.history].reverse().map((log, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 border-l-4 border-emerald-500">
                              {log}
                          </div>
                      ))}
                      {careerData.history.length === 0 && (
                          <p className="text-slate-400 text-center py-4">Nenhum jogo disputado ainda.</p>
                      )}
                  </div>
              </Card>
              
              {/* Transfer Offers Notification */}
              {careerTransferOffers.length > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-3">
                          <Briefcase className="text-blue-600" />
                          <div>
                              <p className="font-bold text-blue-800">Proposta de Transferência!</p>
                              <p className="text-xs text-blue-600">{careerTransferOffers.length} clubes interessados.</p>
                          </div>
                      </div>
                      <button 
                          onClick={() => setShowContract(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
                      >
                          Ver
                      </button>
                  </div>
              )}

              {/* Exit Button */}
              <div className="flex justify-center mt-8">
                  <button 
                      onClick={() => setView(userTeam ? 'dashboard' : 'select-team')}
                      className="px-6 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-colors flex items-center gap-2"
                  >
                      <ArrowLeft size={20} />
                      Sair do Modo Carreira
                  </button>
              </div>

              {/* Modals */}
              {showShop && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                          <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                              <h3 className="font-bold text-lg">Loja de Estilo de Vida</h3>
                              <button onClick={() => setShowShop(false)}><X size={20} /></button>
                          </div>
                          <div className="p-4 overflow-y-auto space-y-3">
                              <div className="text-center mb-4 bg-green-50 p-2 rounded-lg border border-green-100">
                                  <p className="text-xs text-green-800 font-bold uppercase">Seu Saldo</p>
                                  <p className="text-xl font-bold text-green-600">R$ {careerData.cash.toLocaleString()}</p>
                              </div>
                              {shopItems.map(item => {
                                  const owned = careerData.inventory.includes(item.id);
                                  return (
                                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50">
                                          <div className="flex items-center gap-3">
                                              <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                                  {item.icon}
                                              </div>
                                              <div>
                                                  <p className="font-bold text-sm">{item.name}</p>
                                                  <p className="text-xs text-slate-500">R$ {item.price.toLocaleString()}</p>
                                              </div>
                                          </div>
                                          <button 
                                              disabled={owned || careerData.cash < item.price}
                                              onClick={() => {
                                                  setCareerData(prev => prev ? ({
                                                      ...prev,
                                                      cash: prev.cash - item.price,
                                                      inventory: [...prev.inventory, item.id]
                                                  }) : null)
                                              }}
                                              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${owned ? 'bg-slate-200 text-slate-500' : careerData.cash >= item.price ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                                          >
                                              {owned ? 'Comprado' : 'Comprar'}
                                          </button>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>
                  </div>
              )}

              {/* Contract Modal */}
              {showContract && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                       <div className="bg-white rounded-2xl w-full max-w-md p-6 text-center">
                           <h3 className="text-2xl font-bold mb-4">Propostas Recebidas</h3>
                           <div className="space-y-3 mb-6">
                               {careerTransferOffers.map((offer, idx) => (
                                   <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                                       <div className="flex items-center gap-3">
                                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${offer.color}`}>
                                               {offer.name.substring(0,2)}
                                           </div>
                                           <span className="font-bold text-slate-700">{offer.name}</span>
                                       </div>
                                       <button 
                                           onClick={() => {
                                               setCareerData(prev => prev ? ({...prev, teamName: offer.name, teamColor: offer.color}) : null);
                                               setCareerTransferOffers(prev => prev.filter((_, i) => i !== idx));
                                               setShowContract(false);
                                           }}
                                           className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded font-bold"
                                       >
                                           Aceitar
                                       </button>
                                   </div>
                               ))}
                           </div>
                           <button onClick={() => setShowContract(false)} className="text-slate-500 font-bold">Fechar</button>
                       </div>
                  </div>
              )}

              {/* Trophies Modal */}
              {showCareerTrophies && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                           <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                               <div className="flex items-center gap-2">
                                   <Trophy className="text-amber-500" size={20} />
                                   <h3 className="font-bold text-lg">Sala de Troféus</h3>
                               </div>
                               <button onClick={() => setShowCareerTrophies(false)}><X size={20} /></button>
                           </div>

                           {/* Filter */}
                           {seasons.length > 0 && (
                               <div className="px-4 py-2 bg-slate-50 border-b flex items-center gap-2 overflow-x-auto no-scrollbar">
                                   <Filter size={14} className="text-slate-400 flex-shrink-0" />
                                   <button 
                                       onClick={() => setTrophyFilterSeason('all')}
                                       className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-colors ${trophyFilterSeason === 'all' ? 'bg-emerald-600 text-white font-bold' : 'bg-white border text-slate-600'}`}
                                   >
                                       Tudo
                                   </button>
                                   {seasons.map(s => (
                                       <button
                                           key={s}
                                           onClick={() => setTrophyFilterSeason(s)}
                                           className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-colors ${trophyFilterSeason === s ? 'bg-emerald-600 text-white font-bold' : 'bg-white border text-slate-600'}`}
                                       >
                                           Temp {s}
                                       </button>
                                   ))}
                               </div>
                           )}

                           <div className="p-6 overflow-y-auto text-center space-y-4">
                               {filteredTrophies.length === 0 ? (
                                   <div className="py-8">
                                       <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                           <Trophy size={32} />
                                       </div>
                                       <p className="text-slate-500">
                                           {trophyFilterSeason !== 'all' 
                                              ? `Nenhum troféu na Temporada ${trophyFilterSeason}.`
                                              : "Ainda não conquistou troféus."}
                                       </p>
                                   </div>
                               ) : (
                                   <div className="grid gap-3">
                                       {filteredTrophies.map((trophy, i) => (
                                           <div key={i} className="flex items-start gap-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-left">
                                               <div className="p-2 bg-white rounded-full shadow-sm text-amber-500">
                                                   <Crown size={20} />
                                               </div>
                                               <div>
                                                   <h4 className="font-bold text-amber-900 text-sm">{trophy.name}</h4>
                                                   <p className="text-amber-700/80 text-xs leading-tight mt-1">{trophy.description}</p>
                                                   <span className="inline-block mt-1.5 text-[10px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
                                                       Temp {trophy.season}
                                                   </span>
                                               </div>
                                           </div>
                                       ))}
                                   </div>
                               )}
                           </div>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  // --- Dedicated Social Feed View ---
  const renderSocial = () => (
      <div className="p-4 md:p-8 pb-24 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-slate-800">Rede Social</h2>
              <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">Ao Vivo</div>
          </div>

          <div className="space-y-4">
              {socialPosts.map(post => (
                  <Card key={post.id} className="hover:bg-slate-50 transition-colors border-none shadow-md">
                      <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-lg ${post.teamName ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                              {post.authorName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <p className="font-bold text-slate-900">{post.authorName}</p>
                                      <p className="text-xs text-slate-500">@{post.authorName.toLowerCase().replace(/\s/g, '')} • {post.timeAgo}</p>
                                  </div>
                                  <button className="text-slate-400 hover:text-slate-600">
                                      <MoveRight size={16} className="rotate-45" />
                                  </button>
                              </div>
                              
                              {/* Content - Text replaces Image prominence */}
                              <p className="text-lg md:text-xl text-slate-800 mt-3 mb-4 leading-relaxed font-medium">
                                  {post.content}
                              </p>
                              
                              {/* Action Bar */}
                              <div className="flex items-center justify-between text-slate-500 text-sm border-t border-slate-100 pt-3">
                                   <button className="flex items-center gap-2 hover:text-red-500 transition-colors group">
                                       <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors">
                                           <Heart size={18} className={post.isLiked ? "fill-red-500 text-red-500" : ""} />
                                       </div>
                                       <span className="font-bold">{post.likes}</span>
                                   </button>
                                   <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
                                       <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                                           <MessageCircle size={18} />
                                       </div>
                                       <span className="font-bold">Comentar</span>
                                   </button>
                                   <button className="flex items-center gap-2 hover:text-green-500 transition-colors group">
                                       <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                                           <Zap size={18} />
                                       </div>
                                   </button>
                              </div>
                          </div>
                      </div>
                  </Card>
              ))}
          </div>
      </div>
  );

  // --- Dashboard (Clean Layout) ---
  const renderDashboard = () => (
    <div className="p-4 md:p-8 space-y-6 pb-24 lg:pb-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Início</h2>
          <p className="text-slate-500">Bem-vindo ao {userTeam?.name}</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm text-slate-500 font-bold uppercase">Temporada 1</p>
          <p className="text-xs text-slate-400">Semana {week}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Main Action Buttons Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
             
             {/* 1. Jogo */}
             <button 
                onClick={() => setView('match')}
                className="p-6 bg-slate-900 text-white rounded-2xl shadow-lg flex flex-col justify-between min-h-[160px] group hover:scale-[1.02] transition-transform border border-slate-800 relative overflow-hidden"
             >
                 <div className="absolute top-0 right-0 p-32 bg-slate-800/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                 <div className="flex justify-between items-start relative z-10">
                     <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                         <MonitorPlay size={32} className="text-emerald-400" />
                     </div>
                 </div>
                 <div className="relative z-10 text-left">
                     <p className="text-slate-400 text-sm font-medium mb-1">Próximo Desafio</p>
                     <h3 className="text-2xl font-bold">Ir para o Jogo</h3>
                 </div>
             </button>

             {/* 2. Rumo ao Estrelato */}
             <button 
                onClick={() => setView(careerData ? 'career-hub' : 'career-intro')}
                className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl shadow-lg flex flex-col justify-between min-h-[160px] group hover:scale-[1.02] transition-transform relative overflow-hidden"
             >
                 <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                 <div className="flex justify-between items-start relative z-10">
                     <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                         <Star size={32} className="text-yellow-300 fill-yellow-300" />
                     </div>
                 </div>
                 <div className="relative z-10 text-left">
                     <p className="text-indigo-200 text-sm font-medium mb-1">Modo Carreira</p>
                     <h3 className="text-2xl font-bold">Rumo ao Estrelato</h3>
                 </div>
             </button>

             {/* 3. Rede Social */}
             <button 
                onClick={() => setView('social')}
                className="p-6 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-colors flex flex-col justify-between min-h-[160px] relative overflow-hidden"
             >
                 <div className="absolute bottom-0 left-0 p-24 bg-white/10 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>
                 <div className="flex justify-between items-start relative z-10">
                     <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                         <MessageCircle size={28} />
                     </div>
                 </div>
                 <div className="relative z-10 text-left">
                     <p className="text-blue-100 text-sm font-medium mb-1">Interação</p>
                     <h3 className="text-xl font-bold">Rede Social</h3>
                 </div>
             </button>

             {/* 4. Elenco */}
             <button 
                onClick={() => setView('squad')}
                className="p-6 bg-white text-slate-800 border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 transition-colors flex flex-col justify-between min-h-[160px]"
             >
                 <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
                     <Users size={28} />
                 </div>
                 <div className="text-left">
                     <p className="text-slate-500 text-sm font-medium mb-1">Gestão</p>
                     <h3 className="text-xl font-bold">Seu Elenco</h3>
                     <p className="text-xs text-emerald-600 font-bold mt-1">{squad.length} Jogadores</p>
                 </div>
             </button>
        </div>

        {/* Side Column - Highlights & Market */}
        <div className="space-y-6">
             <Card title="Destaques do Elenco">
                <div className="space-y-2">
                    {squad.sort((a,b) => b.rating - a.rating).slice(0, 4).map(player => (
                        <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                             <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-300">
                                {player.rating}
                             </div>
                             <div className="min-w-0">
                                <p className="text-sm font-bold truncate text-slate-800">{player.name}</p>
                                <p className="text-xs text-slate-500 font-medium">{player.position}</p>
                             </div>
                        </div>
                    ))}
                </div>
             </Card>

             <button 
                onClick={() => setView('market')}
                className="w-full p-4 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-between group"
             >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                        <DollarSign size={24} />
                    </div>
                    <div className="text-left">
                        <p className="font-bold">Mercado</p>
                        <p className="text-slate-400 text-xs">Contratar reforços</p>
                    </div>
                </div>
                <MoveRight size={16} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
             </button>
        </div>
      </div>
    </div>
  );

  const renderSquad = () => (
    <div className="p-4 md:p-8 pb-24">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Gerenciar Elenco</h2>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                <span className="text-sm font-bold text-slate-500 uppercase mr-2">Valor Total</span>
                <span className="font-bold text-emerald-600 text-lg">
                    $ {squad.reduce((acc, p) => acc + p.value, 0).toFixed(1)}M
                </span>
            </div>
        </div>
        <Card className="overflow-hidden">
            <div className="max-h-[70vh] overflow-y-auto">
                {squad.sort((a, b) => b.rating - a.rating).map((player) => (
                    <PlayerRow 
                        key={player.id} 
                        player={player} 
                        showPrice 
                        onSell={(p) => setSellingPlayer(p)}
                        onLoan={(p) => setLoaningPlayer(p)}
                        onRenew={(p) => {
                             // Simple renewal logic demo
                             const cost = 2; // 2M cost
                             if (budget >= cost) {
                                 setBudget(prev => prev - cost);
                                 setSquad(prev => prev.map(pl => pl.id === p.id ? {...pl, contractWeeks: pl.contractWeeks + 50} : pl));
                                 alert(`Contrato de ${p.name} renovado!`);
                             } else {
                                 alert("Orçamento insuficiente.");
                             }
                        }}
                    />
                ))}
            </div>
        </Card>

        {/* Sell Modal */}
        {sellingPlayer && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
                    <h3 className="text-xl font-bold mb-2">Vender {sellingPlayer.name}?</h3>
                    <p className="text-slate-600 mb-4">Valor de mercado: <span className="font-bold text-emerald-600">$ {sellingPlayer.value}M</span></p>
                    
                    {offers.length === 0 ? (
                         <div className="text-center py-4">
                             <p className="mb-4">Buscando interessados...</p>
                             <button 
                                onClick={() => {
                                    // Mock offers
                                    setOffers([
                                        { team: generateFictionalTeamName(), value: parseFloat((sellingPlayer.value * 0.9).toFixed(1)) },
                                        { team: generateFictionalTeamName(), value: parseFloat((sellingPlayer.value * 1.1).toFixed(1)) }
                                    ]);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full font-bold"
                             >
                                 Anunciar Jogador
                             </button>
                         </div>
                    ) : (
                        <div className="space-y-3">
                            {offers.map((offer, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded border">
                                    <div>
                                        <p className="font-bold text-sm">{offer.team}</p>
                                        <p className="text-emerald-600 font-bold">$ {offer.value}M</p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setBudget(b => b + offer.value);
                                            setSquad(s => s.filter(p => p.id !== sellingPlayer.id));
                                            setSellingPlayer(null);
                                            setOffers([]);
                                            alert(`Vendido para ${offer.team}!`);
                                        }}
                                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded"
                                    >
                                        Aceitar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <button 
                        onClick={() => { setSellingPlayer(null); setOffers([]); }}
                        className="mt-4 text-slate-500 w-full py-2"
                    >
                        Cancelar
                    </button>
                </div>
             </div>
        )}
        
        {/* Loan OUT Modal */}
        {loaningPlayer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
                    <h3 className="text-xl font-bold mb-2">Emprestar {loaningPlayer.name}</h3>
                    <p className="text-slate-600 mb-4 text-sm">O clube interessado pagará 100% do salário.</p>
                     
                     {loanOffers.length === 0 ? (
                         <div className="text-center py-4">
                             <button 
                                onClick={() => {
                                    setLoanOffers([
                                        { team: generateFictionalTeamName(), value: 0 },
                                        { team: generateFictionalTeamName(), value: 0 }
                                    ]);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full font-bold"
                             >
                                 Buscar Interessados
                             </button>
                         </div>
                     ) : (
                         <div className="space-y-3">
                            {loanOffers.map((offer, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded border">
                                    <p className="font-bold text-sm">{offer.team}</p>
                                    <button 
                                        onClick={() => {
                                            // Logic: remove from active squad list but maybe keep in a "loaned" list? 
                                            // For simplicity, we just flag them in squad
                                            setSquad(prev => prev.map(p => p.id === loaningPlayer.id ? { ...p, isLoaned: true, team: offer.team } : p));
                                            setLoaningPlayer(null);
                                            setLoanOffers([]);
                                            alert(`Emprestado para ${offer.team} por 1 temporada.`);
                                        }}
                                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded"
                                    >
                                        Aceitar
                                    </button>
                                </div>
                            ))}
                         </div>
                     )}
                     <button 
                        onClick={() => { setLoaningPlayer(null); setLoanOffers([]); }}
                        className="mt-4 text-slate-500 w-full py-2"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        )}
    </div>
  );

  const renderMarket = () => (
    <div className="p-4 md:p-8 pb-24">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Mercado</h2>
            <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full shadow-sm border border-emerald-200">
                <span className="text-xs font-bold uppercase mr-2">Orçamento</span>
                <span className="font-bold text-lg">$ {budget.toFixed(1)}M</span>
            </div>
        </div>
        
        <Card>
            <div className="max-h-[70vh] overflow-y-auto">
                {market.map((player) => (
                    <PlayerRow 
                        key={player.id} 
                        player={player} 
                        showPrice
                        actionButton={
                            <button 
                                onClick={() => setNegotiationPlayer(player)}
                                className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm hover:bg-emerald-700 transition-colors"
                            >
                                Negociar
                            </button>
                        }
                    />
                ))}
            </div>
        </Card>
        
        {/* Negotiation Modal */}
        {negotiationPlayer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                        <h3 className="font-bold text-lg">Negociar Contrato</h3>
                        <button onClick={() => setNegotiationPlayer(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
                                <UserIcon size={24} />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-800">{negotiationPlayer.name}</p>
                                <p className="text-sm text-slate-500">{negotiationPlayer.position} • {negotiationPlayer.rating} OVR</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-xs text-slate-400 font-bold uppercase">Valor</p>
                                <p className="text-emerald-600 font-bold text-lg">$ {negotiationPlayer.value}M</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                                    <span>Salário Semanal (milhares)</span>
                                    <span className="text-emerald-600 font-bold">$ {negotiationOffer.salary}k</span>
                                </label>
                                <input 
                                    type="range" min="10" max="500" step="5"
                                    value={negotiationOffer.salary}
                                    onChange={(e) => setNegotiationOffer({...negotiationOffer, salary: Number(e.target.value)})}
                                    className="w-full accent-emerald-600"
                                />
                            </div>
                            <div>
                                <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                                    <span>Duração do Contrato</span>
                                    <span className="text-blue-600 font-bold">{negotiationOffer.weeks} semanas</span>
                                </label>
                                <input 
                                    type="range" min="20" max="150" step="10"
                                    value={negotiationOffer.weeks}
                                    onChange={(e) => setNegotiationOffer({...negotiationOffer, weeks: Number(e.target.value)})}
                                    className="w-full accent-blue-600"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600">
                            <p>Custo da Transferência: <span className="font-bold text-slate-900">$ {negotiationPlayer.value}M</span></p>
                            <p>Orçamento Restante: <span className={`font-bold ${budget - negotiationPlayer.value < 0 ? 'text-red-600' : 'text-green-600'}`}>$ {(budget - negotiationPlayer.value).toFixed(1)}M</span></p>
                        </div>

                        <button 
                            onClick={() => {
                                if (budget < negotiationPlayer.value) {
                                    alert("Orçamento insuficiente!");
                                    return;
                                }
                                // Success chance logic
                                const wantedSalary = negotiationPlayer.rating * 2;
                                if (negotiationOffer.salary >= wantedSalary * 0.9) {
                                    setBudget(b => b - negotiationPlayer.value);
                                    setSquad(s => [...s, { ...negotiationPlayer, team: userTeam?.name, salary: negotiationOffer.salary, contractWeeks: negotiationOffer.weeks }]);
                                    setMarket(m => m.filter(p => p.id !== negotiationPlayer.id));
                                    setNegotiationPlayer(null);
                                    alert(`Bem-vindo ao time, ${negotiationPlayer.name}!`);
                                } else {
                                    alert("O jogador recusou a proposta salarial. Tente oferecer mais.");
                                }
                            }}
                            className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                        >
                            Finalizar Contratação
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );

  const renderStandings = () => (
      <div className="p-4 md:p-8 pb-24">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Tabela do Campeonato</h2>
          <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm md:text-base">
                      <thead className="bg-slate-50 text-slate-500 border-b">
                          <tr>
                              <th className="p-3 font-semibold w-12 text-center">#</th>
                              <th className="p-3 font-semibold">Clube</th>
                              <th className="p-3 font-semibold text-center">P</th>
                              <th className="p-3 font-semibold text-center hidden sm:table-cell">J</th>
                              <th className="p-3 font-semibold text-center hidden sm:table-cell">V</th>
                              <th className="p-3 font-semibold text-center hidden sm:table-cell">E</th>
                              <th className="p-3 font-semibold text-center hidden sm:table-cell">D</th>
                              <th className="p-3 font-semibold text-center hidden md:table-cell">SG</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {[...leagueTable].sort((a, b) => {
                              if (b.points !== a.points) return b.points - a.points;
                              return (b.gf - b.ga) - (a.gf - a.ga);
                          }).map((team, index) => (
                              <tr key={team.id} className={`hover:bg-slate-50 ${team.id === userTeam?.id ? 'bg-emerald-50' : ''}`}>
                                  <td className={`p-3 text-center font-bold ${index < 4 ? 'text-blue-600' : index > 16 ? 'text-red-600' : 'text-slate-600'}`}>
                                      {index + 1}
                                  </td>
                                  <td className="p-3 font-medium flex items-center gap-2">
                                      {team.id === userTeam?.id && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                                      {team.name}
                                  </td>
                                  <td className="p-3 text-center font-bold text-slate-800">{team.points}</td>
                                  <td className="p-3 text-center text-slate-500 hidden sm:table-cell">{team.played}</td>
                                  <td className="p-3 text-center text-slate-500 hidden sm:table-cell">{team.won}</td>
                                  <td className="p-3 text-center text-slate-500 hidden sm:table-cell">{team.drawn}</td>
                                  <td className="p-3 text-center text-slate-500 hidden sm:table-cell">{team.lost}</td>
                                  <td className="p-3 text-center text-slate-500 hidden md:table-cell">{team.gf - team.ga}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </Card>
      </div>
  );

  const renderTrophies = () => (
      <div className="p-4 md:p-8 pb-24 text-center">
           <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800">Sala de Troféus</h2>
              <p className="text-slate-500">Suas conquistas como treinador do {userTeam?.name}</p>
           </div>
           
           {trophies.length === 0 ? (
               <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-400">
                   <Trophy size={64} className="mb-4 opacity-20" />
                   <p className="text-lg font-medium">Ainda vazio...</p>
                   <p className="text-sm">Vença campeonatos para preencher sua estante!</p>
               </div>
           ) : (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   {trophies.map(t => (
                       <div key={t.id} className="bg-gradient-to-br from-amber-100 to-amber-50 p-6 rounded-xl shadow-md border border-amber-200 flex flex-col items-center">
                           <Crown size={48} className="text-amber-500 mb-3 drop-shadow-sm" />
                           <h3 className="font-bold text-amber-900">{t.name}</h3>
                           <p className="text-sm text-amber-700 font-medium">{t.year}</p>
                       </div>
                   ))}
               </div>
           )}
      </div>
  );

  const renderMatch = () => {
      if (preparingVisualMatch) {
          return (
              <div className="p-4 md:p-8 pb-24 flex flex-col items-center justify-center min-h-[80vh]">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mb-6"></div>
                  <h3 className="text-2xl font-bold text-slate-800">Preparando o Jogo...</h3>
                  <p className="text-slate-500">As equipes estão entrando em campo.</p>
              </div>
          );
      }
      
      if (isVisualMatch) {
          return (
              <div className="fixed inset-0 bg-slate-900 z-[60] flex flex-col items-center justify-center p-2 md:p-4">
                  {/* Scoreboard */}
                  <div className="w-full max-w-4xl bg-black/40 backdrop-blur-md rounded-xl p-4 mb-4 flex justify-between items-center text-white border border-white/10">
                      <div className="flex items-center gap-4 w-1/3">
                           <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold ${userTeam?.primaryColor} ${userTeam?.secondaryColor}`}>
                               {userTeam?.name.substring(0, 2)}
                           </div>
                           <span className="font-bold hidden md:inline">{userTeam?.name}</span>
                      </div>
                      <div className="flex flex-col items-center w-1/3">
                           <div className="text-3xl md:text-5xl font-black tracking-widest font-mono">
                               {currentScore.home} - {currentScore.away}
                           </div>
                           <div className="text-emerald-400 font-bold text-sm md:text-base animate-pulse flex items-center gap-1 mt-1">
                               {simTime}' {isHalftime ? "INTERVALO" : ""}
                           </div>
                      </div>
                      <div className="flex items-center justify-end gap-4 w-1/3">
                           <span className="font-bold hidden md:inline">{currentOpponent?.name}</span>
                           <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-700 rounded-full flex items-center justify-center font-bold text-white border border-slate-600">
                               {currentOpponent?.name.substring(0, 2)}
                           </div>
                      </div>
                  </div>

                  {/* Field Area */}
                  <div className="w-full max-w-4xl relative">
                      <SoccerField 
                          homeTeam={userTeam!} 
                          awayTeam={{id: 'opp', name: currentOpponent?.name || '', primaryColor: 'bg-white', secondaryColor: 'text-black'}} 
                          gameTime={simTime}
                          ballPos={ballPosition}
                          homePositions={homePlayerPos}
                          awayPositions={awayPlayerPos}
                      />
                      
                      {/* Event Feed Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 flex flex-col-reverse items-start gap-2 pointer-events-none">
                           {matchEvents.slice(Math.max(0, lastEventIndex - 2), lastEventIndex + 1).map((ev, i) => (
                               <div key={i} className="bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm md:text-base backdrop-blur-sm animate-in slide-in-from-bottom-2">
                                   <span className="font-bold text-emerald-400 mr-2">{ev.minute}'</span>
                                   {ev.description}
                               </div>
                           ))}
                      </div>
                  </div>

                  {/* Controls */}
                  <div className="w-full max-w-4xl mt-4 flex justify-between items-center">
                       <button 
                          onClick={() => setSoundEnabled(!soundEnabled)}
                          className="p-3 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                       >
                           {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                       </button>

                       {isHalftime && !hasPlayedSecondHalf && (
                           <button 
                              onClick={startSecondHalf}
                              className="px-8 py-3 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-600 shadow-lg animate-bounce"
                           >
                               Iniciar 2º Tempo
                           </button>
                       )}
                       
                       {(simTime >= 90 || (isHalftime && !hasPlayedSecondHalf === false)) && (
                           <button 
                              onClick={endVisualMatch}
                              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm font-bold"
                           >
                              {simTime >= 90 ? "Terminar Jogo" : "Pular"}
                           </button>
                       )}
                       
                       {/* Tactics Control */}
                       <div className="flex gap-2">
                           {['defensive', 'balanced', 'offensive'].map((t) => (
                               <button
                                   key={t}
                                   onClick={() => setCurrentTactic(t as any)}
                                   className={`px-3 py-1 rounded text-xs font-bold uppercase ${currentTactic === t ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                               >
                                   {t === 'defensive' ? 'DEF' : t === 'balanced' ? 'BAL' : 'ATA'}
                               </button>
                           ))}
                       </div>
                  </div>
              </div>
          );
      }

      // Default: Show Match Setup (Pre-match)
      return (
          <div className="p-4 md:p-8 pb-24 flex flex-col items-center justify-center min-h-[80vh]">
               <Card className="w-full max-w-2xl p-8 text-center space-y-8">
                   <h2 className="text-2xl font-bold">Próximo Jogo</h2>
                   
                   <div className="flex items-center justify-center gap-8 md:gap-16">
                       <div className="space-y-2">
                           <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-bold shadow-xl ${userTeam?.primaryColor} ${userTeam?.secondaryColor}`}>
                               {userTeam?.name.substring(0, 3).toUpperCase()}
                           </div>
                           <p className="font-bold text-lg">{userTeam?.name}</p>
                           <div className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                FOR: {Math.round(squad.reduce((a, b) => a + b.rating, 0) / (squad.length || 1))}
                           </div>
                       </div>

                       <div className="text-4xl font-black text-slate-200">VS</div>

                       <div className="space-y-2">
                           <div className="w-24 h-24 mx-auto bg-slate-200 rounded-full flex items-center justify-center text-3xl font-bold text-slate-500 shadow-inner">
                               ?
                           </div>
                           <p className="font-bold text-lg">Adversário</p>
                           <div className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                FOR: ??
                           </div>
                       </div>
                   </div>

                   <div className="space-y-4 max-w-xs mx-auto">
                       <button 
                          onClick={handlePlayMatch}
                          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center justify-center gap-2"
                       >
                           <MonitorPlay size={20} />
                           Assistir Jogo (2D)
                       </button>
                       <button 
                          onClick={handleSimulateMatch}
                          className="w-full py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                       >
                           <Zap size={20} />
                           Simulação Rápida
                       </button>
                   </div>
               </Card>
          </div>
      );
  };

  // --- Logic for Matches ---

  const handleSimulateMatch = async () => {
      if (!userTeam) return;
      setIsSimulating(true);
      
      // Pick opponent
      const opponentName = generateFictionalTeamName();
      const opponent: Team = { id: 'opp', name: opponentName, primaryColor: 'bg-gray-500', secondaryColor: 'text-white' };
      
      const result = await simulateMatchWithGemini(userTeam, squad, opponent);
      
      setMatchResult(result);
      updateLeagueTable(result);
      setIsSimulating(false);
  };

  const handlePlayMatch = async () => {
      if (!userTeam) return;
      
      setPreparingVisualMatch(true); // Start audio if enabled
      
      // Setup Match Data
      const opponentName = generateFictionalTeamName();
      const opponent: Team = { id: 'opp', name: opponentName, primaryColor: 'bg-gray-500', secondaryColor: 'text-white' };
      setCurrentOpponent(opponent);
      
      // Pre-calculate result for logic consistency
      const result = await simulateMatchWithGemini(userTeam, squad, opponent);
      setMatchEvents(result.events); // Store events to trigger them at right time
      
      // Reset Visual State
      setSimTime(0);
      setCurrentScore({ home: 0, away: 0 });
      setIsHalftime(false);
      setHasPlayedSecondHalf(false);
      setLastEventIndex(-1);
      
      // Start Visual Loop
      setIsVisualMatch(true);
      setPreparingVisualMatch(false);
      startMatchLoop(result.events);
  };

  const startMatchLoop = (events: any[]) => {
      let minute = 0;
      const interval = setInterval(() => {
          minute += 1;
          setSimTime(minute);
          
          // Update Ball & Players positions (Random movement for ambience)
          movePlayersAndBall();

          // Check events
          const eventIndex = events.findIndex(e => e.minute === minute);
          if (eventIndex !== -1) {
               setLastEventIndex(eventIndex);
               const event = events[eventIndex];
               if (event.type === 'goal') {
                   if (event.team === 'home') setCurrentScore(s => ({...s, home: s.home + 1}));
                   else setCurrentScore(s => ({...s, away: s.away + 1}));
               }
          }

          if (minute === 45) {
              clearInterval(interval);
              setIsHalftime(true);
          }
      }, 100); // Fast speed: 90mins in ~9 seconds of active time (split in halves)
      
      // Store interval id in a ref if needed to clear, but for this simple version:
      // We attach it to window or use a ref. For now, using a closure variable won't work well with React updates if we want to stop it.
      // *Simplified for this code structure*: Rely on the loop running to 45 then stopping.
  };
  
  // Simplified ref for loop control
  const matchLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  useEffect(() => {
      if (isVisualMatch && !isHalftime && simTime < 90) {
          matchLoopRef.current = setInterval(() => {
              setSimTime(prev => {
                  const next = prev + 1;
                  
                  // Move logic
                  movePlayersAndBall();
                  
                  // Event check
                  const event = matchEvents.find(e => e.minute === next);
                  if (event) {
                       // Just trigger UI update via rendering
                       if (event.type === 'goal') {
                           if (event.team === 'home') setCurrentScore(s => ({...s, home: s.home + 1}));
                           else setCurrentScore(s => ({...s, away: s.away + 1}));
                       }
                  }

                  if (next === 45) {
                      setIsHalftime(true);
                      if (matchLoopRef.current) clearInterval(matchLoopRef.current);
                  }
                  if (next >= 90) {
                      if (matchLoopRef.current) clearInterval(matchLoopRef.current);
                  }
                  return next;
              });
          }, 150); // 150ms per game minute
      }
      return () => {
          if (matchLoopRef.current) clearInterval(matchLoopRef.current);
      };
  }, [isVisualMatch, isHalftime, hasPlayedSecondHalf, matchEvents]);

  const startSecondHalf = () => {
      setHasPlayedSecondHalf(true);
      setIsHalftime(false);
  };

  const movePlayersAndBall = () => {
      // Simple random movement generator
      setBallPosition({ 
          x: 50 + Math.sin(Date.now() / 500) * 30, 
          y: 50 + Math.cos(Date.now() / 700) * 20 
      });
      
      // Generate positions for 10 players + GK per side
      const generateTeamPos = (isHome: boolean) => {
           return Array(11).fill(0).map((_, i) => ({
               x: (isHome ? 20 : 80) + (Math.random() * 20 - 10),
               y: 10 + i * 8 + (Math.random() * 5)
           }));
      };
      
      setHomePlayerPos(generateTeamPos(true));
      setAwayPlayerPos(generateTeamPos(false));
  };

  const endVisualMatch = () => {
      setIsVisualMatch(false);
      // Commit result
      const result: MatchResult = {
          homeScore: currentScore.home,
          awayScore: currentScore.away,
          events: matchEvents,
          summary: "Jogo encerrado.",
          opponentName: currentOpponent?.name || 'Adversário',
          win: currentScore.home > currentScore.away,
          draw: currentScore.home === currentScore.away
      };
      setMatchResult(result);
      updateLeagueTable(result);
  };

  const updateLeagueTable = (result: MatchResult) => {
       // Update User Team
       setLeagueTable(prev => {
           const newTable = [...prev];
           const userEntry = newTable.find(t => t.id === userTeam?.id);
           if (userEntry) {
               userEntry.played += 1;
               userEntry.gf += result.homeScore;
               userEntry.ga += result.awayScore;
               if (result.homeScore > result.awayScore) { userEntry.points += 3; userEntry.won += 1; }
               else if (result.homeScore === result.awayScore) { userEntry.points += 1; userEntry.drawn += 1; }
               else { userEntry.lost += 1; }
           }
           
           // Simulate other matches for realism
           newTable.forEach(t => {
               if (t.id !== userTeam?.id) {
                   // Random simulation for others
                   if (Math.random() > 0.5) { // 50% chance they played this week
                       const gf = Math.floor(Math.random() * 4);
                       const ga = Math.floor(Math.random() * 4);
                       t.played += 1;
                       t.gf += gf;
                       t.ga += ga;
                       if (gf > ga) { t.points += 3; t.won += 1; }
                       else if (gf === ga) { t.points += 1; t.drawn += 1; }
                       else { t.lost += 1; }
                   }
               }
           });
           
           return newTable;
       });
       setWeek(w => w + 1);
  };

  // --- Main Render ---
  
  // Helper to simplify main return
  const renderContent = () => {
      if (loading && !careerData && view !== 'select-team') return (
          <div className="h-screen flex items-center justify-center bg-slate-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
      );

      if (matchResult && !isVisualMatch && !isSimulating) {
          return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
                      <div className={`p-6 text-center ${matchResult.win ? 'bg-emerald-600' : matchResult.draw ? 'bg-amber-500' : 'bg-red-600'} text-white`}>
                          <h2 className="text-3xl font-black mb-2">{matchResult.homeScore} - {matchResult.awayScore}</h2>
                          <p className="font-bold text-lg opacity-90">{matchResult.win ? 'VITÓRIA' : matchResult.draw ? 'EMPATE' : 'DERROTA'}</p>
                      </div>
                      <div className="p-6 space-y-4">
                          <p className="text-center text-slate-600 font-medium">vs {matchResult.opponentName}</p>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm space-y-2 max-h-40 overflow-y-auto">
                              {matchResult.events.map((e, i) => (
                                  <div key={i} className="flex gap-2">
                                      <span className="font-bold text-slate-400 w-6">{e.minute}'</span>
                                      <span className="text-slate-700">{e.description}</span>
                                  </div>
                              ))}
                          </div>
                          <button 
                              onClick={() => {
                                  setMatchResult(null);
                                  setCurrentOpponent(null);
                              }}
                              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
                          >
                              Continuar
                          </button>
                      </div>
                  </div>
              </div>
          );
      }

      switch (view) {
          case 'dashboard': return renderDashboard();
          case 'social': return renderSocial();
          case 'squad': return renderSquad();
          case 'market': return renderMarket();
          case 'match': return renderMatch();
          case 'standings': return renderStandings();
          case 'trophies': return renderTrophies();
          case 'career-intro': return renderCareerIntro();
          case 'career-hub': return renderCareerHub();
          default: return <div className="p-8">Em construção...</div>;
      }
  };

  // Icons for User Icon placeholder
  const UserIcon = ({ size }: {size: number}) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
      </svg>
  );

  if (view === 'select-team') {
      return <TeamSelection onSelect={handleTeamSelect} />;
  }

  // Layout Wrapper for App Views
  if (view === 'career-hub' || view === 'career-intro') {
      // Career mode has full screen specialized layout usually, but we keep sidebar if desired or simple full
      // Based on design, Career Mode is immersive. Let's keep it full screen no sidebar for "Focus".
      return (
          <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
              {renderContent()}
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col lg:flex-row">
      <Sidebar currentView={view} onChangeView={setView} team={userTeam} />
      
      <div className="flex-1 min-w-0">
         {renderContent()}
      </div>

      <MobileNav currentView={view} onChangeView={setView} team={userTeam} />
    </div>
  );
}
