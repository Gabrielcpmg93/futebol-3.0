
import { Player, Position, MatchResult, Team, SocialPost, LibGroup, LibOpponent } from '../types';

// --- MOCK DATA GENERATORS (OFFLINE LOGIC) ---

const FIRST_NAMES = [
  "Gabriel", "Lucas", "Matheus", "Pedro", "Guilherme", "Gustavo", "Rafael", "Felipe", "João", "Enzo", 
  "Bruno", "Thiago", "Arthur", "Nicolas", "Kauan", "Diego", "Rodrigo", "André", "Igor", "Daniel",
  "Vitor", "Leonardo", "Eduardo", "Caio", "Vinicius", "Luan", "Samuel", "Tiago", "Yuri", "Pablo"
];

const LAST_NAMES = [
  "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", 
  "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa",
  "Nascimento", "Mendes", "Cardoso", "Ramos", "Teixeira", "Rocha", "Dias", "Moreira", "Correia", "Gonçalves"
];

const FICTIONAL_TEAMS = [
  "União da Vila", "Real Futuro", "Dynamo City", "Atlético Várzea", "Sporting Leste", 
  "Norte United", "Estrela do Sul", "Tigres Dourados", "Fênix FC", "Acadêmica Central",
  "Brazuca Juniors", "Nova Era FC", "Leões da Serra", "Guardiões da Bola", "Trovão Azul",
  "Inter do Bairro", "Cometa FC", "Gigantes da Norte", "Samba FC", "Imperial United",
  "Real Capixaba", "Amazonas FC", "Pampa United", "Cerrado Esporte", "Pantanal FC"
];

// --- LIBERTADORES DATA ---
const LIBERTADORES_DB = [
    { real: "Deportivo Táchira", fake: "Táchira Aurinegro", color: "bg-yellow-500", sec: "text-black" },
    { real: "Carabobo", fake: "Valência Vinho", color: "bg-red-900", sec: "text-white" },
    { real: "Peñarol", fake: "Carboneros FC", color: "bg-yellow-400", sec: "text-black" },
    { real: "Alianza Lima", fake: "Aliança Real", color: "bg-blue-900", sec: "text-white" },
    { real: "Sporting Cristal", fake: "Cervejeiros SC", color: "bg-sky-400", sec: "text-white" },
    { real: "Universitário", fake: "Creme e Guindas", color: "bg-orange-100", sec: "text-red-900" },
    { real: "Nacional", fake: "Montevidéu Tricolor", color: "bg-blue-700", sec: "text-white" },
    { real: "Cerro Porteño", fake: "Ciclón do Bairro", color: "bg-red-700", sec: "text-blue-700" },
    { real: "Olimpia", fake: "Rei de Copas", color: "bg-black", sec: "text-white" },
    { real: "Libertad", fake: "Gumarelo FC", color: "bg-black", sec: "text-white" },
    { real: "Barcelona de Guayaquil", fake: "Touro Amarelo", color: "bg-yellow-400", sec: "text-black" },
    { real: "Independiente del Valle", fake: "Negriazul do Vale", color: "bg-blue-900", sec: "text-pink-500" },
    { real: "LDU Quito", fake: "Liga Universitária", color: "bg-white", sec: "text-red-600" },
    { real: "Atlético Nacional", fake: "Verdolaga FC", color: "bg-green-600", sec: "text-white" },
    { real: "Atlético Bucaramanga", fake: "Leopardos do Sul", color: "bg-yellow-400", sec: "text-green-800" },
    { real: "Universidad de Chile", fake: "La U Romântica", color: "bg-blue-600", sec: "text-red-600" },
    { real: "Colo-Colo", fake: "Cacique Santiago", color: "bg-white", sec: "text-black" },
    { real: "Bolívar", fake: "Academia Celeste", color: "bg-sky-500", sec: "text-white" },
    { real: "San Antonio Bulo Bulo", fake: "Santo Antônio FC", color: "bg-green-500", sec: "text-white" },
    { real: "Flamengo", fake: "Urubu Rei", color: "bg-red-600", sec: "text-black" },
    { real: "Cruzeiro", fake: "Raposa Celeste", color: "bg-blue-600", sec: "text-white" },
    { real: "Bahia", fake: "Tricolor de Aço", color: "bg-blue-500", sec: "text-red-500" },
    { real: "São Paulo", fake: "Soberano Paulista", color: "bg-red-600", sec: "text-white" },
    { real: "Internacional", fake: "Colorado do Sul", color: "bg-red-600", sec: "text-white" },
    { real: "Fortaleza", fake: "Leão do Pici", color: "bg-blue-700", sec: "text-red-600" },
    { real: "Palmeiras", fake: "Porco Verde", color: "bg-green-600", sec: "text-white" },
    { real: "Botafogo", fake: "Estrela Solitária", color: "bg-black", sec: "text-white" },
    { real: "River Plate", fake: "Prata de Buenos Aires", color: "bg-white", sec: "text-red-600" },
    { real: "Talleres", fake: "Matador de Córdova", color: "bg-blue-900", sec: "text-white" },
    { real: "Central de Córdoba", fake: "Ferroviário Central", color: "bg-black", sec: "text-white" },
    { real: "Racing", fake: "Academia Racing", color: "bg-sky-300", sec: "text-white" },
    { real: "Estudiantes", fake: "Estudantes de La Plata", color: "bg-red-600", sec: "text-white" },
    { real: "Vélez Sarsfield", fake: "Fortim Velez", color: "bg-blue-800", sec: "text-white" }
];

