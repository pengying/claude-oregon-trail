import { GameState, HealthStatus, Milestone, Pace, RationsLevel, Weather, milestones } from './gameState';

// Constants
const MILES_PER_DAY: Record<Pace, number> = {
  steady: 15,
  strenuous: 20,
  grueling: 25,
  resting: 0,
};

const FOOD_PER_DAY: Record<RationsLevel, number> = {
  filling: 3,
  meager: 2,
  'bare bones': 1,
  none: 0,
};

// Random number generation
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Get next milestone based on current miles traveled
export const getNextMilestone = (milesTraveled: number): Milestone => {
  for (const milestone of milestones) {
    if (milestone.distance > milesTraveled) {
      return milestone;
    }
  }
  // If somehow past all milestones, return the last one
  return milestones[milestones.length - 1];
};

// Update health based on food consumption, pace, and random chance
export const updateHealth = (
  currentHealth: HealthStatus,
  rations: RationsLevel,
  pace: Pace,
  randomFactor: number = randomInt(1, 100)
): HealthStatus => {
  // Health progression (worst to best)
  const healthStates: HealthStatus[] = ['dead', 'very poor', 'poor', 'fair', 'good'];
  let healthIndex = healthStates.indexOf(currentHealth);
  
  // Can't improve if dead
  if (healthIndex === 0) return 'dead';
  
  // Determine health change based on conditions
  let healthChange = 0;
  
  // Food impact
  if (rations === 'filling') healthChange += 1;
  else if (rations === 'meager') healthChange += 0;
  else if (rations === 'bare bones') healthChange -= 1;
  else if (rations === 'none') healthChange -= 2;
  
  // Pace impact
  if (pace === 'grueling') healthChange -= 1;
  else if (pace === 'strenuous') healthChange -= 0;
  else if (pace === 'resting') healthChange += 1;
  
  // Random events (illness, etc.)
  if (randomFactor < 5) healthChange -= 2; // 5% chance of serious illness
  else if (randomFactor < 15) healthChange -= 1; // 10% chance of minor illness
  
  // Apply health change
  healthIndex = Math.max(0, Math.min(healthStates.length - 1, healthIndex + healthChange));
  return healthStates[healthIndex];
};

// Generate weather based on month and random chance
export const generateWeather = (month: number): Weather => {
  const randomValue = randomInt(1, 100);
  
  // Winter months (December, January, February)
  if (month === 12 || month <= 2) {
    if (randomValue < 40) return 'very cold';
    if (randomValue < 70) return 'cold';
    if (randomValue < 85) return 'cool';
    if (randomValue < 95) return 'rainy';
    return 'snowy';
  }
  
  // Spring months (March, April, May)
  if (month >= 3 && month <= 5) {
    if (randomValue < 10) return 'cold';
    if (randomValue < 30) return 'cool';
    if (randomValue < 60) return 'warm';
    if (randomValue < 80) return 'hot';
    return 'rainy';
  }
  
  // Summer months (June, July, August)
  if (month >= 6 && month <= 8) {
    if (randomValue < 20) return 'warm';
    if (randomValue < 60) return 'hot';
    if (randomValue < 90) return 'very hot';
    return 'rainy';
  }
  
  // Fall months (September, October, November)
  if (randomValue < 10) return 'hot';
  if (randomValue < 40) return 'warm';
  if (randomValue < 70) return 'cool';
  if (randomValue < 90) return 'cold';
  return 'rainy';
};

// Process a hunting trip
export const goHunting = (
  ammunition: number,
  huntingSkill: number = 5
): { success: boolean; foodGained: number; ammunitionUsed: number; message: string } => {
  if (ammunition <= 0) {
    return {
      success: false,
      foodGained: 0,
      ammunitionUsed: 0,
      message: "You don't have any ammunition to hunt with!",
    };
  }
  
  const skill = Math.min(10, Math.max(1, huntingSkill));
  const successChance = 30 + skill * 5; // 35-80% success chance based on skill
  
  const isSuccessful = randomInt(1, 100) <= successChance;
  const ammunitionUsed = randomInt(1, 3); // Use 1-3 bullets
  
  if (!isSuccessful) {
    return {
      success: false,
      foodGained: 0,
      ammunitionUsed: Math.min(ammunition, ammunitionUsed),
      message: 'Your hunting trip was unsuccessful. Better luck next time.',
    };
  }
  
  // Success - determine how much food was gained
  const baseYield = randomInt(10, 50);
  const foodGained = baseYield + skill * randomInt(2, 5); // Better skill means more food
  
  let message = '';
  if (foodGained < 20) {
    message = 'You shot a small animal, gaining a little meat.';
  } else if (foodGained < 40) {
    message = 'You hunted successfully, bringing back a decent amount of meat.';
  } else {
    message = 'Excellent hunt! You brought back a large amount of meat!';
  }
  
  return {
    success: true,
    foodGained,
    ammunitionUsed: Math.min(ammunition, ammunitionUsed),
    message,
  };
};

