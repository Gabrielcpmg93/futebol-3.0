
import React, { useState, useEffect, useRef } from 'react';
import { BRAZILIAN_TEAMS, Team, Player, ViewState, MatchResult, Position, TeamStats, Trophy as TrophyType, SocialPost, CareerData, SocialComment, Transaction } from './types';
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
    Handshake,
    CheckCircle,
    Shield,
    MoveRight,
    Timer,
    Smartphone,
    Heart,
    MessageCircle,
    ShoppingBag,
    Wallet,
    Shirt,
    Crown,
    Filter,
    X,
    User,
    Target,
    FileText,
    BarChart3,
    CalendarClock,
    Send
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
        <div className="w-full aspect-[16/9] bg-[#2a8a3d] rounded-lg relative overflow-hidden border-[6px] border-slate-800 shadow-2xl select-none">
            {/* Grass Pattern (Stripes) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ 
                     backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 5%, #000 5%, #000 10%)',
                     backgroundSize: '100% 100%'
                 }}>
            </div>

            {/* Field Lines */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/60 transform -translate-x-1/2 z-0"></div>
            <div className="absolute top-1/2 left-1/2 w-20 h-20 md:w-32 md:h-32 border-2 border-white/60 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-0"></div>
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 z-0"></div>
            <div className="absolute top-0 left-0 w-full h-full border-2 border-white/60 m-2 md:m-4 box-border pointer-events-none z-0" style={{ width: 'calc(100% - 16px)', height: 'calc(100% - 16px)' }}></div>
            
            {/* Areas */}
            <div className="absolute top-1/2 left-0 w-[14%] h-[40%] border-2 border-white/60 bg-transparent transform -translate-y-1/2 ml-2 md:ml-4 z-0"></div>
            <div className="absolute top-1/2 right-0 w-[14%] h-[40%] border-2 border-white/60 bg-transparent transform -translate-y-1/2 mr-2 md:mr-4 z-0"></div>

            {/* Players - Home */}
            {homePositions.map((pos, i) => (
                <div 
                    key={`home-${i}`}
                    className={`absolute w-3 h-3 md:w-5 md:h-5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.3)] border-2 border-white transition-all duration-700 ease-in-out z-10 flex items-center justify-center text-[6px] text-white font-bold ${homeTeam.primaryColor}`}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                </div>
            ))}

            {/* Players - Away */}
            {awayPositions.map((pos, i) => (
                <div 
                    key={`away-${i}`}
                    className={`absolute w-3 h-3 md:w-5 md:h-5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.3)] border-2 border-white transition-all duration-700 ease-in-out z-10 flex items-center justify-center text-[6px] ${awayTeam.primaryColor} ${awayTeam.secondaryColor === 'text-white' ? 'text-white' : 'text-black'}`}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                </div>
            ))}

            {/* Ball */}
            <div 
                className="absolute w-2 h-2 md:w-3 md:h-3 bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.4)] z-20 transition-all duration-700 ease-in-out border border-slate-300 flex items-center justify-center"
                style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%`, transform: 'translate(-50%, -50%)' }}
            >
                <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_30%_30%,white,#ccc)]"></div>
            </div>
            
            {/* Game Time Overlay */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900/90 text-white px-4 py-1.5 rounded-full font-mono font-bold text-sm md:text-base backdrop-blur-sm flex items-center gap-3 border border-white/10 shadow-lg z-30">
                <Timer size={16} className="text-emerald-400" />
                <span>{gameTime}'</span>
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
  const [transactions, setTransactions] = useState<Transaction[]>([]); // Financial History
  const [week, setWeek] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [trophies, setTrophies] = useState<TrophyType[]>([]);
  const [showFinances, setShowFinances] = useState(false);
  
  // Match State
  const [leagueTable, setLeagueTable] = useState<TeamStats[]>([]);
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

  // TACTICS STATE
  const [tactics, setTactics] = useState({
      formation: '4-3-3',
      style: 'Equilibrado',
      intensity: 'Normal'
  });
  const [tacticalFeedback, setTacticalFeedback] = useState('');

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
  const [trophyFilterSeason, setTrophyFilterSeason] = useState<number | 'all'>('all');

  // Renewals Log State
  const [renewedLog, setRenewedLog] = useState<{playerName: string, weeks: number, weekRenewer: number}[]>([]);

  // Social Feed State
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [commentText, setCommentText] = useState<{[key: string]: string}>({});

  const shopItems = [
      { id: 'phone', name: 'iPhone 15 Pro', price: 5000, icon: <Smartphone size={20} /> },
      { id: 'boots', name: 'Chuteira Elite', price: 1200, icon: <Shirt size={20} /> },
      { id: 'watch', name: 'Relógio de Luxo', price: 15000, icon: <Timer size={20} /> },
      { id: 'car', name: 'Carro Esportivo', price: 150000, icon: <Zap size={20} /> },
      { id: 'house', name: 'Apartamento', price: 500000, icon: <Briefcase size={20} /> },
      { id: 'console', name: 'Videogame', price: 3500, icon: <MonitorPlay size={20} /> }
  ];

  // Logic to initialize table with FICTIONAL TEAMS + USER TEAM
  const initializeTable = (selectedTeam: Team) => {
      const fictionalNames = getFictionalLeagueNames(11); // Get 11 random fictional team names
      const userStats: TeamStats = {
          id: selectedTeam.id,
          name: selectedTeam.name,
          points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0
      };
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
    audio.load();
    return () => {
        audio.pause();
        audioRef.current = null;
    };
  }, []);

  // Manage Audio Playback
  useEffect(() => {
    const shouldPlay = (isVisualMatch || preparingVisualMatch) && soundEnabled;
    if (shouldPlay && audioRef.current) {
         audioRef.current.play().catch(e => console.log(e));
    } else if (!shouldPlay && audioRef.current) {
        audioRef.current.pause();
    }
  }, [isVisualMatch, preparingVisualMatch, soundEnabled]);


  // Initialization logic
  const handleTeamSelect = async (team: Team) => {
    setLoading(true);
    try {
        const players = await generateSquadForTeam(team.name);
        setUserTeam(team);
        setSquad(players);
        initializeTable(team);
        setSocialPosts(generateSocialFeed());
        setView('dashboard');
        generateTransferMarket().then(setMarket);
    } catch (error) {
        console.error("Failed to start game", error);
        alert("Erro ao iniciar o jogo.");
        setUserTeam(null);
    } finally {
        setLoading(false);
    }
  };

  // --- Helper Functions ---

  const addTransaction = (type: Transaction['type'], description: string, amount: number) => {
      const newTx: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          type,
          description,
          amount,
          week
      };
      setTransactions(prev => [newTx, ...prev]);
  };

  const handleSkipWeek = () => {
      setWeek(w => w + 1);
      simulateWorldMatches();
      setSquad(prev => prev.map(p => ({
          ...p,
          contractWeeks: Math.max(0, p.contractWeeks - 1)
      })));
  };

  const simulateWorldMatches = () => {
      setLeagueTable(prev => {
           // Create a new array properly mapped to ensure state updates trigger re-render
           return prev.map(t => {
               if (t.id !== userTeam?.id) {
                   if (Math.random() > 0.2) {
                       const gf = Math.floor(Math.random() * 4);
                       const ga = Math.floor(Math.random() * 4);
                       let { points, won, drawn, lost } = t;
                       
                       if (gf > ga) { points += 3; won += 1; }
                       else if (gf === ga) { points += 1; drawn += 1; }
                       else { lost += 1; }
                       
                       return {
                           ...t,
                           played: t.played + 1,
                           gf: t.gf + gf,
                           ga: t.ga + ga,
                           points,
                           won,
                           drawn,
                           lost
                       };
                   }
               }
               return t;
           });
      });
  }

  const updateLeagueTable = (result: MatchResult) => {
       let updatedUserStats: TeamStats | null = null;

       setLeagueTable(prev => {
           return prev.map(t => {
               // Update User Team
               if (t.id === userTeam?.id) {
                   const newStats = {
                       ...t,
                       played: t.played + 1,
                       gf: t.gf + result.homeScore,
                       ga: t.ga + result.awayScore,
                       won: t.won + (result.homeScore > result.awayScore ? 1 : 0),
                       drawn: t.drawn + (result.homeScore === result.awayScore ? 1 : 0),
                       lost: t.lost + (result.homeScore < result.awayScore ? 1 : 0),
                       points: t.points + (result.homeScore > result.awayScore ? 3 : (result.homeScore === result.awayScore ? 1 : 0))
                   };
                   updatedUserStats = newStats;
                   return newStats;
               }
               
               // Update Other teams (Simulation of concurrent games)
               if (t.id !== userTeam?.id) {
                   if (Math.random() > 0.5) {
                       const gf = Math.floor(Math.random() * 4);
                       const ga = Math.floor(Math.random() * 4);
                       return {
                           ...t,
                           played: t.played + 1,
                           gf: t.gf + gf,
                           ga: t.ga + ga,
                           won: t.won + (gf > ga ? 1 : 0),
                           drawn: t.drawn + (gf === ga ? 1 : 0),
                           lost: t.lost + (gf < ga ? 1 : 0),
                           points: t.points + (gf > ga ? 3 : (gf === ga ? 1 : 0))
                       };
                   }
               }
               return t;
           });
       });
       
       setWeek(w => w + 1);

       // Trophy check (using the local variable captured from the map loop)
       // We use a timeout to let the state update settle or just use the local var
       setTimeout(() => {
           if (updatedUserStats) {
               if (updatedUserStats.points >= 38) {
                   setTrophies(prev => {
                       if (!prev.find(t => t.name === 'Melhor Técnico')) {
                           alert("🏆 CONQUISTA: Melhor Técnico! (Atingiu 38 pontos)");
                           return [...prev, { id: `manager-${Date.now()}`, name: 'Melhor Técnico', year: 1, competition: 'Brasileirão' }];
                       }
                       return prev;
                   });
               }
               if (updatedUserStats.points >= 89) {
                    setTrophies(prev => {
                       if (!prev.find(t => t.name === 'Campeão Brasileiro')) {
                           alert("🏆 É CAMPEÃO! O título é seu! (Atingiu 89 pontos)");
                           return [...prev, { id: `champ-${Date.now()}`, name: 'Campeão Brasileiro', year: 1, competition: 'Série A' }];
                       }
                       return prev;
                   });
               }
           }
       }, 500);
  };

  const handleBuyPlayer = (player: Player) => {
      if (budget >= player.value) {
          setBudget(b => b - player.value);
          setSquad(s => [...s, { ...player, team: userTeam?.name }]);
          setMarket(m => m.filter(p => p.id !== player.id));
          addTransaction('buy', `Compra de ${player.name}`, -player.value);
          alert(`${player.name} contratado!`);
      } else {
          alert("Fundos insuficientes!");
      }
  };

  const handleSellPlayer = (player: Player) => {
      const sellValue = player.value * 0.8; // Sell for slightly less
      setBudget(b => b + sellValue);
      setSquad(s => s.filter(p => p.id !== player.id));
      addTransaction('sell', `Venda de ${player.name}`, sellValue);
      alert(`${player.name} vendido por $${sellValue.toFixed(1)}M!`);
  };

  // --- Match Simulation Logic ---
  
  const startMatch = async () => {
      const opponents = leagueTable.filter(t => t.id !== userTeam?.id);
      const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];
      const opponentTeam: Team = { id: randomOpponent.id, name: randomOpponent.name, primaryColor: 'bg-slate-600', secondaryColor: 'text-white' };
      
      setCurrentOpponent(opponentTeam);
      setPreparingVisualMatch(true);
      
      // Use Gemini to generate result, PASSING TACTICS now
      const result = await simulateMatchWithGemini(userTeam!, squad, opponentTeam, tactics);
      setMatchEvents(result.events);
      
      // Prep Visuals
      setPreparingVisualMatch(false);
      setIsVisualMatch(true);
      setSimTime(0);
      setCurrentScore({ home: 0, away: 0 });
      setLastEventIndex(-1);
      
      // Simple loops for visual positioning
      setHomePlayerPos(Array(10).fill(0).map(() => ({ x: 30 + Math.random() * 20, y: 10 + Math.random() * 80 })));
      setAwayPlayerPos(Array(10).fill(0).map(() => ({ x: 60 + Math.random() * 20, y: 10 + Math.random() * 80 })));

      // Animation Loop
      const interval = setInterval(() => {
          setSimTime(t => {
              if (t >= 90) {
                  clearInterval(interval);
                  setIsVisualMatch(false);
                  updateLeagueTable(result);
                  // Post match social
                  const newPosts = generateSocialFeed().slice(0, 3);
                  setSocialPosts(prev => [...newPosts, ...prev]);
                  return 90;
              }
              return t + 1;
          });

          // Move players randomly for visual effect
          setHomePlayerPos(prev => prev.map(p => ({
              x: Math.min(90, Math.max(10, p.x + (Math.random() - 0.5) * 5)),
              y: Math.min(90, Math.max(10, p.y + (Math.random() - 0.5) * 5))
          })));
          setAwayPlayerPos(prev => prev.map(p => ({
               x: Math.min(90, Math.max(10, p.x + (Math.random() - 0.5) * 5)),
               y: Math.min(90, Math.max(10, p.y + (Math.random() - 0.5) * 5))
          })));
          setBallPosition({ x: 50 + (Math.random() - 0.5) * 60, y: 50 + (Math.random() - 0.5) * 60 });

      }, 150); // Fast simulation

      // Events Check
      const eventInterval = setInterval(() => {
          setSimTime(currentTime => {
              const event = result.events.find(e => e.minute === currentTime);
              if (event) {
                  if (event.type === 'goal') {
                      if (event.team === 'home') setCurrentScore(s => ({...s, home: s.home + 1}));
                      else setCurrentScore(s => ({...s, away: s.away + 1}));
                      setBallPosition({ x: 50, y: 50 }); // Reset ball visual
                  }
              }
              return currentTime;
          })
      }, 150);
  };

  const handleTacticChange = (type: string, value: string) => {
      setTactics(prev => ({...prev, [type]: value}));
      setTacticalFeedback(`${type === 'formation' ? 'Formação' : type === 'style' ? 'Estilo' : 'Intensidade'} alterada para: ${value}!`);
      setTimeout(() => setTacticalFeedback(''), 3000);
  };

  // --- Renderers ---

  const renderDashboard = () => (
    <div className="p-4 md:p-8 space-y-6 pb-24 lg:pb-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Início</h2>
          <p className="text-slate-500">Bem-vindo ao {userTeam?.name}</p>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={handleSkipWeek}
                className="flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-bold hover:bg-amber-200 transition-colors border border-amber-200"
            >
                <CalendarClock size={20} />
                <span className="hidden md:inline">Pular Semana</span>
            </button>
            <div className="text-right hidden md:block">
                <p className="text-sm text-slate-500 font-bold uppercase">Temporada 1</p>
                <p className="text-xs text-slate-400">Semana {week}</p>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
             <button onClick={() => setView('match')} className="p-6 bg-slate-900 text-white rounded-2xl shadow-lg flex flex-col justify-between min-h-[160px] group hover:scale-[1.02] transition-transform border border-slate-800 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-32 bg-slate-800/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                 <div className="relative z-10"><MonitorPlay size={32} className="text-emerald-400" /></div>
                 <div className="relative z-10 text-left mt-4">
                     <p className="text-slate-400 text-sm font-medium mb-1">Próximo Desafio</p>
                     <h3 className="text-2xl font-bold">Ir para o Jogo</h3>
                 </div>
             </button>

             <button onClick={() => setView(careerData ? 'career-hub' : 'career-intro')} className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl shadow-lg flex flex-col justify-between min-h-[160px] group hover:scale-[1.02] transition-transform relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                 <div className="relative z-10"><Star size={32} className="text-yellow-300 fill-yellow-300" /></div>
                 <div className="relative z-10 text-left mt-4">
                     <p className="text-indigo-200 text-sm font-medium mb-1">Modo Carreira</p>
                     <h3 className="text-2xl font-bold">Rumo ao Estrelato</h3>
                 </div>
             </button>

             <button onClick={() => setShowFinances(true)} className="p-6 bg-emerald-600 text-white rounded-2xl shadow-lg hover:bg-emerald-700 transition-colors flex flex-col justify-between min-h-[160px] relative overflow-hidden">
                 <div className="absolute bottom-0 left-0 p-24 bg-white/10 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>
                 <div className="relative z-10"><Wallet size={28} /></div>
                 <div className="relative z-10 text-left mt-4">
                     <p className="text-emerald-100 text-sm font-medium mb-1">Gestão</p>
                     <h3 className="text-xl font-bold">Finanças</h3>
                     <p className="text-xs font-bold mt-1 bg-emerald-800/50 inline-block px-2 py-0.5 rounded">$ {budget.toFixed(1)}M</p>
                 </div>
             </button>

             <button onClick={() => setView('trophies')} className="p-6 bg-gradient-to-br from-amber-100 to-amber-50 text-amber-900 border border-amber-200 rounded-2xl shadow-sm hover:border-amber-500 transition-colors flex flex-col justify-between min-h-[160px] relative overflow-hidden">
                 <div className="p-3 bg-white/60 text-amber-600 rounded-xl w-fit backdrop-blur-sm"><Award size={28} /></div>
                 <div className="text-left relative z-10 mt-4">
                     <p className="text-amber-700 text-sm font-medium mb-1">Conquistas</p>
                     <h3 className="text-xl font-bold">Sala de Troféus</h3>
                     <p className="text-xs text-amber-600 font-bold mt-1">{trophies.length} Taças</p>
                 </div>
                 <Trophy size={100} className="absolute -bottom-4 -right-4 text-amber-200/50" />
             </button>
        </div>

        <div className="space-y-6">
             <Card title="Classificação - Série A" action={<button onClick={() => setView('standings')} className="text-xs text-blue-600 font-bold">Ver Tudo</button>}>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-slate-400 border-b text-[10px] uppercase">
                            <tr><th className="pb-2 pl-1">Pos</th><th className="pb-2">Time</th><th className="pb-2 text-center">Pts</th></tr>
                        </thead>
                        <tbody className="text-slate-700">
                            {[...leagueTable].sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga))
                                .map((t, i) => ({...t, rank: i + 1})).slice(0, 5).map((team) => (
                                <tr key={team.id} className={`border-b last:border-0 ${team.id === userTeam?.id ? 'bg-emerald-50 font-bold' : ''}`}>
                                    <td className="py-2 pl-2 w-8">{team.rank}º</td>
                                    <td className="py-2 truncate max-w-[100px]">{team.name}</td>
                                    <td className="py-2 text-center font-bold">{team.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
             </Card>

             <button onClick={() => setView('market')} className="w-full p-4 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors"><DollarSign size={24} /></div>
                    <div className="text-left"><p className="font-bold">Mercado</p><p className="text-slate-400 text-xs">Contratar reforços</p></div>
                </div>
                <MoveRight size={16} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
             </button>
        </div>
      </div>

      {showFinances && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
                   <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                       <div className="flex items-center gap-2"><BarChart3 className="text-emerald-600" size={24} /><h3 className="font-bold text-lg text-slate-800">Departamento Financeiro</h3></div>
                       <button onClick={() => setShowFinances(false)}><X size={20} /></button>
                   </div>
                   <div className="p-6 overflow-y-auto">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                           <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                               <p className="text-xs font-bold text-emerald-800 uppercase">Saldo Atual</p>
                               <p className="text-2xl font-black text-emerald-600">$ {budget.toFixed(1)}M</p>
                           </div>
                           <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                               <p className="text-xs font-bold text-red-800 uppercase">Despesa Contratações</p>
                               <p className="text-xl font-bold text-red-600">$ {Math.abs(transactions.filter(t => t.type === 'buy').reduce((acc, t) => acc + t.amount, 0)).toFixed(1)}M</p>
                           </div>
                           <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                               <p className="text-xs font-bold text-blue-800 uppercase">Receita Vendas</p>
                               <p className="text-xl font-bold text-blue-600">$ {transactions.filter(t => t.type === 'sell').reduce((acc, t) => acc + t.amount, 0).toFixed(1)}M</p>
                           </div>
                       </div>
                       <h4 className="font-bold text-slate-700 mb-3">Histórico de Transações</h4>
                       <div className="space-y-2">
                           {transactions.length === 0 ? <p className="text-slate-400 text-center py-4">Nenhuma movimentação registrada.</p> : transactions.map(t => (
                               <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                   <div><p className="font-bold text-slate-800 text-sm">{t.description}</p><p className="text-xs text-slate-400">Semana {t.week}</p></div>
                                   <span className={`font-bold ${t.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{t.amount >= 0 ? '+' : ''}{t.amount.toFixed(1)}M</span>
                               </div>
                           ))}
                       </div>
                   </div>
              </div>
          </div>
      )}
    </div>
  );

  const renderMatch = () => {
      if (preparingVisualMatch || isVisualMatch) {
          return (
              <div className="min-h-screen bg-slate-900 p-4 flex flex-col items-center justify-center relative">
                  <div className="w-full max-w-5xl">
                      {/* Placar */}
                      <div className="bg-slate-800 text-white p-4 rounded-t-2xl flex justify-between items-center border-b border-slate-700">
                          <div className="flex items-center gap-4 w-1/3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${userTeam?.primaryColor}`}>{userTeam?.name.substring(0,2)}</div>
                              <span className="font-bold text-lg hidden md:inline">{userTeam?.name}</span>
                          </div>
                          <div className="text-3xl font-black font-mono bg-black/50 px-6 py-2 rounded-lg border border-white/10 shadow-inner">{currentScore.home} - {currentScore.away}</div>
                          <div className="flex items-center gap-4 w-1/3 justify-end">
                              <span className="font-bold text-lg hidden md:inline">{currentOpponent?.name}</span>
                              <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center font-bold text-white">{currentOpponent?.name.substring(0,2)}</div>
                          </div>
                      </div>
                      
                      <SoccerField homeTeam={userTeam!} awayTeam={currentOpponent!} gameTime={simTime} ballPos={ballPosition} homePositions={homePlayerPos} awayPositions={awayPlayerPos} />
                      
                      {/* Centro Tático (NOVO) */}
                      <div className="mt-4 bg-slate-900 rounded-xl p-4 border-t-4 border-emerald-500 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <Activity className="text-emerald-400" />
                                Centro de Comando Tático
                            </h3>
                            {tacticalFeedback && (
                                <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse border border-emerald-500/50">
                                    {tacticalFeedback}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Formação</label>
                                <div className="flex flex-col gap-2">
                                    {['4-3-3', '4-4-2', '3-5-2'].map(f => (
                                        <button key={f} onClick={() => handleTacticChange('formation', f)} className={`p-2 rounded text-xs font-bold transition-all ${tactics.formation === f ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{f}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Estilo</label>
                                <div className="flex flex-col gap-2">
                                    {['Tic-Taka', 'Contra-Ataque', 'Bola Longa'].map(s => (
                                        <button key={s} onClick={() => handleTacticChange('style', s)} className={`p-2 rounded text-xs font-bold transition-all ${tactics.style === s ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{s}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Intensidade</label>
                                <div className="flex flex-col gap-2">
                                    {['Pressão Alta', 'Equilibrado', 'Recuar'].map(i => (
                                        <button key={i} onClick={() => handleTacticChange('intensity', i)} className={`p-2 rounded text-xs font-bold transition-all ${tactics.intensity === i ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{i}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 text-center italic">Alterar táticas pode influenciar a moral e o posicionamento do time em tempo real.</p>
                      </div>

                      {/* Narracao */}
                      <div className="mt-4 h-32 bg-black/40 rounded-lg p-4 overflow-y-auto font-mono text-sm text-emerald-400 border border-emerald-900/30">
                          {matchEvents.filter(e => e.minute <= simTime).reverse().map((e, i) => (
                              <div key={i} className="mb-1"><span className="text-slate-500 mr-2">{e.minute}'</span> {e.description}</div>
                          ))}
                      </div>
                  </div>
              </div>
          )
      }

      return (
          <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[80vh]">
              <div className="max-w-md w-full text-center space-y-6">
                  <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto flex items-center justify-center text-4xl mb-4 shadow-lg">⚽</div>
                  <h2 className="text-3xl font-bold text-slate-800">Dia de Jogo!</h2>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <p className="text-slate-500 font-bold uppercase text-sm mb-4">Próximo Adversário</p>
                      <div className="flex items-center justify-center gap-4 mb-6">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-xl ${userTeam?.primaryColor}`}>{userTeam?.name.substring(0,2)}</div>
                          <span className="text-2xl font-bold text-slate-300">VS</span>
                          <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center font-bold text-white text-xl">?</div>
                      </div>
                      <button onClick={startMatch} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-transform hover:scale-105 shadow-lg shadow-emerald-200">
                          Iniciar Partida
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  const renderSquad = () => (
      <div className="p-4 md:p-8 pb-24">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Elenco Principal</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {squad.sort((a,b) => b.rating - a.rating).map(player => (
                  <PlayerRow key={player.id} player={player} onSell={handleSellPlayer} showPrice />
              ))}
          </div>
      </div>
  );

  const renderMarket = () => (
      <div className="p-4 md:p-8 pb-24">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Mercado da Bola</h2>
              <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-bold">Orçamento</p>
                  <p className="text-xl font-bold text-emerald-600">$ {budget.toFixed(1)}M</p>
              </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {market.map(player => (
                  <PlayerRow key={player.id} player={player} actionButton={
                      <button onClick={() => handleBuyPlayer(player)} className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded hover:bg-emerald-700 font-bold">
                          Comprar (${player.value}M)
                      </button>
                  } />
              ))}
          </div>
      </div>
  );

  const renderStandings = () => (
      <div className="p-4 md:p-8 pb-24">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Tabela do Campeonato</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <table className="w-full text-left">
                 <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                     <tr>
                         <th className="p-4">Pos</th>
                         <th className="p-4">Time</th>
                         <th className="p-4 text-center">P</th>
                         <th className="p-4 text-center hidden md:table-cell">J</th>
                         <th className="p-4 text-center hidden md:table-cell">V</th>
                         <th className="p-4 text-center hidden md:table-cell">E</th>
                         <th className="p-4 text-center hidden md:table-cell">D</th>
                         <th className="p-4 text-center">SG</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                     {[...leagueTable].sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga)).map((t, i) => (
                         <tr key={t.id} className={`hover:bg-slate-50 ${t.id === userTeam?.id ? 'bg-emerald-50' : ''}`}>
                             <td className="p-4 font-bold text-slate-500 w-16">{i + 1}º</td>
                             <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                                 <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white ${t.id === userTeam?.id ? userTeam.primaryColor : 'bg-slate-400'}`}>{t.name.substring(0,1)}</div>
                                 {t.name}
                             </td>
                             <td className="p-4 text-center font-bold text-slate-900">{t.points}</td>
                             <td className="p-4 text-center text-slate-500 hidden md:table-cell">{t.played}</td>
                             <td className="p-4 text-center text-emerald-600 hidden md:table-cell">{t.won}</td>
                             <td className="p-4 text-center text-slate-500 hidden md:table-cell">{t.drawn}</td>
                             <td className="p-4 text-center text-red-500 hidden md:table-cell">{t.lost}</td>
                             <td className="p-4 text-center font-mono text-slate-600">{t.gf - t.ga}</td>
                         </tr>
                     ))}
                 </tbody>
             </table>
          </div>
      </div>
  );

  const renderTrophies = () => (
      <div className="p-4 md:p-8 pb-24">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Sala de Troféus</h2>
          {trophies.length === 0 ? (
              <div className="text-center py-20 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
                  <Trophy size={64} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-bold">Sua galeria está vazia.</p>
                  <p className="text-sm text-slate-400">Vença campeonatos para preencher este espaço!</p>
              </div>
          ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {trophies.map(trophy => (
                      <div key={trophy.id} className="bg-gradient-to-b from-amber-100 to-white p-6 rounded-2xl border border-amber-200 shadow-sm flex flex-col items-center text-center">
                          <div className="p-4 bg-white rounded-full shadow-lg mb-4 text-amber-500">
                              <Crown size={40} />
                          </div>
                          <h3 className="font-bold text-amber-900">{trophy.name}</h3>
                          <p className="text-xs text-amber-700 uppercase font-bold mt-1">{trophy.competition}</p>
                          <span className="mt-3 bg-amber-200 text-amber-900 text-xs font-bold px-2 py-1 rounded-full">Temporada {trophy.year}</span>
                      </div>
                  ))}
              </div>
          )}
      </div>
  );

  // Career Mode Renderers
  const renderCareerIntro = () => (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-800 via-slate-900 to-black"></div>
          <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row gap-8 items-center">
              <div className="hidden md:flex flex-col items-center animate-in slide-in-from-left duration-700">
                   <div className="w-72 h-[26rem] bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 rounded-t-3xl rounded-b-[3rem] border-4 border-yellow-100 shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="p-5 pt-8 flex flex-col h-full relative z-10 text-amber-950">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col items-center"><span className="text-4xl font-black leading-none">60</span><span className="text-lg font-bold uppercase">{careerTempPos === Position.GK ? 'GOL' : careerTempPos === Position.DEF ? 'DEF' : careerTempPos === Position.MID ? 'MEI' : 'ATA'}</span></div>
                                <div className="w-8 h-5 bg-blue-700 rounded-sm border border-white opacity-80"></div>
                            </div>
                            <div className="flex-1 flex items-center justify-center"><User size={110} className="text-amber-900/80 drop-shadow-md" /></div>
                            <div className="text-center pb-4"><h2 className="text-2xl font-black uppercase tracking-tighter truncate mb-1">{careerTempName || "JOGADOR"}</h2><div className="w-full h-0.5 bg-amber-900/30 mb-2"></div><div className="flex justify-center gap-3 text-xs font-black opacity-75"><span>PAC 65</span><span>SHO 60</span><span>PAS 62</span><span>DRI 64</span></div></div>
                        </div>
                   </div>
              </div>
              <div className="flex-1 w-full max-w-lg">
                  <div className="mb-6 flex items-center"><button onClick={() => setView(userTeam ? 'dashboard' : 'select-team')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"><ArrowLeftRight size={20} /><span className="font-bold">Voltar</span></button></div>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
                      {!careerOffers.length ? (
                          <div className="space-y-6">
                              <div><label className="block text-xs font-bold text-emerald-400 uppercase mb-2">Nome do Craque</label><input type="text" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-lg" placeholder="Como serás chamado?" value={careerTempName} onChange={e => setCareerTempName(e.target.value)} /></div>
                              <div><label className="block text-xs font-bold text-emerald-400 uppercase mb-2">Posição</label><div className="grid grid-cols-2 gap-3">{[{ id: Position.ATT, label: 'Atacante', icon: Target }, { id: Position.MID, label: 'Meio', icon: Activity }, { id: Position.DEF, label: 'Defensor', icon: Shield }, { id: Position.GK, label: 'Goleiro', icon: Handshake }].map((pos) => (<button key={pos.id} onClick={() => setCareerTempPos(pos.id)} className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${careerTempPos === pos.id ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}><pos.icon size={20} /><span className="font-bold text-sm">{pos.label}</span></button>))}</div></div>
                              <button onClick={async () => { setLoading(true); await new Promise(r => setTimeout(r, 2000)); const teams = [...BRAZILIAN_TEAMS].sort(() => 0.5 - Math.random()).slice(0, 3); setCareerOffers(teams.map(t => ({ name: t.name, color: t.primaryColor }))); setLoading(false); }} disabled={loading || !careerTempName} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 mt-4">{loading ? 'Jogando Peneira...' : 'Entrar em Campo'}</button>
                          </div>
                      ) : (
                          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <div className="text-center mb-6"><CheckCircle size={32} className="text-emerald-500 mx-auto mb-2" /><h3 className="text-2xl font-bold text-white">Aprovado!</h3></div>
                              <div className="space-y-3">{careerOffers.map((offer, idx) => (<button key={idx} onClick={() => { setCareerData({ playerName: careerTempName, position: careerTempPos, teamName: offer.name, teamColor: offer.color, matchesPlayed: 0, goals: 0, assists: 0, rating: 70, history: [], cash: 500, inventory: [], season: 1, trophies: [] }); setView('career-hub'); }} className="w-full p-4 rounded-xl bg-white hover:bg-slate-50 flex items-center justify-between group"><span className="font-bold text-slate-800">{offer.name}</span><span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Assinar</span></button>))}</div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>
  );

  const renderCareerHub = () => {
      if (!careerData) return null;
      return (
          <div className="p-4 md:p-8 pb-24 space-y-6 bg-slate-50 min-h-screen">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg ${careerData.teamColor}`}>{careerData.teamName.substring(0, 2)}</div>
                  <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-800">{careerData.playerName}</h2>
                      <p className="text-slate-500 font-medium">{careerData.teamName} • {careerData.position}</p>
                      <div className="flex gap-4 mt-3"><div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold flex gap-1"><Star size={16} />{careerData.rating} OVR</div><div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">$ {careerData.cash}</div></div>
                  </div>
              </div>
              <button onClick={async () => { setLoading(true); await new Promise(r => setTimeout(r, 1000)); setCareerData(prev => prev ? ({...prev, matchesPlayed: prev.matchesPlayed + 1, cash: prev.cash + 200, goals: prev.goals + (Math.random() > 0.7 ? 1 : 0), history: [...prev.history, `Jogo ${prev.matchesPlayed + 1}: Nota 7.5`] }) : null); setLoading(false); }} className="w-full p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl shadow-lg flex items-center justify-between"><div><p className="text-indigo-200 font-medium mb-1">Próxima Partida</p><h3 className="text-2xl font-bold">Jogar Semana {careerData.matchesPlayed + 1}</h3></div>{loading ? <div className="animate-spin w-8 h-8 border-2 border-white rounded-full border-t-transparent"></div> : <PlayCircle size={32} />}</button>
              
              <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => setShowShop(true)} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 flex flex-col items-center gap-2"><ShoppingBag size={24} className="text-emerald-600" /><span className="font-bold">Loja</span></button>
                   <button onClick={() => setShowCareerTrophies(true)} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-amber-500 flex flex-col items-center gap-2"><Trophy size={24} className="text-amber-500" /><span className="font-bold">Conquistas</span></button>
              </div>
              <Card title="Histórico"><div className="space-y-3 max-h-60 overflow-y-auto">{careerData.history.length === 0 ? <p className="text-slate-400">Nada ainda.</p> : [...careerData.history].reverse().map((h, i) => <div key={i} className="p-3 bg-slate-100 rounded">{h}</div>)}</div></Card>
              <button onClick={() => setView('dashboard')} className="w-full py-3 text-red-500 font-bold">Sair do Modo Carreira</button>

              {showShop && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                          <div className="p-4 border-b flex justify-between items-center bg-slate-50"><h3 className="font-bold text-lg">Loja</h3><button onClick={() => setShowShop(false)}><X size={20} /></button></div>
                          <div className="p-4 overflow-y-auto space-y-3">
                              {shopItems.map(item => {
                                  const owned = careerData.inventory.includes(item.id);
                                  return (
                                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-xl">
                                          <div className="flex items-center gap-3"><div className="p-2 bg-slate-100 rounded-lg">{item.icon}</div><div><p className="font-bold text-sm">{item.name}</p><p className="text-xs text-slate-500">$ {item.price}</p></div></div>
                                          <button disabled={owned || careerData.cash < item.price} onClick={() => setCareerData(prev => prev ? ({...prev, cash: prev.cash - item.price, inventory: [...prev.inventory, item.id]}) : null)} className={`px-3 py-1 rounded text-xs font-bold ${owned ? 'bg-slate-200 text-slate-500' : 'bg-emerald-600 text-white'}`}>{owned ? 'Comprado' : 'Comprar'}</button>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>
                  </div>
              )}
              {showCareerTrophies && (
                   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
                          <h3 className="text-xl font-bold mb-4">Troféus da Carreira</h3>
                          <p className="text-slate-500">Em breve...</p>
                          <button onClick={() => setShowCareerTrophies(false)} className="mt-4 text-slate-400">Fechar</button>
                      </div>
                   </div>
              )}
          </div>
      );
  };

  const renderSocial = () => (
      <div className="p-4 md:p-8 pb-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Rede Social</h2>
          <div className="space-y-4">
              {socialPosts.map(post => (
                  <Card key={post.id} className="shadow-md">
                      <div className="flex gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg bg-indigo-600`}>{post.authorName.charAt(0)}</div>
                          <div className="flex-1">
                              <p className="font-bold">{post.authorName} <span className="text-slate-400 text-xs font-normal">• {post.timeAgo}</span></p>
                              <p className="text-lg text-slate-800 mt-2 mb-3">{post.content}</p>
                              <div className="flex gap-4 text-slate-500 text-sm">
                                  <button className="flex items-center gap-1 hover:text-red-500"><Heart size={16} /> {post.likes}</button>
                                  <button className="flex items-center gap-1"><MessageCircle size={16} /> {post.comments.length}</button>
                              </div>
                              {/* Comments */}
                              <div className="mt-3 bg-slate-50 p-3 rounded-lg space-y-2">
                                  {post.comments.map((c, i) => (<div key={i} className="text-sm"><span className="font-bold">{c.author}: </span>{c.text}</div>))}
                                  <div className="flex gap-2 mt-2"><input className="flex-1 border rounded-full px-3 py-1 text-sm" placeholder="Comentar..." value={commentText[post.id] || ''} onChange={e => setCommentText({...commentText, [post.id]: e.target.value})} /><button className="text-emerald-600"><Send size={16} /></button></div>
                              </div>
                          </div>
                      </div>
                  </Card>
              ))}
          </div>
      </div>
  );

  if (view === 'select-team') return <TeamSelection onSelect={handleTeamSelect} />;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col lg:flex-row">
      <Sidebar currentView={view} onChangeView={setView} team={userTeam} />
      
      <main className="flex-1 overflow-y-auto h-screen no-scrollbar relative">
        {view === 'dashboard' && renderDashboard()}
        {view === 'match' && renderMatch()}
        {view === 'squad' && renderSquad()}
        {view === 'market' && renderMarket()}
        {view === 'standings' && renderStandings()}
        {view === 'trophies' && renderTrophies()}
        {view === 'social' && renderSocial()}
        {view === 'career-intro' && renderCareerIntro()}
        {view === 'career-hub' && renderCareerHub()}
      </main>

      <MobileNav currentView={view} onChangeView={setView} team={userTeam} />
    </div>
  );
}