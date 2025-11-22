
import React, { useState, useEffect, useRef } from 'react';
import { BRAZILIAN_TEAMS, Team, Player, ViewState, MatchResult, Position, TeamStats, Trophy as TrophyType, SocialPost, CareerData, Transaction, LibertadoresData, LibOpponent } from './types';
import { generateSquadForTeam, generateTransferMarket, simulateMatchWithGemini, generateFictionalTeamName, getFictionalLeagueNames, generateSocialFeed, getLibertadoresTeams, generateLibertadoresGroups, generateLoanOffers, generateCareerOffers } from './services/geminiService';
import { Card } from './components/Card';
import { PlayerRow } from './components/PlayerRow';
import { 
    LayoutDashboard, Users, ArrowLeftRight, PlayCircle, DollarSign, Activity, Trophy, Star, ListOrdered, Settings, Award, Briefcase, MonitorPlay, Zap, Handshake, CheckCircle, Shield, MoveRight, Timer, Smartphone, Heart, MessageCircle, ShoppingBag, Wallet, Shirt, Crown, X, User, Target, BarChart3, CalendarClock, Send, Globe2, Lock, PenTool, ArrowLeft, ThumbsUp, Medal
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

const Sidebar = ({ currentView, onChangeView, team }: { currentView: ViewState, onChangeView: (v: ViewState) => void, team: Team | null }) => {
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
                    const active = currentView === item.id || 
                                   (item.id === 'career-intro' && currentView === 'career-hub') ||
                                   (item.id === 'dashboard' && (currentView === 'libertadores-intro' || currentView === 'libertadores-select' || currentView === 'libertadores-hub'));
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

const MobileNav = ({ currentView, onChangeView }: { currentView: ViewState, onChangeView: (v: ViewState) => void, team: Team | null }) => {
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

const SoccerField = ({ homeTeam, awayTeam, gameTime, ballPos, homePositions, awayPositions, activeTactic }: any) => {
    return (
        <div className="relative w-full max-w-4xl mx-auto">
             {/* Field Container */}
            <div className="w-full aspect-[16/9] bg-[#2e8b57] rounded-lg relative overflow-hidden border-[6px] border-slate-800 shadow-2xl select-none group">
                {/* Grass Pattern */}
                <div className="absolute inset-0 pointer-events-none opacity-30" 
                     style={{ 
                         backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 5%, #1a5e3a 5%, #1a5e3a 10%)', 
                         backgroundSize: '100% 100%' 
                     }}>
                </div>

                {/* Lines */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/50 transform -translate-x-1/2 z-0"></div>
                <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/50 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-0"></div>
                <div className="absolute top-0 left-0 w-full h-full border-2 border-white/50 m-4 box-border pointer-events-none z-0" style={{ width: 'calc(100% - 32px)', height: 'calc(100% - 32px)' }}></div>
                
                {/* Players */}
                {homePositions.map((pos: any, i: number) => (
                    <div key={`home-${i}`} className={`absolute w-4 h-4 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.4)] border border-white z-10 flex items-center justify-center text-[8px] text-white font-bold ${homeTeam.primaryColor} transition-all duration-500 ease-linear`} style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}></div>
                ))}
                {awayPositions.map((pos: any, i: number) => (
                    <div key={`away-${i}`} className={`absolute w-4 h-4 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.4)] border border-white z-10 flex items-center justify-center text-[8px] ${awayTeam.primaryColor} ${awayTeam.secondaryColor === 'text-white' ? 'text-white' : 'text-black'} transition-all duration-500 ease-linear`} style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}></div>
                ))}
                
                {/* Ball */}
                <div className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.5)] z-20 border border-slate-400 transition-all duration-300 ease-linear" style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%`, transform: 'translate(-50%, -50%)' }}></div>
                
                {/* HUD */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900/80 text-white px-4 py-1.5 rounded-full font-mono font-bold text-base backdrop-blur-sm flex items-center gap-3 border border-white/10 shadow-lg z-30">
                    <Timer size={16} className="text-emerald-400" /><span>{gameTime}'</span>
                </div>
                
                {activeTactic && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-emerald-500/90 text-white px-4 py-2 rounded-lg font-bold text-sm animate-bounce shadow-lg z-30">
                       TÁTICA ATIVA: {activeTactic}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function App() {
  const [view, setView] = useState<ViewState>('select-team');
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [squad, setSquad] = useState<Player[]>([]);
  const [market, setMarket] = useState<Player[]>([]);
  const [budget, setBudget] = useState<number>(50); 
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [week, setWeek] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [trophies, setTrophies] = useState<TrophyType[]>([]);
  const [showFinances, setShowFinances] = useState(false);
  
  // Negotiation & Loans
  const [negotiationType, setNegotiationType] = useState<'buy' | 'renew' | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [negotiationValues, setNegotiationValues] = useState<{salary: number, weeks: number}>({salary: 0, weeks: 0});
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [loanOffers, setLoanOffers] = useState<{name: string, wageSplit: number}[]>([]);

  // Match State
  const [leagueTable, setLeagueTable] = useState<TeamStats[]>([]);
  const [isVisualMatch, setIsVisualMatch] = useState(false);
  const [preparingVisualMatch, setPreparingVisualMatch] = useState(false);
  const [simTime, setSimTime] = useState(0);
  const [currentOpponent, setCurrentOpponent] = useState<Team | null>(null);
  const [currentScore, setCurrentScore] = useState({ home: 0, away: 0 });
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const [homePlayerPos, setHomePlayerPos] = useState<{x:number, y:number}[]>([]);
  const [awayPlayerPos, setAwayPlayerPos] = useState<{x:number, y:number}[]>([]);
  const [matchEvents, setMatchEvents] = useState<any[]>([]);
  const [tactics, setTactics] = useState({ formation: '4-3-3', style: 'Equilibrado', intensity: 'Normal' });
  const [activeIngameTactic, setActiveIngameTactic] = useState<string | null>(null);

  // Career & Social
  const [careerData, setCareerData] = useState<CareerData | null>(null);
  const [careerStep, setCareerStep] = useState<'intro' | 'amateur-match' | 'offers' | 'signing' | 'hub'>('intro');
  const [careerTempName, setCareerTempName] = useState("");
  const [careerTempPos, setCareerTempPos] = useState<Position>(Position.ATT);
  const [careerOffersList, setCareerOffersList] = useState<Array<{name: string, color: string, salary: number}>>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [commentText, setCommentText] = useState<{[key: string]: string}>({});
  const [simulatingCareer, setSimulatingCareer] = useState(false);

  // Libertadores (Copa dos Campeões)
  const [libertadoresData, setLibertadoresData] = useState<LibertadoresData | null>(null);
  const [isLibertadoresMatch, setIsLibertadoresMatch] = useState(false);
  const [showLibertadoresCelebration, setShowLibertadoresCelebration] = useState(false);
  const [simulatingLibertadores, setSimulatingLibertadores] = useState(false);
  const [showLeagueChampion, setShowLeagueChampion] = useState(false);

  // Audio Logic
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const audio = new Audio('https://actions.google.com/sounds/v1/ambiences/stadium_crowd_cheering.ogg');
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;
    return () => { audio.pause(); audioRef.current = null; };
  }, []);

  useEffect(() => {
    if ((isVisualMatch || preparingVisualMatch) && audioRef.current) {
         audioRef.current.play().catch(() => {});
    } else if (audioRef.current) {
        audioRef.current.pause();
    }
  }, [isVisualMatch, preparingVisualMatch]);

  const initializeTable = (selectedTeam: Team) => {
      const fictionalNames = getFictionalLeagueNames(19); // Brasileirão 20 teams
      const userStats: TeamStats = { id: selectedTeam.id, name: selectedTeam.name, points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 };
      const opponentStats: TeamStats[] = fictionalNames.map((name, index) => ({ 
          id: `fictional-${index}`, 
          name: name, 
          points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 
      }));
      setLeagueTable([userStats, ...opponentStats]);
  };

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
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const handleLibertadoresSelect = async (team: Team) => {
      setLoading(true);
      try {
          const players = await generateSquadForTeam(team.name);
          setUserTeam(team);
          setSquad(players);
          const groups = generateLibertadoresGroups(team.name);
          setLibertadoresData({ myTeam: team, currentGroupIndex: 0, groups: groups, history: [] });
          setSocialPosts(generateSocialFeed());
          setView('libertadores-hub');
      } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const addTransaction = (type: Transaction['type'], description: string, amount: number) => {
      setTransactions(prev => [{ id: Math.random().toString(36).substr(2, 9), type, description, amount, week }, ...prev]);
  };

  const handleSkipWeek = () => {
      setWeek(w => w + 1);
      setSquad(prev => prev.map(p => ({ ...p, contractWeeks: Math.max(0, p.contractWeeks - 1) })));
      
      // Simular jogos da liga em background
      let newTable = leagueTable.map(t => {
          if (t.id !== userTeam?.id) {
               const gf = Math.floor(Math.random() * 4);
               const ga = Math.floor(Math.random() * 4);
               return { ...t, played: t.played + 1, gf: t.gf + gf, ga: t.ga + ga, points: t.points + (gf > ga ? 3 : gf === ga ? 1 : 0), won: t.won + (gf > ga ? 1 : 0), drawn: t.drawn + (gf === ga ? 1 : 0), lost: t.lost + (gf < ga ? 1 : 0) };
          }
          return t;
      });
      
      setLeagueTable(newTable);
      checkLeagueChampion(newTable);
  };

  const checkLeagueChampion = (table: TeamStats[]) => {
      // Se o time do usuário completou 38 jogos
      const myStats = table.find(t => t.id === userTeam?.id);
      if (myStats && myStats.played >= 38) {
          const sorted = [...table].sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga));
          if (sorted[0].id === userTeam?.id) {
               if (!trophies.find(t => t.competition === 'Brasileirão' && t.year === 1)) {
                   setTrophies(prev => [...prev, { id: `bras-${Date.now()}`, name: 'Campeão Nacional', year: 1, competition: 'Brasileirão' }]);
                   setShowLeagueChampion(true);
               }
          }
      }
  };

  const handleSellPlayer = (player: Player) => {
      const sellValue = player.value * 0.8;
      setBudget(b => b + sellValue);
      setSquad(s => s.filter(p => p.id !== player.id));
      addTransaction('sell', `Venda de ${player.name}`, sellValue);
      alert(`${player.name} vendido por $${sellValue.toFixed(1)}M!`);
  };
  
  const openBuyModal = (player: Player) => {
      setSelectedPlayer(player);
      setNegotiationType('buy');
      setNegotiationValues({ salary: player.salary || 20, weeks: 48 });
  };

  const confirmPurchase = () => {
      if (!selectedPlayer) return;
      if (budget >= selectedPlayer.value) {
          setBudget(b => b - selectedPlayer.value);
          setSquad(s => [...s, { ...selectedPlayer, team: userTeam?.name, salary: negotiationValues.salary, contractWeeks: negotiationValues.weeks }]);
          setMarket(m => m.filter(p => p.id !== selectedPlayer.id));
          addTransaction('buy', `Compra de ${selectedPlayer.name}`, -selectedPlayer.value);
          setNegotiationType(null); setSelectedPlayer(null);
          alert(`${selectedPlayer.name} contratado!`);
      } else { alert("Fundos insuficientes!"); }
  };

  const openRenewModal = (player: Player) => {
      setSelectedPlayer(player);
      setNegotiationType('renew');
      setNegotiationValues({ salary: Math.floor((player.salary || 20) * 1.1), weeks: 52 });
  };

  const confirmRenewal = () => {
      if (!selectedPlayer) return;
      const bonus = selectedPlayer.value * 0.05;
      if (budget >= bonus) {
          setBudget(b => b - bonus);
          setSquad(prev => prev.map(p => p.id === selectedPlayer.id ? { ...p, salary: negotiationValues.salary, contractWeeks: p.contractWeeks + negotiationValues.weeks } : p));
          addTransaction('renewal', `Renovação ${selectedPlayer.name}`, -bonus);
          setNegotiationType(null); setSelectedPlayer(null);
          alert("Contrato Renovado!");
      } else { alert(`Sem fundos para luvas ($${bonus.toFixed(1)}M)`); }
  };

  const openLoanModal = async (player: Player) => {
      setSelectedPlayer(player);
      setLoanModalOpen(true);
      setLoanOffers(await generateLoanOffers());
  };

  const confirmLoan = (offer: {name: string, wageSplit: number}) => {
      if (!selectedPlayer) return;
      setSquad(prev => prev.map(p => p.id === selectedPlayer.id ? { ...p, isLoaned: true, team: offer.name } : p));
      setLoanModalOpen(false); setSelectedPlayer(null);
      alert(`${selectedPlayer.name} emprestado para ${offer.name}!`);
  };

  // --- SOCIAL ACTIONS ---
  const handleLikePost = (id: string) => {
      setSocialPosts(prev => prev.map(p => p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.likes + (p.isLiked ? -1 : 1) } : p));
  };

  const handleCommentPost = (id: string) => {
      const text = commentText[id];
      if (!text) return;
      setSocialPosts(prev => prev.map(p => p.id === id ? { ...p, comments: [...p.comments, { id: Math.random().toString(), author: "Você", text }] } : p));
      setCommentText(prev => ({ ...prev, [id]: '' }));
  };

  // --- MATCH LOGIC ---

  const applyInGameTactic = (tacticType: string) => {
      setActiveIngameTactic(tacticType);
      // Chance de gol imediato
      if (Math.random() > 0.3) {
          setTimeout(() => {
               setMatchEvents(prev => [...prev, { minute: simTime + 2, description: `GOL! A tática ${tacticType} funcionou!`, type: 'goal', team: 'home' }]);
               setCurrentScore(s => ({ ...s, home: s.home + 1 }));
          }, 500);
      }
      setTimeout(() => setActiveIngameTactic(null), 5000); // Efeito dura 5s na UI
  };

  const startMatch = async (overrideOpponent?: Team, isLibertadores = false, forceVisual = false) => {
      let opponentTeam = overrideOpponent;
      if (!opponentTeam) {
        // Na liga, pega um oponente ficticio da tabela que nao seja o usuario
        const opponents = leagueTable.filter(t => t.id !== userTeam?.id);
        // Ensure opponent has colors if generic
        const genericOpp = opponents[Math.floor(Math.random() * opponents.length)];
        opponentTeam = { 
            id: genericOpp.id, 
            name: genericOpp.name, 
            primaryColor: 'bg-slate-700', 
            secondaryColor: 'text-white' 
        };
      }
      
      setCurrentOpponent(opponentTeam);
      setIsLibertadoresMatch(isLibertadores);
      
      if (isLibertadores && !forceVisual) {
          setSimulatingLibertadores(true);
          const result = await simulateMatchWithGemini(userTeam!, squad, opponentTeam, tactics, true);
          setMatchEvents(result.events);
          updateLeagueTable(result, true);
          setSimulatingLibertadores(false);
          alert(`FIM DE JOGO: ${userTeam!.name} ${result.homeScore} x ${result.awayScore} ${opponentTeam.name}\n\n${result.summary}`);
          return;
      }

      setPreparingVisualMatch(true);
      const result = await simulateMatchWithGemini(userTeam!, squad, opponentTeam, tactics);
      setMatchEvents(result.events);
      setPreparingVisualMatch(false);
      setIsVisualMatch(true);
      setSimTime(0);
      setCurrentScore({ home: 0, away: 0 });
      setHomePlayerPos(Array(10).fill(0).map(() => ({ x: 30 + Math.random() * 20, y: 10 + Math.random() * 80 })));
      setAwayPlayerPos(Array(10).fill(0).map(() => ({ x: 60 + Math.random() * 20, y: 10 + Math.random() * 80 })));

      const interval = setInterval(() => {
          setSimTime(t => {
              if (t >= 90) { clearInterval(interval); setIsVisualMatch(false); updateLeagueTable(result, isLibertadores); return 90; }
              // Movimentação aleatória dos jogadores
              setHomePlayerPos(prev => prev.map(p => ({ x: Math.max(5, Math.min(95, p.x + (Math.random()-0.5)*4)), y: Math.max(5, Math.min(95, p.y + (Math.random()-0.5)*4)) })));
              setAwayPlayerPos(prev => prev.map(p => ({ x: Math.max(5, Math.min(95, p.x + (Math.random()-0.5)*4)), y: Math.max(5, Math.min(95, p.y + (Math.random()-0.5)*4)) })));
              setBallPosition({ x: 50 + (Math.random() - 0.5) * 80, y: 50 + (Math.random() - 0.5) * 80 });
              
              // Verificar eventos
              const event = result.events.find(e => e.minute === t);
              if (event && event.type === 'goal') {
                   if (event.team === 'home') setCurrentScore(s => ({...s, home: s.home + 1}));
                   else setCurrentScore(s => ({...s, away: s.away + 1}));
              }
              return t + 1;
          });
      }, 150);
  };

  const simulateCareerMatch = async () => {
      if (!careerData) return;
      setSimulatingCareer(true);
      
      // Delay rápido para simulação (0.8s)
      await new Promise(resolve => setTimeout(resolve, 800));

      // Lógica: Jogador sempre joga bem
      const playerGoals = Math.floor(Math.random() * 2) + 1; // 1 ou 2 gols
      const playerAssists = 1; // Sempre 1 assistência
      
      const teamGoals = playerGoals + playerAssists + Math.floor(Math.random() * 2); // Time faz gols do jogador + assistencia + extra
      const oppGoals = Math.floor(Math.random() * teamGoals); // Oponente geralmente perde ou empata apertado

      const result: MatchResult = {
          homeScore: teamGoals,
          awayScore: oppGoals,
          events: [], // Não importa para simulação rápida
          summary: "Vitória liderada pelo craque!",
          opponentName: generateFictionalTeamName(),
          win: teamGoals > oppGoals,
          draw: teamGoals === oppGoals
      };

      // Atualiza dados da carreira
      setCareerData(prev => {
          if (!prev) return null;
          return {
              ...prev,
              matchesPlayed: prev.matchesPlayed + 1,
              goals: prev.goals + playerGoals,
              assists: prev.assists + playerAssists,
              rating: prev.rating + 0.1
          };
      });

      // Atualiza tabela da liga simulada no fundo
      updateLeagueTable(result, false);

      setSimulatingCareer(false);
      alert(`FIM DE JOGO!\n\n${careerData.teamName} ${teamGoals} x ${oppGoals} ${result.opponentName}\n\nSeu desempenho:\n⚽ ${playerGoals} Gols\n👟 ${playerAssists} Assistência\n⭐ Melhor em Campo`);
  };

  const updateLeagueTable = (result: MatchResult, isLibertadores: boolean) => {
       if (isLibertadores) {
           setLibertadoresData(prev => {
               if (!prev) return null;
               const newGroups = [...prev.groups];
               const currentGroup = newGroups[prev.currentGroupIndex];
               const oppIndex = currentGroup.opponents.findIndex(o => !o.played && o.team.name === result.opponentName);
               if (oppIndex >= 0) {
                   const finalHome = currentScore.home > 0 ? currentScore.home : result.homeScore;
                   const finalAway = currentScore.away > 0 ? currentScore.away : result.awayScore;
                   
                   currentGroup.opponents[oppIndex] = { ...currentGroup.opponents[oppIndex], played: true, result: `${finalHome} - ${finalAway}`, win: finalHome > finalAway };
                   if (currentGroup.opponents.every(o => o.played)) {
                       currentGroup.completed = true;
                       if (prev.currentGroupIndex < prev.groups.length - 1) {
                           setTimeout(() => alert(`Grupo ${currentGroup.name} Concluído!`), 500);
                           return { ...prev, groups: newGroups, currentGroupIndex: prev.currentGroupIndex + 1 };
                       } else {
                            // Ganhou a libertadores
                            setTrophies(prevT => {
                                if (prevT.find(t => t.id.startsWith('lib'))) return prevT;
                                return [...prevT, { id: `lib-${Date.now()}`, name: 'Taça Continental', year: 1, competition: 'Copa dos Campeões' }];
                            });
                            setShowLibertadoresCelebration(true);
                       }
                   }
               }
               return { ...prev, groups: newGroups };
           });
           setIsLibertadoresMatch(false);
           return;
       }

       // Atualiza tabela da liga (considerando gols marcados no visual ou simulação)
       const finalHomeScore = isVisualMatch ? currentScore.home : result.homeScore;
       const finalAwayScore = isVisualMatch ? currentScore.away : result.awayScore;

       setLeagueTable(prev => {
           const newTable = prev.map(t => {
                if (t.id === userTeam?.id) {
                    return { ...t, played: t.played + 1, gf: t.gf + finalHomeScore, ga: t.ga + finalAwayScore, won: t.won + (finalHomeScore > finalAwayScore ? 1 : 0), drawn: t.drawn + (finalHomeScore === finalAwayScore ? 1 : 0), lost: t.lost + (finalHomeScore < finalAwayScore ? 1 : 0), points: t.points + (finalHomeScore > finalAwayScore ? 3 : (finalHomeScore === finalAwayScore ? 1 : 0)) };
                }
                return t;
            });
            checkLeagueChampion(newTable);
            return newTable;
       });
       
       setWeek(w => w + 1);
  };

  // --- RENDERERS ---

  const renderDashboard = () => (
    <div className="p-4 md:p-8 space-y-6 pb-24 lg:pb-8">
      {showLeagueChampion && <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8 text-center"><Crown size={100} className="text-yellow-400 mb-6 animate-bounce" /><h1 className="text-5xl font-bold text-yellow-400 mb-4">CAMPEÃO BRASILEIRO!</h1><p className="text-white text-xl mb-8">Sua equipe dominou o campeonato.</p><button onClick={() => {setShowLeagueChampion(false); setView('trophies');}} className="bg-yellow-500 text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">Ver Sala de Troféus</button></div>}
      
      <header className="flex justify-between items-center">
        <div><h2 className="text-2xl md:text-3xl font-bold text-slate-800">Início</h2><p className="text-slate-500">Bem-vindo ao {userTeam?.name}</p></div>
        <button onClick={handleSkipWeek} className="flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-bold hover:bg-amber-200 transition-colors border border-amber-200"><CalendarClock size={20} /><span className="hidden md:inline">Pular Semana</span></button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
             <button onClick={() => setView('match')} className="p-6 bg-slate-900 text-white rounded-2xl shadow-lg flex flex-col justify-between min-h-[160px]"><MonitorPlay size={32} className="text-emerald-400" /><h3 className="text-2xl font-bold mt-4">Ir para o Jogo</h3></button>
             <button onClick={() => setView(libertadoresData ? 'libertadores-hub' : 'libertadores-select')} className="p-6 bg-gradient-to-br from-yellow-700 to-yellow-900 text-white rounded-2xl shadow-lg flex flex-col justify-between min-h-[160px]"><Globe2 size={32} className="text-yellow-400" /><h3 className="text-xl font-bold mt-4">Copa dos Campeões</h3></button>
             <button onClick={() => { setView(careerData ? 'career-hub' : 'career-intro'); }} className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl shadow-lg flex flex-col justify-between min-h-[160px]"><Star size={32} className="text-yellow-300" /><h3 className="text-2xl font-bold mt-4">Rumo ao Estrelato</h3></button>
             <button onClick={() => setShowFinances(true)} className="p-6 bg-emerald-600 text-white rounded-2xl shadow-lg flex flex-col justify-between min-h-[160px]"><Wallet size={28} /><h3 className="text-xl font-bold mt-4">Finanças: ${budget.toFixed(1)}M</h3></button>
        </div>
        <Card title="Classificação" action={<button onClick={() => setView('standings')} className="text-xs text-blue-600 font-bold">Ver Tudo</button>}>
            <table className="w-full text-left text-sm"><tbody>{leagueTable.sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga)).slice(0, 5).map((t, i) => (<tr key={t.id} className="border-b"><td className="py-2">{i + 1}º</td><td className="py-2">{t.name}</td><td className="py-2 font-bold">{t.points}</td></tr>))}</tbody></table>
        </Card>
      </div>
      {showFinances && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white p-6 rounded-2xl w-full max-w-lg"><h3 className="font-bold text-lg mb-4">Finanças</h3><p className="mb-4">Saldo: ${budget.toFixed(1)}M</p><button onClick={() => setShowFinances(false)} className="bg-slate-200 px-4 py-2 rounded">Fechar</button></div></div>}
    </div>
  );

  const renderLibertadoresHub = () => {
      if (!libertadoresData) return null;
      const currentGroup = libertadoresData.groups[libertadoresData.currentGroupIndex];
      const nextOpponent = currentGroup.opponents.find(o => !o.played);
      
      return (
          <div className="p-4 md:p-8 bg-slate-900 text-white min-h-screen">
              {simulatingLibertadores && <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center"><h3 className="text-2xl font-bold animate-pulse">Simulando...</h3></div>}
              {showLibertadoresCelebration && <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8 text-center"><Crown size={100} className="text-yellow-400 mb-6" /><h1 className="text-5xl font-bold text-yellow-400 mb-4">CAMPEÃO CONTINENTAL!</h1><button onClick={() => {setShowLibertadoresCelebration(false); setView('trophies'); setLibertadoresData(null);}} className="bg-yellow-500 text-black px-8 py-3 rounded-full font-bold">Ver Troféus</button></div>}
              
              <div className="flex justify-between mb-8"><h2 className="text-3xl font-bold text-yellow-400">{libertadoresData.myTeam.name} - {currentGroup.name}</h2><button onClick={() => setView('dashboard')} className="text-sm border px-3 py-1 rounded">Voltar</button></div>
              <div className="grid lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl">
                       {currentGroup.opponents.map((opp, idx) => (
                           <div key={idx} className={`flex justify-between p-4 border-b border-slate-700 ${!opp.played && opp === nextOpponent ? 'bg-slate-700' : ''}`}>
                               <span className={!opp.played && opp === nextOpponent ? 'text-yellow-400 font-bold' : ''}>{opp.team.name}</span>
                               {opp.played ? <span className="font-mono font-bold">{opp.result}</span> : <Lock size={16} />}
                           </div>
                       ))}
                       {nextOpponent && (
                           <div className="grid grid-cols-2 gap-4 mt-6">
                               <button onClick={() => startMatch(nextOpponent.team, true, false)} className="bg-yellow-600 py-4 rounded-xl font-bold text-xl hover:bg-yellow-500">SIMULAR RÁPIDO</button>
                               <button onClick={() => startMatch(nextOpponent.team, true, true)} className="bg-emerald-600 py-4 rounded-xl font-bold text-xl hover:bg-emerald-500">ASSISTIR 2D</button>
                           </div>
                       )}
                   </div>
              </div>
          </div>
      );
  };

  const renderMarket = () => (
      <div className="p-4 md:p-8 pb-24">
          <h2 className="text-2xl font-bold mb-6">Mercado (Saldo: ${budget.toFixed(1)}M)</h2>
          <div className="bg-white rounded-xl shadow border border-slate-200">
              {market.map(player => (
                  <PlayerRow key={player.id} player={player} showPrice actionButton={<button onClick={() => openBuyModal(player)} className="bg-emerald-600 text-white text-xs px-3 py-1 rounded font-bold">Comprar</button>} />
              ))}
          </div>
          {negotiationType === 'buy' && selectedPlayer && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white p-6 rounded-2xl w-full max-w-md"><h3 className="font-bold text-lg mb-4">Comprar {selectedPlayer.name}</h3><div className="space-y-4"><div><label>Salário: ${negotiationValues.salary}k</label><input type="range" min="10" max="500" value={negotiationValues.salary} onChange={(e) => setNegotiationValues({...negotiationValues, salary: parseInt(e.target.value)})} className="w-full" /></div><div><label>Contrato: {negotiationValues.weeks} semanas</label><input type="range" min="12" max="150" value={negotiationValues.weeks} onChange={(e) => setNegotiationValues({...negotiationValues, weeks: parseInt(e.target.value)})} className="w-full" /></div><button onClick={confirmPurchase} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">Confirmar ($ {selectedPlayer.value}M)</button><button onClick={() => setNegotiationType(null)} className="w-full py-2 text-slate-500">Cancelar</button></div></div></div>
          )}
      </div>
  );

  const renderSquad = () => (
      <div className="p-4 md:p-8 pb-24">
          <h2 className="text-2xl font-bold mb-6">Elenco</h2>
          <div className="bg-white rounded-xl shadow border border-slate-200">
              {squad.map(player => <PlayerRow key={player.id} player={player} onSell={handleSellPlayer} onLoan={openLoanModal} onRenew={openRenewModal} />)}
          </div>
          {loanModalOpen && selectedPlayer && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white p-6 rounded-2xl w-full max-w-md"><h3 className="font-bold text-lg mb-4">Emprestar {selectedPlayer.name}</h3>{loanOffers.map((o, i) => <button key={i} onClick={() => confirmLoan(o)} className="w-full p-3 border mb-2 rounded text-left hover:bg-slate-50"><div className="font-bold">{o.name}</div><div className="text-sm text-slate-500">Paga {o.wageSplit}% salário</div></button>)}<button onClick={() => setLoanModalOpen(false)} className="w-full py-2 text-slate-500 mt-2">Cancelar</button></div></div>
          )}
          {negotiationType === 'renew' && selectedPlayer && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white p-6 rounded-2xl w-full max-w-md"><h3 className="font-bold text-lg mb-4">Renovar com {selectedPlayer.name}</h3><div className="space-y-4"><div><label>Novo Salário: ${negotiationValues.salary}k</label><input type="range" min="10" max="500" value={negotiationValues.salary} onChange={(e) => setNegotiationValues({...negotiationValues, salary: parseInt(e.target.value)})} className="w-full" /></div><div><label>Extensão: +{negotiationValues.weeks} semanas</label><input type="range" min="10" max="150" value={negotiationValues.weeks} onChange={(e) => setNegotiationValues({...negotiationValues, weeks: parseInt(e.target.value)})} className="w-full" /></div><button onClick={confirmRenewal} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">Renovar</button><button onClick={() => setNegotiationType(null)} className="w-full py-2 text-slate-500">Cancelar</button></div></div></div>
          )}
      </div>
  );

  const renderSocial = () => (
      <div className="p-4 md:p-8 pb-24">
          <h2 className="text-2xl font-bold mb-4">Rede Social</h2>
          <div className="space-y-4">
            {socialPosts.map(p => (
                <Card key={p.id}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center"><User size={20} /></div>
                        <div>
                            <div className="font-bold">{p.authorName}</div>
                            <div className="text-xs text-slate-500">{p.teamName} • {p.timeAgo}</div>
                        </div>
                    </div>
                    <p className="mb-4">{p.content}</p>
                    <div className="h-48 bg-slate-100 rounded-lg mb-4 flex items-center justify-center text-slate-400">
                        {p.imageType === 'match' && <MonitorPlay size={40} />}
                        {p.imageType === 'training' && <Activity size={40} />}
                        {p.imageType === 'celebration' && <Trophy size={40} />}
                        {p.imageType === 'leisure' && <Smartphone size={40} />}
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 border-t pt-3">
                        <button onClick={() => handleLikePost(p.id)} className={`flex items-center gap-1 ${p.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}>
                            <Heart size={20} fill={p.isLiked ? 'currentColor' : 'none'} /> {p.likes}
                        </button>
                        <div className="flex-1 flex gap-2">
                            <input 
                                value={commentText[p.id] || ''} 
                                onChange={(e) => setCommentText({...commentText, [p.id]: e.target.value})} 
                                placeholder="Comente algo..." 
                                className="w-full text-sm border-b bg-transparent focus:outline-none" 
                            />
                            <button onClick={() => handleCommentPost(p.id)} className="text-emerald-600 font-bold text-sm">Enviar</button>
                        </div>
                    </div>
                    {p.comments.length > 0 && (
                        <div className="mt-3 bg-slate-50 p-2 rounded text-sm space-y-1">
                            {p.comments.map(c => <div key={c.id}><b>{c.author}:</b> {c.text}</div>)}
                        </div>
                    )}
                </Card>
            ))}
          </div>
      </div>
  );

  const renderTrophies = () => (
      <div className="p-4 md:p-8">
          <h2 className="text-2xl font-bold mb-6">Sala de Troféus</h2>
          {trophies.length === 0 ? (
              <div className="text-center text-slate-500 py-10">Ainda não há troféus. Vença campeonatos!</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {trophies.map(t => (
                    <div key={t.id} className="p-6 border border-amber-200 bg-gradient-to-b from-amber-50 to-white rounded-xl flex flex-col items-center text-center shadow-sm">
                        <div className="bg-amber-100 p-4 rounded-full mb-3">
                            <Crown size={40} className="text-amber-500" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800">{t.name}</h3>
                        <p className="text-sm text-amber-700 font-medium">{t.competition}</p>
                    </div>
                ))}
            </div>
          )}
      </div>
  );
  
  // --- CAREER MODE ---
  
  const startCareer = async () => {
      setCareerStep('amateur-match');
      // Simula jogo amador
      setTimeout(async () => {
          setCareerStep('offers');
          setCareerOffersList(await generateCareerOffers(careerTempPos));
      }, 3000);
  };

  const acceptCareerOffer = (offer: any) => {
      setCareerStep('signing'); // Mostra tela de assinatura

      setTimeout(() => {
          setCareerData({
              playerName: careerTempName,
              position: careerTempPos,
              teamName: offer.name,
              teamColor: offer.color,
              matchesPlayed: 0,
              goals: 0,
              assists: 0,
              rating: 65,
              history: [],
              cash: 0,
              inventory: [],
              season: 1,
              trophies: []
          });
          // CORREÇÃO CRÍTICA: Atualizar view para o hub ao mesmo tempo que o step
          setCareerStep('hub');
          setView('career-hub');
      }, 3000); // 3 segundos de "assinatura"
  };

  const renderCareerIntro = () => (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          {careerStep === 'intro' && (
            <div className="bg-white p-8 rounded-2xl w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-slate-800">Rumo ao Estrelato</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Nome do Jogador</label>
                        <input className="w-full border p-3 rounded-lg bg-slate-50" placeholder="Ex: Allejo" value={careerTempName} onChange={e => setCareerTempName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Posição</label>
                        <select className="w-full border p-3 rounded-lg bg-slate-50" value={careerTempPos} onChange={(e) => setCareerTempPos(e.target.value as Position)}>
                            <option value={Position.ATT}>Atacante</option>
                            <option value={Position.MID}>Meio-Campo</option>
                            <option value={Position.DEF}>Defensor</option>
                            <option value={Position.GK}>Goleiro</option>
                        </select>
                    </div>
                    <button onClick={startCareer} disabled={!careerTempName} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg mt-4 disabled:opacity-50">
                        Iniciar Jornada
                    </button>
                </div>
            </div>
          )}
          
          {careerStep === 'amateur-match' && (
              <div className="text-center text-white">
                  <Activity size={64} className="mx-auto text-emerald-400 animate-pulse mb-4" />
                  <h2 className="text-2xl font-bold">Disputando Peneira Amadora...</h2>
                  <p className="text-slate-400">Mostre seu valor para os olheiros!</p>
              </div>
          )}

          {careerStep === 'signing' && (
              <div className="text-center text-white">
                  <div className="relative mx-auto w-20 h-20 mb-6">
                       <div className="absolute inset-0 bg-emerald-500 rounded-full opacity-20 animate-ping"></div>
                       <div className="relative bg-slate-800 rounded-full p-4 border-2 border-emerald-500 flex items-center justify-center w-full h-full">
                            <PenTool size={32} className="text-emerald-400" />
                       </div>
                  </div>
                  <h2 className="text-3xl font-bold mb-2 animate-pulse">Assinando Contrato...</h2>
                  <p className="text-slate-400">Oficializando sua transferência e apresentação.</p>
              </div>
          )}

          {careerStep === 'offers' && (
              <div className="w-full max-w-4xl">
                  <h2 className="text-3xl font-bold text-white text-center mb-8">Propostas Recebidas</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                      {careerOffersList.map((offer, idx) => (
                          <div key={idx} className="bg-white rounded-xl p-6 flex flex-col items-center transform hover:scale-105 transition-transform">
                              <div className={`w-16 h-16 rounded-full ${offer.color} flex items-center justify-center text-white font-bold text-xl mb-4`}>
                                  {offer.name.substring(0, 2)}
                              </div>
                              <h3 className="font-bold text-xl text-center mb-2">{offer.name}</h3>
                              <p className="text-emerald-600 font-bold mb-6">${offer.salary}k / semana</p>
                              <button onClick={() => acceptCareerOffer(offer)} className="w-full py-2 bg-slate-900 text-white rounded-lg font-bold">Assinar Contrato</button>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>
  );

  const renderCareerHub = () => careerData ? (
      <div className="p-4 md:p-8 pb-24">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-2xl mb-8">
              <div className="flex items-center justify-between">
                  <div>
                      <h2 className="text-3xl font-bold">{careerData.playerName}</h2>
                      <p className="text-slate-400">{careerData.teamName} | {careerData.position} | OVR {careerData.rating.toFixed(1)}</p>
                  </div>
                  <div className={`w-16 h-16 rounded-full ${careerData.teamColor} flex items-center justify-center font-bold text-xl`}>
                      {careerData.teamName.substring(0, 2)}
                  </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/10 p-3 rounded-lg">
                      <div className="text-2xl font-bold">{careerData.matchesPlayed}/90</div>
                      <div className="text-xs uppercase tracking-wider">Partidas</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg">
                      <div className="text-2xl font-bold">{careerData.goals}</div>
                      <div className="text-xs uppercase tracking-wider">Gols</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg">
                      <div className="text-2xl font-bold">{careerData.assists}</div>
                      <div className="text-xs uppercase tracking-wider">Assist.</div>
                  </div>
              </div>
          </div>
          
          {simulatingCareer && (
              <div className="bg-emerald-100 text-emerald-800 p-4 rounded-xl mb-6 flex items-center gap-3 animate-pulse font-bold">
                  <Activity /> Simulando partida... O craque está em campo!
              </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
              <button 
                  disabled={simulatingCareer}
                  onClick={simulateCareerMatch} 
                  className="p-8 bg-emerald-600 text-white rounded-2xl shadow-lg font-bold text-xl flex items-center justify-center gap-4 hover:bg-emerald-500 transition-colors disabled:opacity-50"
              >
                  <PlayCircle size={32} /> JOGAR PRÓXIMA PARTIDA
              </button>
              
              <div className="bg-white rounded-2xl p-6 shadow">
                  <h3 className="font-bold mb-4">Objetivos da Temporada</h3>
                  <ul className="space-y-3">
                      <li className="flex items-center gap-2"><div className={`w-5 h-5 rounded-full border flex items-center justify-center ${careerData.matchesPlayed >= 20 ? 'bg-green-500 text-white' : ''}`}><CheckCircle size={14} /></div> Jogar 20 partidas</li>
                      <li className="flex items-center gap-2"><div className={`w-5 h-5 rounded-full border flex items-center justify-center ${careerData.goals >= 10 ? 'bg-green-500 text-white' : ''}`}><CheckCircle size={14} /></div> Marcar 10 gols</li>
                  </ul>
              </div>
          </div>

          <button onClick={() => { setCareerData(null); setCareerStep('intro'); }} className="mt-8 text-red-500 text-sm font-bold">Aposentar Jogador (Sair)</button>
      </div>
  ) : null;

  const renderMatch = () => {
      if (isVisualMatch || preparingVisualMatch) {
          return (
            <div className="min-h-screen bg-slate-900 p-4 flex flex-col items-center">
               <div className="w-full max-w-4xl flex justify-between items-center text-white mb-4 px-4">
                   <div className="text-center">
                       <div className="font-bold text-xl">{userTeam?.name}</div>
                       <div className="text-4xl font-bold">{currentScore.home}</div>
                   </div>
                   <div className="text-center">
                       <div className="font-bold text-xl">{currentOpponent?.name}</div>
                       <div className="text-4xl font-bold">{currentScore.away}</div>
                   </div>
               </div>
               
               <SoccerField homeTeam={userTeam!} awayTeam={currentOpponent!} gameTime={simTime} ballPos={ballPosition} homePositions={homePlayerPos} awayPositions={awayPlayerPos} activeTactic={activeIngameTactic} />
               
               {/* Tactics Bar */}
               <div className="w-full max-w-4xl mt-4 grid grid-cols-3 gap-2 md:gap-4">
                   <button onClick={() => applyInGameTactic("PRESSÃO")} className="bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-transform"><Zap size={20} /> PRESSÃO ALTA</button>
                   <button onClick={() => applyInGameTactic("TIKI-TAKA")} className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-transform"><Activity size={20} /> POSSE</button>
                   <button onClick={() => applyInGameTactic("CONTRA-ATAQUE")} className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-transform"><MoveRight size={20} /> CONTRA-ATAQUE</button>
               </div>

               <div className="mt-4 w-full max-w-4xl bg-black/50 p-4 rounded text-emerald-400 h-32 overflow-y-auto font-mono text-sm">
                   {matchEvents.filter(e => e.minute <= simTime).map((e,i) => <div key={i} className="mb-1 border-b border-white/10 pb-1">> {e.minute}' {e.description}</div>)}
               </div>
            </div>
          )
      }
      return (
        <div className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Dia de Jogo - Brasileirão</h2>
            <div className="flex justify-center gap-8 mb-8 items-center bg-white p-8 rounded-2xl shadow-lg max-w-3xl mx-auto">
                <div className="text-center">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-bold shadow-lg ${userTeam?.primaryColor} ${userTeam?.secondaryColor}`}>{userTeam?.name.substring(0,3)}</div>
                    <div className="mt-2 font-bold">{userTeam?.name}</div>
                </div>
                <span className="text-4xl font-bold text-slate-300">VS</span>
                <div className="text-center">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-bold shadow-lg ${currentOpponent?.primaryColor} ${currentOpponent?.secondaryColor}`}>{currentOpponent?.name.substring(0,3)}</div>
                    <div className="mt-2 font-bold">{currentOpponent?.name}</div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <button onClick={() => startMatch(undefined, false, false)} className="bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-slate-700">Simular Resultado</button>
                <button onClick={() => startMatch(undefined, false, true)} className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-emerald-500 shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"><MonitorPlay /> Assistir Partida 2D</button>
            </div>
        </div>
      );
  }

  const renderLibertadoresSelect = () => {
    const teams = getLibertadoresTeams();
    return (
        <div className="p-4 md:p-8 bg-slate-900 min-h-screen">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setView('dashboard')} className="bg-slate-700 text-white p-3 rounded-full hover:bg-slate-600"><ArrowLeft /></button>
                <div>
                    <h2 className="text-3xl text-white font-extrabold tracking-tight">Copa dos Campeões</h2>
                    <p className="text-slate-400">Selecione seu clube para a glória continental</p>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {teams.map(t => (
                    <button 
                        key={t.id} 
                        onClick={() => handleLibertadoresSelect(t)} 
                        className={`relative group p-6 ${t.primaryColor} ${t.secondaryColor} rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-40 flex flex-col items-center justify-center text-center border-2 border-transparent hover:border-white/50`}
                    >
                        <div className="w-14 h-14 rounded-full bg-black/20 flex items-center justify-center mb-3 font-bold text-xl shadow-inner">
                            {t.name.substring(0,2).toUpperCase()}
                        </div>
                        <span className="font-bold text-lg leading-tight">{t.name}</span>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Medal size={20} />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
  }

  if (view === 'select-team') return <TeamSelection onSelect={handleTeamSelect} />;
  if (view === 'libertadores-select') return renderLibertadoresSelect();
  // Quando está na carreira (fase inicial), renderiza tela cheia
  if ((view === 'career-intro' || view === 'career-hub') && careerStep !== 'hub') return renderCareerIntro();

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col lg:flex-row">
      <Sidebar currentView={view} onChangeView={setView} team={userTeam} />
      <main className="flex-1 overflow-y-auto h-screen no-scrollbar relative">
        {view === 'dashboard' && renderDashboard()}
        {view === 'match' && renderMatch()}
        {view === 'squad' && renderSquad()}
        {view === 'market' && renderMarket()}
        {view === 'standings' && <div className="p-8"><h2 className="font-bold text-2xl mb-4">Tabela - Rodada {Math.floor(leagueTable[0]?.played || 0)}/38</h2>{leagueTable.sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga)).map((t, i) => <div key={t.id} className={`flex justify-between border-b p-3 ${i === 0 ? 'bg-yellow-50 font-bold' : ''}`}><span>{i+1}. {t.name}</span><div className="flex gap-4"><span>{t.won}V {t.drawn}E {t.lost}D</span><span>{t.points} pts</span></div></div>)}</div>}
        {view === 'trophies' && renderTrophies()}
        {view === 'social' && renderSocial()}
        {view === 'career-intro' && renderCareerIntro()}
        {view === 'career-hub' && renderCareerHub()}
        {view === 'libertadores-hub' && renderLibertadoresHub()}
      </main>
      <MobileNav currentView={view} onChangeView={setView} team={userTeam} />
    </div>
  );
}