// Handle river crossing
export const riverCrossing = (
  depth: number,
  width: number,
  choice: 'ford' | 'ferry' | 'caulk' | 'wait',
  cash: number,
  weather: Weather
): { 
  success: boolean; 
  message: string;
  damage?: { 
    food: number; 
    supplies: boolean;
    injury: boolean; 
  };
  cost?: number;
  daysLost?: number;
} => {
  // Ferry option
  if (choice === 'ferry') {
    const ferryCost = Math.floor(width / 20); // $5 per 100 feet is a typical cost
    
    if (cash < ferryCost) {
      return {
        success: false,
        message: `You don't have enough money for the ferry. It costs $${ferryCost}.`,
      };
    }
    
    return {
      success: true,
      message: 'You safely crossed the river using the ferry.',
      cost: ferryCost,
      daysLost: 1,
    };
  }
  
  // Wait option
  if (choice === 'wait') {
    const daysToWait = randomInt(2, 5);
    let newDepth = depth;
    
    // 70% chance the river level goes down
    if (randomInt(1, 100) <= 70) {
      newDepth = Math.max(1, depth - randomInt(1, 3));
      return {
        success: true,
        message: `After waiting ${daysToWait} days, the river is now ${newDepth} feet deep.`,
        daysLost: daysToWait,
      };
    } else {
      return {
        success: true,
        message: `You waited ${daysToWait} days, but the river depth hasn't changed.`,
        daysLost: daysToWait,
      };
    }
  }
  
  // Fording the river
  if (choice === 'ford') {
    if (depth > 3) {
      const failChance = (depth - 3) * 20; // 20% per foot over 3ft
      
      if (randomInt(1, 100) <= failChance) {
        const severeDamage = randomInt(1, 100) <= 30;
        
        return {
          success: false,
          message: severeDamage 
            ? 'Disaster! Your wagon tipped over in the river!'
            : 'You had trouble fording the river and got your supplies wet.',
          damage: {
            food: severeDamage ? randomInt(20, 50) : randomInt(5, 20),
            supplies: severeDamage,
            injury: severeDamage,
          },
          daysLost: severeDamage ? 3 : 1,
        };
      }
    }
    
    return {
      success: true,
      message: 'You successfully forded the river.',
      daysLost: 1,
    };
  }
  
  // Caulking the wagon and floating across
  if (choice === 'caulk') {
    const badWeather = weather === 'rainy' || weather === 'very cold' || weather === 'snowy';
    const failChance = badWeather ? 40 : 20;
    
    if (randomInt(1, 100) <= failChance) {
      const severeDamage = randomInt(1, 100) <= 50;
      
      return {
        success: false,
        message: severeDamage 
          ? 'Oh no! Your wagon floated away downriver with some of your supplies!'
          : 'Your wagon took on some water while floating across.',
        damage: {
          food: severeDamage ? randomInt(30, 70) : randomInt(10, 30),
          supplies: severeDamage,
          injury: randomInt(1, 100) <= 30,
        },
        daysLost: severeDamage ? 4 : 2,
      };
    }
    
    return {
      success: true,
      message: 'You successfully caulked the wagon and floated across the river.',
      daysLost: 1,
    };
  }
  
  // Default case (shouldn't be reached)
  return {
    success: false,
    message: 'You were unable to cross the river.',
    daysLost: 1,
  };
};

