import React, { useState } from 'react';
import { BRAZILIAN_TEAMS, Team, Player, ViewState, MatchResult } from './types';
import { generateSquadForTeam, generateTransferMarket, simulateMatchWithGemini } from './services/geminiService';
import { Card } from './components/Card';
import { PlayerRow } from './components/PlayerRow';
import { 
    LayoutDashboard, 
    Users, 
    ArrowLeftRight, 
    PlayCircle, 
    LogOut, 
    DollarSign,
    Activity,
    Trophy
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
    team: Team 
}) => {
    const menuItems = [
        { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'squad', label: 'Elenco', icon: Users },
        { id: 'market', label: 'Transferências', icon: ArrowLeftRight },
        { id: 'match', label: 'Jogar', icon: PlayCircle },
    ];

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
            
            <div className="p-6 border-t border-slate-800">
                 <button onClick={() => window.location.reload()} className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors w-full">
                    <LogOut size={20} />
                    <span>Sair</span>
                 </button>
            </div>
        </div>
    );
};

const MobileNav = ({ currentView, onChangeView, team }: { currentView: ViewState, onChangeView: (v: ViewState) => void, team: Team }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
        { id: 'squad', label: 'Elenco', icon: Users },
        { id: 'market', label: 'Mercado', icon: ArrowLeftRight },
        { id: 'match', label: 'Jogar', icon: PlayCircle },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-2 pt-2 px-4 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
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
                 <button 
                    onClick={() => window.location.reload()} 
                    className="flex flex-col items-center justify-center w-16 gap-0.5 text-slate-400 hover:text-red-500"
                >
                    <div className="p-1">
                        <LogOut size={20} />
                    </div>
                    <span className="text-[10px] font-medium leading-none">Sair</span>
                 </button>
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

  // Initialization logic
  const handleTeamSelect = async (team: Team) => {
    setLoading(true);
    try {
        const players = await generateSquadForTeam(team.name);
        setUserTeam(team);
        setSquad(players);
        setView('dashboard');
        
        // Pre-fetch market in background
        generateTransferMarket().then(setMarket);
    } catch (error) {
        console.error("Failed to start game", error);
    } finally {
        setLoading(false);
    }
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
      setIsSimulating(false);

      if (result.win) setBudget(prev => prev + 2.5); // Prize money
      if (result.draw) setBudget(prev => prev + 1.0);
  };

  if (view === 'select-team') {
    return <TeamSelection onSelect={handleTeamSelect} />;
  }

  if (!userTeam) return null;

  const avgRating = (squad.reduce((acc, p) => acc + p.rating, 0) / (squad.length || 1)).toFixed(0);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <Sidebar currentView={view} onChangeView={setView} team={userTeam} />
      
      {/* Main Content Area with padding for mobile nav */}
      <main className="flex-1 p-4 pb-24 lg:p-8 overflow-y-auto h-screen scroll-smooth">
        
        {/* Header Stats Bar - Scrollable with Snap on mobile */}
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

        {/* Views Content */}
        
        {view === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
                    {/* Decorative background element */}
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
                    <Card title="Principais Jogadores">
                        {squad.sort((a, b) => b.rating - a.rating).slice(0, 5).map(player => (
                            <PlayerRow key={player.id} player={player} />
                        ))}
                    </Card>
                    <Card title="Notícias do Clube">
                        <div className="space-y-4">
                             <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Hoje</p>
                                <p className="font-medium text-slate-800 text-sm md:text-base">Diretoria anuncia meta de terminar no G4 do Brasileirão.</p>
                             </div>
                             <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Ontem</p>
                                <p className="font-medium text-slate-800 text-sm md:text-base">Torcida esgota ingressos para a estreia em casa.</p>
                             </div>
                        </div>
                    </Card>
                </div>
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

        {view === 'match' && (
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

                        <button 
                            onClick={() => setMatchResult(null)}
                            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-4 rounded-xl transition-colors"
                        >
                            Voltar ao Vestiário
                        </button>
                    </div>
                )}
            </div>
        )}

      </main>
      
      <MobileNav currentView={view} onChangeView={setView} team={userTeam} />
    </div>
  );
}