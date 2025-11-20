
import { Player, Position, MatchResult, Team } from '../types';

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
  "Inter do Bairro", "Cometa FC", "Gigantes da Norte", "Samba FC", "Imperial United"
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
    // Embaralha e pega 'count' nomes únicos
    const shuffled = [...FICTIONAL_TEAMS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// --- SERVICE FUNCTIONS ---

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

export const simulateMatchWithGemini = async (myTeam: Team, mySquad: Player[], opponent: Team): Promise<MatchResult> => {
  await delay(2000); // Simula a "IA" pensando e os 90 minutos

  // 1. Calcular força dos times
  const myAvg = mySquad.reduce((acc, p) => acc + p.rating, 0) / (mySquad.length || 1);
  // Oponente tem força aleatória entre 70 e 85, ajustado levemente pelo "nível" do meu time
  const oppStrength = getRandomNumber(70, 85) + (Math.random() > 0.5 ? 2 : -2);

  // 2. Determinar placar baseado na diferença de força + fator sorte
  const strengthDiff = myAvg - oppStrength;
  const luck = Math.random() * 10 - 5; // Fator sorte de -5 a +5
  const matchFactor = strengthDiff + luck;

  let myScore = 0;
  let oppScore = 0;

  if (matchFactor > 8) {
    // Vitória provável
    myScore = getRandomNumber(2, 5);
    oppScore = getRandomNumber(0, 1);
  } else if (matchFactor > 2) {
    // Jogo equilibrado, vantagem nossa
    myScore = getRandomNumber(1, 3);
    oppScore = getRandomNumber(0, 2);
  } else if (matchFactor > -2) {
    // Empate provável
    myScore = getRandomNumber(0, 2);
    oppScore = getRandomNumber(0, 2);
  } else {
    // Derrota provável
    myScore = getRandomNumber(0, 1);
    oppScore = getRandomNumber(1, 4);
  }

  // 3. Gerar Eventos condizentes com o placar
  const events: any[] = [];

  // Gols do time da casa
  for (let i = 0; i < myScore; i++) {
    events.push({
      minute: getRandomNumber(5, 90),
      description: `GOL! ${generateName()} balança a rede para o ${myTeam.name}!`,
      type: 'goal',
      team: 'home'
    });
  }

  // Gols do adversário
  for (let i = 0; i < oppScore; i++) {
    events.push({
      minute: getRandomNumber(5, 90),
      description: `Gol do ${opponent.name}. A defesa falhou.`,
      type: 'goal',
      team: 'away'
    });
  }

  // Cartões e substituições aleatórias para dar sabor
  const extraEventsCount = getRandomNumber(1, 3);
  for (let i = 0; i < extraEventsCount; i++) {
    const minute = getRandomNumber(10, 85);
    const isCard = Math.random() > 0.5;
    if (isCard) {
      events.push({
        minute,
        description: `Cartão amarelo por falta dura.`,
        type: 'card',
        team: Math.random() > 0.5 ? 'home' : 'away'
      });
    } else {
      events.push({
        minute,
        description: `Substituição tática para renovar o fôlego.`,
        type: 'substitution',
        team: Math.random() > 0.5 ? 'home' : 'away'
      });
    }
  }

  // Ordenar eventos por minuto
  events.sort((a, b) => a.minute - b.minute);

  // Gerar resumo
  let summary = "";
  if (myScore > oppScore) summary = `Uma grande vitória do ${myTeam.name}! O time dominou as ações e mereceu os 3 pontos.`;
  else if (myScore === oppScore) summary = `Um jogo muito disputado que terminou em igualdade. Ambos os times tiveram chances.`;
  else summary = `Dia difícil para o ${myTeam.name}. O adversário foi mais eficiente nas finalizações.`;

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
    `Impressionou pela velocidade e controle de bola. Um talento nato para a posição de ${position}.`,
    `Jogador muito tático, sabe se posicionar bem e tem um futuro brilhante.`,
    `Destacou-se na partida pela garra e determinação. A torcida já gosta dele.`,
    `Tecnicamente acima da média para a idade. Precisa de polimento, mas é uma joia.`,
    `Tem um chute poderoso e visão de jogo. Os olheiros recomendam fortemente.`,
    `Um líder em campo. Organizou o time e mostrou maturidade.`,
    `Fisicamente privilegiado e com boa técnica. Pode evoluir muito em um clube grande.`
  ];

  return reports[Math.floor(Math.random() * reports.length)];
};