// Game turn logic - advances the game state by one day
export const advanceTurn = (gameState: GameState): GameState => {
  const newState = { ...gameState };
  
  // Increment day
  newState.day += 1;
  
  // Check if month changes
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let currentMonthDays = daysInMonth[newState.month - 1];
  
  // Account for leap year
  if (newState.month === 2 && newState.year % 4 === 0) {
    currentMonthDays = 29;
  }
  
  // Move to next month if needed
  if (newState.day > currentMonthDays) {
    newState.day = 1;
    newState.month += 1;
    
    // Move to next year if needed
    if (newState.month > 12) {
      newState.month = 1;
      newState.year += 1;
    }
    
    // Update weather when month changes
    newState.weather = generateWeather(newState.month);
  }
  
  // Calculate miles traveled
  const milesTraveledToday = MILES_PER_DAY[newState.pace];
  newState.milesTraveled += milesTraveledToday;
  
  // Update next milestone and current location
  if (newState.milesTraveled >= newState.nextMilestone.distance) {
    // We've reached a milestone
    newState.currentLocation = newState.nextMilestone.name;
    newState.nextMilestone = getNextMilestone(newState.milesTraveled);
    
    // Add event for reaching milestone
    newState.events.push(`You've reached ${newState.currentLocation}!`);
    newState.messages.push(`You've reached ${newState.currentLocation}!`);
    
    // Handle river crossing if applicable
    if (newState.nextMilestone.type === 'river') {
      newState.messages.push(`There's a river crossing ahead at ${newState.nextMilestone.name}.`);
    }
  } else if (newState.milesTraveled > 0) {
    // We're between milestones - find the previous milestone
    let previousMilestone = "Independence, Missouri";
    for (const milestone of milestones) {
      if (milestone.distance <= newState.milesTraveled) {
        previousMilestone = milestone.name;
      } else {
        break;
      }
    }
    
    // Update current location to show progress
    if (previousMilestone !== newState.currentLocation) {
      newState.currentLocation = previousMilestone;
    }
    
    // Add contextual information if we're on the trail
    if (newState.milesTraveled > 0 && newState.milesTraveled < newState.nextMilestone.distance) {
      // Calculate distance to next milestone
      const distanceToNext = newState.nextMilestone.distance - newState.milesTraveled;
      
      if (distanceToNext <= 20) {
        // If very close to the next milestone
        newState.currentLocation = `Near ${newState.nextMilestone.name}`;
      } else {
        // If between milestones
        newState.currentLocation = `${newState.milesTraveled} miles from Independence`;
      }
    }
  }
  
  // Calculate food consumption
  const peopleAlive = [newState.partyLeader, ...newState.companions].filter(person => person.isAlive).length;
  const foodConsumed = peopleAlive * FOOD_PER_DAY[newState.rations];
  
  // Update food supply
  newState.supplies.food = Math.max(0, newState.supplies.food - foodConsumed);
  
  // Check if food ran out
  if (newState.supplies.food === 0 && foodConsumed > 0) {
    newState.events.push('You ran out of food!');
    newState.messages.push('You have run out of food! Your party will quickly grow weak without food.');
  }
  
  // Update health for each person
  // Leaders and companions health can be affected by food, pace, and random events
  const updatePersonHealth = (person: typeof newState.partyLeader) => {
    if (!person.isAlive) return person;
    
    const randomFactor = randomInt(1, 100);
    const newHealth = updateHealth(person.health, newState.rations, newState.pace, randomFactor);
    
    // Check if health changes
    if (newHealth !== person.health) {
      // Add event for health change
      if (newHealth === 'dead') {
        newState.events.push(`${person.name} has died.`);
        newState.messages.push(`${person.name} has died.`);
        return { ...person, health: newHealth, isAlive: false };
      } else if (person.health === 'very poor' && newHealth === 'poor') {
        newState.events.push(`${person.name}'s health has improved from very poor to poor.`);
        newState.messages.push(`${person.name}'s health has improved.`);
      } else if (newHealth === 'very poor') {
        newState.events.push(`${person.name}'s health has deteriorated to very poor.`);
        newState.messages.push(`${person.name}'s health has become very poor.`);
      }
    }
    
    return { ...person, health: newHealth };
  };
  
  // Update party leader's health
  newState.partyLeader = updatePersonHealth(newState.partyLeader);
  
  // Update companions' health
  newState.companions = newState.companions.map(updatePersonHealth);
  
  // Generate random events
  const hadEvent = generateRandomEvent(newState);
  
  // Add a flag to indicate if there was a significant event
  newState.hadSignificantEvent = hadEvent || 
                                newState.messages.length > 0 ||
                                newState.supplies.food === 0 ||
                                newState.nextMilestone.type === 'river' ||
                                newState.milesTraveled >= newState.nextMilestone.distance;
  
  // Return updated game state
  return newState;
};

