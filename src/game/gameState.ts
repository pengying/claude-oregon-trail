export type Occupation = 'banker' | 'carpenter' | 'farmer';
export type HealthStatus = 'good' | 'fair' | 'poor' | 'very poor' | 'dead';
export type Weather = 'very hot' | 'hot' | 'warm' | 'cool' | 'cold' | 'very cold' | 'rainy' | 'snowy';
export type Pace = 'steady' | 'strenuous' | 'grueling' | 'resting';
export type RationsLevel = 'filling' | 'meager' | 'bare bones' | 'none';

export interface Person {
  name: string;
  health: HealthStatus;
  illness?: string;
  isAlive: boolean;
}

export interface Supply {
  food: number; // pounds
  ammunition: number; // boxes (20 bullets per box)
  clothing: number; // sets
  oxen: number; // number of oxen (need at least 2 to travel)
  spareParts: {
    wheels: number;
    axles: number;
    tongues: number; // wagon tongue
  };
  cash: number; // dollars
}

export interface Milestone {
  name: string;
  distance: number; // miles from Independence
  type: 'landmark' | 'river' | 'fort' | 'town';
  riverData?: {
    width: number; // feet
    depth: number; // feet
  };
}

export interface GameState {
  partyLeader: Person;
  companions: Person[];
  occupation: Occupation;
  supplies: Supply;
  day: number; // day of journey (1 is first day)
  month: number; // 3 = March, 4 = April, etc.
  year: number; // 1848
  milesTraveled: number;
  currentLocation: string;
  nextMilestone: Milestone;
  weather: Weather;
  pace: Pace;
  rations: RationsLevel;
  events: string[]; // history of game events
  messages: string[]; // current messages to display
  hadSignificantEvent?: boolean; // Flag to indicate if travel should be interrupted
}

export const startingMoneyByOccupation: Record<Occupation, number> = {
  banker: 1600,
  carpenter: 800,
  farmer: 400,
};

export const initializeGame = (
  leaderName: string,
  companionNames: string[],
  occupation: Occupation
): GameState => {
  // Filter out empty companion names
  const validCompanions = companionNames.filter(name => name.trim() !== '');
  
  // Initialize party members
  const partyLeader: Person = {
    name: leaderName,
    health: 'good',
    isAlive: true,
  };
  
  const companions: Person[] = validCompanions.map(name => ({
    name,
    health: 'good',
    isAlive: true,
  }));
  
  // Starting cash based on occupation
  const cash = startingMoneyByOccupation[occupation];
  
  // Initialize supplies
  const supplies: Supply = {
    food: 200, // 200 pounds of food
    ammunition: 2, // 2 boxes (40 bullets)
    clothing: 3, // 3 sets of clothes
    oxen: 4, // 2 yoke (4 oxen)
    spareParts: {
      wheels: 1,
      axles: 1,
      tongues: 1,
    },
    cash,
  };
  
  // First milestone is Fort Kearney
  const nextMilestone: Milestone = {
    name: 'Fort Kearney',
    distance: 304, // 304 miles from Independence
    type: 'fort',
  };
  
  // Return initialized game state
  return {
    partyLeader,
    companions,
    occupation,
    supplies,
    day: 1,
    month: 3, // March
    year: 1848,
    milesTraveled: 0,
    currentLocation: 'Independence, Missouri',
    nextMilestone,
    weather: 'cool',
    pace: 'steady',
    rations: 'filling',
    events: ['Your journey begins in Independence, Missouri.'],
    messages: ['You set out on the trail with high hopes. The journey ahead is long but your spirits are high.'],
  };
};

export const milestones: Milestone[] = [
  {
    name: 'Independence, Missouri',
    distance: 0,
    type: 'town',
  },
  {
    name: 'Kansas River Crossing',
    distance: 102,
    type: 'river',
    riverData: {
      width: 620,
      depth: 4,
    },
  },
  {
    name: 'Big Blue River Crossing',
    distance: 185,
    type: 'river',
    riverData: {
      width: 300,
      depth: 3,
    },
  },
  {
    name: 'Fort Kearney',
    distance: 304,
    type: 'fort',
  },
  {
    name: 'Chimney Rock',
    distance: 554,
    type: 'landmark',
  },
  {
    name: 'Fort Laramie',
    distance: 640,
    type: 'fort',
  },
  {
    name: 'Independence Rock',
    distance: 830,
    type: 'landmark',
  },
  {
    name: 'South Pass',
    distance: 932,
    type: 'landmark',
  },
  {
    name: 'Fort Bridger',
    distance: 989,
    type: 'fort',
  },
  {
    name: 'Green River Crossing',
    distance: 1151,
    type: 'river',
    riverData: {
      width: 400,
      depth: 6,
    },
  },
  {
    name: 'Soda Springs',
    distance: 1295,
    type: 'landmark',
  },
  {
    name: 'Fort Hall',
    distance: 1395,
    type: 'fort',
  },
  {
    name: 'Snake River Crossing',
    distance: 1534,
    type: 'river',
    riverData: {
      width: 1000,
      depth: 7,
    },
  },
  {
    name: 'Fort Boise',
    distance: 1648,
    type: 'fort',
  },
  {
    name: 'Blue Mountains',
    distance: 1808,
    type: 'landmark',
  },
  {
    name: 'Fort Walla Walla',
    distance: 1863,
    type: 'fort',
  },
  {
    name: 'The Dalles',
    distance: 1973,
    type: 'town',
  },
  {
    name: 'Willamette Valley',
    distance: 2040,
    type: 'town',
  },
];