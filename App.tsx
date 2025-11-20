import React, { useState } from 'react';
import { BRAZILIAN_TEAMS, Team, Player, ViewState, MatchResult, Position, TeamStats } from './types';
import { generateSquadForTeam, generateTransferMarket, simulateMatchWithGemini, generateScoutReport } from './services/geminiService';
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
    ListOrdered
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
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">BRAZUCA MANAGER <span className="text-emerald-400">AI</span></h1>
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
        { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'match', label: 'Jogar', icon: PlayCircle },
        { id: 'standings', label: 'Tabela', icon: ListOrdered },
        { id: 'squad', label: 'Elenco', icon: Users },
        { id: 'market', label: 'Transferências', icon: ArrowLeftRight },
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

// Main App Component
export default function App() {
  const [view, setView] = useState<ViewState>('select-team');
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [squad, setSquad] = useState<Player[]>([]);
  const [market, setMarket] = useState<Player[]>([]);
  const [budget, setBudget] = useState<number>(50); // Millions
  const [loading, setLoading] = useState<boolean>(false);
  
  // Match State
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [leagueTable, setLeagueTable] = useState<TeamStats[]>([]);

  // Rumo ao Estrelato State
  const [rtsStep, setRtsStep] = useState<'form' | 'simulating' | 'offers'>('form');
  const [createdPlayer, setCreatedPlayer] = useState<{name: string, position: Position} | null>(null);
  const [scoutText, setScoutText] = useState<string>("");
  const [contractOffers, setContractOffers] = useState<Team[]>([]);

  // Logic to initialize table
  const initializeTable = () => {
      const initialTable: TeamStats[] = BRAZILIAN_TEAMS.map(t => ({
          id: t.id,
          name: t.name,
          points: 0,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          gf: 0,
          ga: 0
      }));
      setLeagueTable(initialTable);
  };

  // Initialization logic
  const handleTeamSelect = async (team: Team) => {
    setLoading(true);
    try {
        const players = await generateSquadForTeam(team.name);
        setUserTeam(team);
        setSquad(players);
        initializeTable();
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

  const handleLogout = () => {
    // Full reset state
    setSquad([]);
    setMarket([]);
    setMatchResult(null);
    setUserTeam(null);
    setView('select-team');
    setBudget(50);
    setIsSimulating(false);
    setLeagueTable([]);
    // Reset RTS state
    setRtsStep('form');
    setCreatedPlayer(null);
    setScoutText("");
    setContractOffers([]);
  };

  // Handlers
  const handleSellPlayer = (player: Player) => {
      const sellValue = player.value * 0.9; // Sell for slightly less
      setBudget(prev => prev + sellValue);
      setSquad(prev => prev.filter(p => p.id !== player.id));
      setMarket(prev => [...prev, player]); 
  };

  const handleBuyPlayer = (player: Player) => {
      if (budget >= player.value) {
          setBudget(prev => prev - player.value);
          setMarket(prev => prev.filter(p => p.id !== player.id));
          setSquad(prev => [...prev, { ...player, team: userTeam?.name }]);
      } else {
          alert("Fundos insuficientes!");
      }
  };

  const handlePlayMatch = async () => {
      if (!userTeam) return;
      setIsSimulating(true);
      setMatchResult(null);
      
      // Pick random opponent different from user
      const potentialOpponents = BRAZILIAN_TEAMS.filter(t => t.id !== userTeam.id);
      const opponent = potentialOpponents[Math.floor(Math.random() * potentialOpponents.length)];
      
      const result = await simulateMatchWithGemini(userTeam, squad, opponent);
      setMatchResult(result);
      
      // UPDATE TABLE LOGIC
      setLeagueTable(prevTable => {
          const newTable = [...prevTable];
          
          // Update User Team Stats
          const userStats = newTable.find(t => t.id === userTeam.id);
          if (userStats) {
              userStats.played += 1;
              userStats.gf += result.homeScore;
              userStats.ga += result.awayScore;
              if (result.win) {
                  userStats.points += 3;
                  userStats.won += 1;
              } else if (result.draw) {
                  userStats.points += 1;
                  userStats.drawn += 1;
              } else {
                  userStats.lost += 1;
              }
          }

          // Update Opponent Stats
          const oppStats = newTable.find(t => t.id === opponent.id);
          if (oppStats) {
              oppStats.played += 1;
              oppStats.gf += result.awayScore;
              oppStats.ga += result.homeScore;
              if (result.awayScore > result.homeScore) {
                  oppStats.points += 3;
                  oppStats.won += 1;
              } else if (result.draw) {
                  oppStats.points += 1;
                  oppStats.drawn += 1;
              } else {
                  oppStats.lost += 1;
              }
          }

          // SIMULATE ROUND FOR OTHER TEAMS (To keep table alive)
          // Pair up remaining teams randomly
          const otherTeams = newTable.filter(t => t.id !== userTeam.id && t.id !== opponent.id);
          for (let i = 0; i < otherTeams.length; i += 2) {
              if (i + 1 < otherTeams.length) {
                  const t1 = otherTeams[i];
                  const t2 = otherTeams[i+1];
                  
                  // Simple random score logic for simulation
                  const score1 = Math.floor(Math.random() * 4);
                  const score2 = Math.floor(Math.random() * 4);
                  
                  t1.played += 1; t2.played += 1;
                  t1.gf += score1; t1.ga += score2;
                  t2.gf += score2; t2.ga += score1;
                  
                  if (score1 > score2) {
                      t1.points += 3; t1.won += 1;
                      t2.lost += 1;
                  } else if (score2 > score1) {
                      t2.points += 3; t2.won += 1;
                      t1.lost += 1;
                  } else {
                      t1.points += 1; t1.drawn += 1;
                      t2.points += 1; t2.drawn += 1;
                  }
              }
          }

          // Sort table: Points > Wins > GD > GF
          return newTable.sort((a, b) => {
              if (b.points !== a.points) return b.points - a.points;
              if (b.won !== a.won) return b.won - a.won;
              const gdA = a.gf - a.ga;
              const gdB = b.gf - b.ga;
              return gdB - gdA;
          });
      });

      setIsSimulating(false);

      if (result.win) setBudget(prev => prev + 2.5); // Prize money
      if (result.draw) setBudget(prev => prev + 1.0);
  };

  // Career Mode Logic
  const startCareerMode = () => {
      setRtsStep('form');
      setCreatedPlayer(null);
      setView('career-mode');
  };

  const handleAmateurMatch = async (name: string, position: Position) => {
      setCreatedPlayer({ name, position });
      setRtsStep('simulating');
      
      // Simulate delay and scout generation
      try {
        const report = await generateScoutReport(name, position);
        setScoutText(report);
        
        // Generate Offers: Cruzeiro + 2 Random
        const cruzeiro = BRAZILIAN_TEAMS.find(t => t.id === 'cru');
        if (!cruzeiro) throw new Error("Cruzeiro not found");
        
        const otherTeams = BRAZILIAN_TEAMS.filter(t => t.id !== 'cru').sort(() => 0.5 - Math.random()).slice(0, 2);
        setContractOffers([cruzeiro, ...otherTeams]);
        
        setRtsStep('offers');
      } catch (e) {
          console.error(e);
          setRtsStep('form'); // Reset on error
      }
  };

  const handleAcceptOffer = async (team: Team) => {
      if (!createdPlayer) return;
      setLoading(true);
      
      try {
        // Initialize as if selecting team normally
        const players = await generateSquadForTeam(team.name);
        
        // Add the custom player
        const newPlayer: Player = {
            id: "my-custom-player",
            name: createdPlayer.name,
            position: createdPlayer.position,
            rating: 78, // Start decent
            age: 18,
            value: 10,
            team: team.name
        };

        setUserTeam(team);
        // Add to top of squad
        setSquad([newPlayer, ...players]);
        initializeTable();
        setView('dashboard');
        generateTransferMarket().then(setMarket);
        
      } catch (error) {
          console.error("Error accepting offer", error);
      } finally {
          setLoading(false);
      }
  };

  // Safely render TeamSelection if view is correct OR if userTeam is null (fallback to prevent white screen)
  // Exception: 'career-mode' doesn't need a userTeam initially
  if (view !== 'career-mode' && (view === 'select-team' || !userTeam)) {
    return <TeamSelection onSelect={handleTeamSelect} />;
  }

  const avgRating = (squad.reduce((acc, p) => acc + p.rating, 0) / (squad.length || 1)).toFixed(0);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      {/* Hide Sidebar in career mode flow to keep focus */}
      {view !== 'career-mode' && (
          <Sidebar 
            currentView={view} 
            onChangeView={setView} 
            team={userTeam} 
          />
      )}
      
      {/* Main Content Area */}
      <main className={`flex-1 p-4 pb-24 lg:p-8 overflow-y-auto h-screen scroll-smooth ${view === 'career-mode' ? 'bg-slate-900 text-white flex items-center justify-center' : ''}`}>
        
        {/* Standard Views Header */}
        {view !== 'career-mode' && (
            <div className="flex flex-row overflow-x-auto md:grid md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8 pb-2 md:pb-0 snap-x snap-mandatory no-scrollbar">
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
            </div>
        )}

        {/* Views Content */}
        
        {view === 'dashboard' && userTeam && (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
                    <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-20 ${userTeam.primaryColor} blur-3xl`}></div>
                    
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-bold mb-2">Bem-vindo, Manager.</h2>
                        <p className="text-slate-300 mb-6 text-sm md:text-base">Sua jornada com o {userTeam.name} começa agora. Prepare o time.</p>
                        <button 
                            onClick={() => setView('match')}
                            className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 w-full md:w-auto justify-center shadow-lg shadow-emerald-900/20"
                        >
                            <PlayCircle size={20} />
                            Ir para a Partida
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Rumo ao Estrelato Card - Replaces Top Players */}
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl shadow-lg overflow-hidden text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="p-6 md:p-8 flex flex-col h-full justify-between relative z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-blue-200">
                                    <Star size={20} />
                                    <span className="text-sm font-bold uppercase tracking-wider">Novo Modo</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Rumo ao Estrelato</h3>
                                <p className="text-blue-100 mb-6 text-sm md:text-base">Crie seu próprio jogador, jogue na várzea e consiga um contrato profissional com um grande clube.</p>
                            </div>
                            <button 
                                onClick={startCareerMode}
                                className="w-full bg-white text-blue-700 font-bold py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <UserPlus size={20} />
                                Criar Jogador
                            </button>
                        </div>
                    </div>

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
                </div>
            </div>
        )}

        {/* Career Mode View */}
        {view === 'career-mode' && (
            <div className="w-full max-w-2xl animate-fade-in">
                {rtsStep === 'form' && (
                    <div className="bg-slate-800 p-6 md:p-10 rounded-2xl shadow-2xl border border-slate-700">
                        <div className="text-center mb-8">
                            <Star size={48} className="text-yellow-400 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-white mb-2">Crie sua Lenda</h2>
                            <p className="text-slate-400">Antes do estrelato, você precisa provar seu valor nos campos de terra.</p>
                        </div>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleAmateurMatch(
                                formData.get('name') as string,
                                formData.get('position') as Position
                            );
                        }} className="space-y-6">
                            <div>
                                <label className="block text-slate-300 text-sm font-bold mb-2">Nome do Jogador</label>
                                <input required name="name" type="text" placeholder="Ex: Allejo" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
                            </div>
                            
                            <div>
                                <label className="block text-slate-300 text-sm font-bold mb-2">Posição</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.values(Position).map((pos) => (
                                        <label key={pos} className="cursor-pointer">
                                            <input type="radio" name="position" value={pos} required className="peer sr-only" />
                                            <div className="text-center p-3 rounded-lg border border-slate-600 bg-slate-900 text-slate-400 peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-500 transition-all">
                                                {pos}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-transform hover:scale-[1.02] mt-4">
                                Jogar Partida Amadora
                            </button>
                            
                            <button type="button" onClick={handleLogout} className="w-full text-slate-500 hover:text-slate-300 text-sm">
                                Cancelar e Voltar
                            </button>
                        </form>
                    </div>
                )}

                {rtsStep === 'simulating' && (
                    <div className="text-center py-12">
                         <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mx-auto mb-6"></div>
                         <h3 className="text-2xl font-bold text-white mb-2">Jogando a Final do Amador...</h3>
                         <p className="text-slate-400">Olheiros de grandes clubes estão na arquibancada.</p>
                    </div>
                )}

                {rtsStep === 'offers' && (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-white mb-4">Parabéns, Craque!</h2>
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 inline-block max-w-xl">
                                <p className="text-emerald-400 italic text-lg">"{scoutText}"</p>
                            </div>
                            <p className="text-slate-400 mt-6">Você recebeu 3 propostas de clubes profissionais.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {contractOffers.map((team, idx) => (
                                <button 
                                    key={team.id}
                                    onClick={() => handleAcceptOffer(team)}
                                    className="bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-emerald-500 p-6 rounded-xl flex flex-col items-center gap-4 transition-all group"
                                >
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shadow-lg ${team.primaryColor} ${team.secondaryColor}`}>
                                        {team.name.substring(0, 3).toUpperCase()}
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-white font-bold text-lg group-hover:text-emerald-400">{team.name}</h3>
                                        <span className="text-xs text-slate-500 uppercase font-bold">Contrato Profissional</span>
                                    </div>
                                    {team.id === 'cru' && (
                                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Recomendado</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        {view === 'squad' && (
            <div className="animate-fade-in">
                <Card title="Elenco Completo">
                    <div className="divide-y divide-slate-100">
                        {squad.sort((a,b) => b.rating - a.rating).map(player => (
                            <PlayerRow 
                                key={player.id} 
                                player={player} 
                                showPrice
                                actionButton={
                                    <button 
                                        onClick={() => handleSellPlayer(player)}
                                        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-md font-medium transition-colors border border-red-200 whitespace-nowrap"
                                    >
                                        Vender
                                    </button>
                                }
                            />
                        ))}
                    </div>
                </Card>
            </div>
        )}

        {view === 'market' && (
            <div className="space-y-4 md:space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg md:text-2xl font-bold text-slate-800">Mercado da Bola</h2>
                    <button 
                        onClick={async () => {
                            const newPlayers = await generateTransferMarket();
                            setMarket(prev => [...newPlayers, ...prev].slice(0, 20));
                        }}
                        className="text-emerald-600 hover:text-emerald-700 text-xs md:text-sm font-medium bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100"
                    >
                        Atualizar
                    </button>
                </div>
                <Card>
                    {market.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            Carregando mercado...
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {market.map(player => (
                                <PlayerRow 
                                    key={player.id} 
                                    player={player} 
                                    showPrice
                                    actionButton={
                                        <button 
                                            onClick={() => handleBuyPlayer(player)}
                                            disabled={budget < player.value}
                                            className={`text-xs px-3 py-2 rounded-md font-medium transition-colors border whitespace-nowrap ${
                                                budget >= player.value 
                                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200' 
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                                            }`}
                                        >
                                            Comprar
                                        </button>
                                    }
                                />
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        )}

        {view === 'standings' && userTeam && (
            <div className="animate-fade-in">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-800">Tabela Brasileirão</h2>
                    <div className="text-sm text-slate-500">Série A</div>
                 </div>
                 <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                     <div className="overflow-x-auto">
                         <table className="w-full text-sm text-left">
                             <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                                 <tr>
                                     <th className="px-4 py-3 font-bold w-10 text-center">#</th>
                                     <th className="px-4 py-3 font-bold">Clube</th>
                                     <th className="px-4 py-3 font-bold text-center">P</th>
                                     <th className="px-4 py-3 font-bold text-center hidden md:table-cell">J</th>
                                     <th className="px-4 py-3 font-bold text-center hidden md:table-cell">V</th>
                                     <th className="px-4 py-3 font-bold text-center hidden md:table-cell">E</th>
                                     <th className="px-4 py-3 font-bold text-center hidden md:table-cell">D</th>
                                     <th className="px-4 py-3 font-bold text-center hidden sm:table-cell">GP</th>
                                     <th className="px-4 py-3 font-bold text-center hidden sm:table-cell">GC</th>
                                     <th className="px-4 py-3 font-bold text-center">SG</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100">
                                 {leagueTable.map((team, index) => {
                                     const isUser = team.id === userTeam.id;
                                     return (
                                         <tr key={team.id} className={`hover:bg-slate-50 transition-colors ${isUser ? 'bg-emerald-50' : ''}`}>
                                             <td className={`px-4 py-3 text-center font-bold ${index < 4 ? 'text-blue-600' : index > 16 ? 'text-red-500' : 'text-slate-500'}`}>
                                                 {index + 1}
                                             </td>
                                             <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                                                 {isUser && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                                                 {team.name}
                                             </td>
                                             <td className="px-4 py-3 text-center font-bold text-slate-900">{team.points}</td>
                                             <td className="px-4 py-3 text-center text-slate-600 hidden md:table-cell">{team.played}</td>
                                             <td className="px-4 py-3 text-center text-slate-600 hidden md:table-cell">{team.won}</td>
                                             <td className="px-4 py-3 text-center text-slate-600 hidden md:table-cell">{team.drawn}</td>
                                             <td className="px-4 py-3 text-center text-slate-600 hidden md:table-cell">{team.lost}</td>
                                             <td className="px-4 py-3 text-center text-slate-600 hidden sm:table-cell">{team.gf}</td>
                                             <td className="px-4 py-3 text-center text-slate-600 hidden sm:table-cell">{team.ga}</td>
                                             <td className="px-4 py-3 text-center font-medium text-slate-700">{team.gf - team.ga}</td>
                                         </tr>
                                     );
                                 })}
                             </tbody>
                         </table>
                     </div>
                     <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex gap-4 flex-wrap">
                         <div className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-600 rounded-full"></span> Libertadores</div>
                         <div className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Rebaixamento</div>
                     </div>
                 </div>
            </div>
        )}

        {view === 'match' && userTeam && (
            <div className="max-w-3xl mx-auto animate-fade-in">
                {!isSimulating && !matchResult && (
                    <div className="text-center py-12 md:py-20">
                        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-slate-100">
                            <Trophy size={48} className="md:w-16 md:h-16 text-yellow-500 mx-auto mb-6" />
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Dia de Jogo</h2>
                            <p className="text-slate-500 mb-8 text-sm md:text-base">O time está pronto. A torcida está esperando.</p>
                            <button 
                                onClick={handlePlayMatch}
                                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-lg px-10 py-4 rounded-xl md:rounded-full font-bold shadow-lg shadow-emerald-200 transition-all transform hover:scale-105"
                            >
                                Iniciar Partida
                            </button>
                        </div>
                    </div>
                )}

                {isSimulating && (
                    <div className="text-center py-32">
                         <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-6"></div>
                         <h3 className="text-xl font-bold text-slate-700">A bola está rolando...</h3>
                         <p className="text-slate-500">A IA está simulando os 90 minutos.</p>
                    </div>
                )}

                {matchResult && !isSimulating && (
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
      {view !== 'career-mode' && (
          <MobileNav 
            currentView={view} 
            onChangeView={setView} 
            team={userTeam} 
          />
      )}
    </div>
  );
}