// Random events
const generateRandomEvent = (gameState: GameState): boolean => {
  const randomValue = randomInt(1, 100);
  
  // Only trigger random events sometimes
  if (randomValue > 15) return false;
  
  const events = [
    {
      name: 'Wagon breakdown',
      chance: 10,
      handler: (state: GameState) => {
        const parts = ['wheel', 'axle', 'tongue'];
        const brokenPart = parts[randomInt(0, 2)];
        
        const hasSpare = state.supplies.spareParts[brokenPart as keyof typeof state.supplies.spareParts] > 0;
        
        if (hasSpare) {
          state.supplies.spareParts[brokenPart as keyof typeof state.supplies.spareParts] -= 1;
          state.events.push(`A wagon ${brokenPart} broke, but you had a spare part to fix it.`);
          state.messages.push(`A wagon ${brokenPart} broke, but you had a spare part to fix it.`);
        } else {
          state.events.push(`A wagon ${brokenPart} broke, and you don't have a spare part!`);
          state.messages.push(`A wagon ${brokenPart} broke, and you don't have a spare part! You'll need to trade for one at the next fort or settlement.`);
          
          // Add additional consequences
          // For now, just lose time
          state.day += randomInt(3, 6);
        }
      }
    },
    {
      name: 'Found wild fruit',
      chance: 8,
      handler: (state: GameState) => {
        const foodFound = randomInt(5, 20);
        state.supplies.food += foodFound;
        state.events.push(`You found ${foodFound} pounds of wild fruit!`);
        state.messages.push(`You found ${foodFound} pounds of wild fruit growing near the trail!`);
      }
    },
    {
      name: 'Oxen wandered off',
      chance: 5,
      handler: (state: GameState) => {
        const lostOxen = randomInt(1, 2);
        
        if (state.supplies.oxen > lostOxen) {
          state.supplies.oxen -= lostOxen;
          state.events.push(`${lostOxen} of your oxen wandered off during the night.`);
          state.messages.push(`${lostOxen} of your oxen wandered off during the night.`);
        } else {
          state.events.push('Your last ox wandered off during the night!');
          state.messages.push('Your last ox wandered off during the night! Without an ox, your wagon cannot move.');
          // This is a serious problem - can't continue without oxen
          // Game should enter a special state
        }
      }
    },
    {
      name: 'Theft',
      chance: 5,
      handler: (state: GameState) => {
        // Determine what was stolen
        const stolenItems = ['food', 'ammunition', 'clothing'];
        const stolenItem = stolenItems[randomInt(0, 2)];
        
        if (stolenItem === 'food' && state.supplies.food > 0) {
          const amountStolen = randomInt(10, 30);
          state.supplies.food = Math.max(0, state.supplies.food - amountStolen);
          state.events.push(`${amountStolen} pounds of food was stolen during the night.`);
          state.messages.push(`${amountStolen} pounds of food was stolen during the night.`);
        } else if (stolenItem === 'ammunition' && state.supplies.ammunition > 0) {
          const amountStolen = randomInt(1, 2);
          state.supplies.ammunition = Math.max(0, state.supplies.ammunition - amountStolen);
          state.events.push(`${amountStolen} boxes of ammunition were stolen.`);
          state.messages.push(`${amountStolen} boxes of ammunition were stolen.`);
        } else if (stolenItem === 'clothing' && state.supplies.clothing > 0) {
          const amountStolen = randomInt(1, 2);
          state.supplies.clothing = Math.max(0, state.supplies.clothing - amountStolen);
          state.events.push(`${amountStolen} sets of clothing were stolen.`);
          state.messages.push(`${amountStolen} sets of clothing were stolen.`);
        }
      }
    },
    {
      name: 'Bad weather',
      chance: 10,
      handler: (state: GameState) => {
        // Determine weather type based on current weather
        const isWinter = state.month === 12 || state.month <= 2;
        const isSummer = state.month >= 6 && state.month <= 8;
        
        if (isWinter) {
          state.weather = 'snowy';
          state.events.push('A blizzard has set in!');
          state.messages.push('A severe blizzard has set in! Travel will be difficult and dangerous.');
        } else if (isSummer) {
          state.weather = 'very hot';
          state.events.push('A severe heat wave has begun!');
          state.messages.push('A severe heat wave has begun! Travel will be exhausting and water will be scarce.');
        } else {
          state.weather = 'rainy';
          state.events.push('Heavy rain has set in!');
          state.messages.push('Heavy rain has set in! The trail is muddy and progress will be slower.');
        }
      }
    },
  ];
  
  // Filter events by their chance of happening
  const possibleEvents = events.filter(event => randomValue <= event.chance);
  
  // If any events are possible, pick one randomly and execute it
  if (possibleEvents.length > 0) {
    const selectedEvent = possibleEvents[randomInt(0, possibleEvents.length - 1)];
    selectedEvent.handler(gameState);
    return true; // Return true to indicate an event occurred
  }
  
  return false; // Return false if no event occurred
};