export const getLibertadoresTeams = (): Team[] => {
    return LIBERTADORES_DB.map((t, idx) => ({
        id: `lib-${idx}`,
        name: t.fake,
        primaryColor: t.color,
        secondaryColor: t.sec
    }));
};

export const generateLibertadoresGroups = (userTeamName: string): LibGroup[] => {
    const allTeams = getLibertadoresTeams();
    // Remover o time do usuário da lista de oponentes
    const opponents = allTeams.filter(t => t.name !== userTeamName);
    
    // Embaralhar
    const shuffled = [...opponents].sort(() => 0.5 - Math.random());
    
    const groups: LibGroup[] = [];
    const groupNames = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    // Criar grupos de 5
    let currentIndex = 0;
    for (const name of groupNames) {
        const groupOpponents: LibOpponent[] = [];
        for (let i = 0; i < 5; i++) {
            if (currentIndex < shuffled.length) {
                groupOpponents.push({
                    team: shuffled[currentIndex],
                    played: false
                });
                currentIndex++;
            }
        }
        groups.push({ name: `Grupo ${name}`, opponents: groupOpponents, completed: false });
    }

    if (currentIndex < shuffled.length) {
         const finalOpponents: LibOpponent[] = [];
         while(currentIndex < shuffled.length) {
             finalOpponents.push({
                team: shuffled[currentIndex],
                played: false
            });
            currentIndex++;
         }
         groups.push({ name: 'Grupo Final', opponents: finalOpponents, completed: false });
    }

    return groups;
};


const SOCIAL_CAPTIONS = [
    "Focado no próximo desafio! 💪⚽ #Treino #Futebol",
    "Grande vitória hoje! Orgulho desse time. 🔥",
    "Recuperando energias... 🎮🍕",
    "Dia de jogo! Que Deus nos abençoe. 🙏",
    "Nada como o apoio da torcida. Vocês são incríveis!",
    "Trabalho duro vence talento. Seguimos! 🚀",
    "Resenha boa com a rapaziada hoje no CT.",
    "Domingo de folga com a família.",
    "A temporada está só começando. Vamos por mais! 🏆",
    "Obrigado pelo carinho de todos nas mensagens."
];

// Helper: Gera um delay para simular processamento e não ser instantâneo demais na UI
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateId = () => Math.random().toString(36).substring(2, 9);

const generateName = () => {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
};

export const generateFictionalTeamName = () => {
    return FICTIONAL_TEAMS[Math.floor(Math.random() * FICTIONAL_TEAMS.length)];
};

export const getFictionalLeagueNames = (count: number): string[] => {
    const shuffled = [...FICTIONAL_TEAMS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// --- SERVICE FUNCTIONS ---

export const generateLoanOffers = async (): Promise<{name: string, wageSplit: number}[]> => {
    await delay(300);
    const n1 = generateFictionalTeamName();
    let n2 = generateFictionalTeamName();
    while (n2 === n1) n2 = generateFictionalTeamName(); // Garante nomes diferentes

    return [
        { name: n1, wageSplit: getRandomNumber(40, 100) }, // Time 1 paga entre 40% e 100% do salário
        { name: n2, wageSplit: getRandomNumber(40, 100) }
    ];
};

export const generateCareerOffers = async (position: string): Promise<{name: string, color: string, salary: number}[]> => {
    await delay(1000);
    
    const offers = [
        { name: "Raposa Celeste", color: "bg-blue-600", salary: 5 }, // Cruzeiro Fictício
        { name: generateFictionalTeamName(), color: "bg-slate-700", salary: 3 },
        { name: generateFictionalTeamName(), color: "bg-red-700", salary: 4 }
    ];
    
    // Shuffle slightly but keep Raposa
    return offers.sort(() => Math.random() - 0.5);
};

export const generateSquadForTeam = async (teamName: string): Promise<Player[]> => {
  await delay(800); // Simula tempo de carregamento

  const squadConfig = [
    { pos: Position.GK, count: 3, minOvr: 70, maxOvr: 85 },
    { pos: Position.DEF, count: 8, minOvr: 72, maxOvr: 86 },
    { pos: Position.MID, count: 8, minOvr: 74, maxOvr: 88 },
    { pos: Position.ATT, count: 5, minOvr: 73, maxOvr: 89 },
  ];

  let squad: Player[] = [];

  squadConfig.forEach(cfg => {
    for (let i = 0; i < cfg.count; i++) {
      const rating = getRandomNumber(cfg.minOvr, cfg.maxOvr);
      // Valor baseado no rating (exponencial simples)
      const value = parseFloat(((rating - 60) * 0.5 + (Math.random() * 2)).toFixed(1));
      // Salário baseado no rating (aprox 1/100 do valor ou logica simples)
      const salary = Math.floor(value * 10 + getRandomNumber(5, 20));
      
      squad.push({
        id: generateId(),
        name: generateName(),
        position: cfg.pos,
        rating: rating,
        age: getRandomNumber(17, 34),
        value: Math.max(0.5, value),
        contractWeeks: getRandomNumber(20, 60),
        team: teamName,
        salary: salary,
        isLoaned: false
      });
    }
  });

  return squad;
};

export const generateTransferMarket = async (): Promise<Player[]> => {
  await delay(500);
  
  const players: Player[] = [];
  const positions = [Position.GK, Position.DEF, Position.MID, Position.ATT];
  
  for (let i = 0; i < 10; i++) {
    const pos = positions[Math.floor(Math.random() * positions.length)];
    const rating = getRandomNumber(68, 88);
    const value = parseFloat(((rating - 60) * 0.6 + (Math.random() * 3)).toFixed(1));
    const salary = Math.floor(value * 10 + getRandomNumber(5, 20));

    players.push({
      id: generateId(),
      name: generateName(),
      position: pos,
      rating: rating,
      age: getRandomNumber(18, 32),
      value: Math.max(1, value),
      contractWeeks: getRandomNumber(30, 80),
      team: "Free Agent",
      salary: salary,
      isLoaned: false
    });
  }

  return players;
};

export const generateSocialFeed = (): SocialPost[] => {
    const posts: SocialPost[] = [];
    const types: ('training' | 'match' | 'leisure' | 'celebration')[] = ['training', 'match', 'leisure', 'celebration'];
    
    for (let i = 0; i < 5; i++) {
        posts.push({
            id: generateId(),
            authorName: generateName(),
            teamName: Math.random() > 0.5 ? generateFictionalTeamName() : undefined,
            content: SOCIAL_CAPTIONS[Math.floor(Math.random() * SOCIAL_CAPTIONS.length)],
            imageType: types[Math.floor(Math.random() * types.length)],
            likes: getRandomNumber(50, 2000),
            comments: [],
            timeAgo: `${getRandomNumber(1, 23)}h`,
            isLiked: false
        });
    }
    return posts;
};

export const simulateMatchWithGemini = async (
    myTeam: Team, 
    mySquad: Player[], 
    opponent: Team,
    tactics?: { formation: string, style: string, intensity: string },
    isQuickSim: boolean = false
): Promise<MatchResult> => {
  await delay(isQuickSim ? 500 : 2000); // Simula a "IA" pensando

  // 1. Calcular força base dos times
  let myAvg = mySquad.reduce((acc, p) => acc + p.rating, 0) / (mySquad.length || 1);
  
  // 2. Aplicar bônus TÁTICO
  let tacticalBonus = 0;
  let tacticLog = "";
  
  if (tactics) {
      if (tactics.formation === '4-3-3') { tacticalBonus += 3; tacticLog += "Ataque Forte. "; } 
      else if (tactics.formation === '3-5-2') { tacticalBonus += 2; tacticLog += "Meio Dominado. "; }
      else { tacticalBonus += 1; tacticLog += "Equilíbrio. "; }

      if (tactics.style === 'Tic-Taka') { tacticalBonus += 2; tacticLog += "Posse. "; }
      else if (tactics.style === 'Contra-Ataque') { tacticalBonus += 2.5; tacticLog += "Velocidade. "; }

      if (tactics.intensity === 'Pressão Alta') { tacticalBonus += 3; tacticLog += "Pressão. "; }
  }

  myAvg += tacticalBonus;

  const oppStrength = getRandomNumber(70, 83) + (Math.random() > 0.5 ? 1 : -1);
  const strengthDiff = myAvg - oppStrength;
  const luck = Math.random() * 8 - 3; 
  const matchFactor = strengthDiff + luck;

  let myScore = 0;
  let oppScore = 0;

  if (matchFactor > 8) { myScore = getRandomNumber(3, 6); oppScore = getRandomNumber(0, 1); } 
  else if (matchFactor > 3) { myScore = getRandomNumber(2, 3); oppScore = getRandomNumber(0, 1); } 
  else if (matchFactor > 0) { myScore = getRandomNumber(1, 2); oppScore = getRandomNumber(0, 2); if (tacticalBonus > 5 && myScore <= oppScore) myScore += 1; } 
  else if (matchFactor > -5) { myScore = getRandomNumber(0, 1); oppScore = getRandomNumber(1, 2); } 
  else { myScore = getRandomNumber(0, 1); oppScore = getRandomNumber(2, 4); }

  const events: any[] = [];

  for (let i = 0; i < myScore; i++) {
    events.push({ minute: getRandomNumber(5, 90), description: `GOL! ${generateName()} marca!`, type: 'goal', team: 'home' });
  }

  for (let i = 0; i < oppScore; i++) {
    events.push({ minute: getRandomNumber(5, 90), description: `Gol do ${opponent.name}.`, type: 'goal', team: 'away' });
  }

  const extraEventsCount = getRandomNumber(2, 4);
  for (let i = 0; i < extraEventsCount; i++) {
    const minute = getRandomNumber(10, 85);
    const isCard = Math.random() > 0.6;
    events.push({ minute, description: isCard ? `Cartão amarelo.` : `Substituição.`, type: isCard ? 'card' : 'substitution', team: Math.random() > 0.5 ? 'home' : 'away' });
  }

  events.sort((a, b) => a.minute - b.minute);

  let summary = "";
  if (myScore > oppScore) summary = `Vitória importante!`;
  else if (myScore === oppScore) summary = `Tudo igual.`;
  else summary = `Derrota.`;

  return {
    homeScore: myScore,
    awayScore: oppScore,
    events,
    summary,
    opponentName: opponent.name,
    win: myScore > oppScore,
    draw: myScore === oppScore
  };
};

export const generateScoutReport = async (playerName: string, position: string): Promise<string> => {
  await delay(1000);
  const reports = [
    `Impressionou pela velocidade.`, `Muito tático.`, `Muita garra.`, `Tecnicamente acima da média.`, `Chute poderoso.`
  ];
  return reports[Math.floor(Math.random() * reports.length)];
};
