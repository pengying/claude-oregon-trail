'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TravelMap from '../components/TravelMap';
import SuppliesView from '../components/SuppliesView';
import HuntingGame from '../components/HuntingGame';
import RiverCrossing from '../components/RiverCrossing';
import StoreView from '../components/StoreView';
import WagonAnimation from '../components/WagonAnimation';
import { GameState, initializeGame, milestones, Supply } from '../game/gameState';
import { advanceTurn, goHunting } from '../game/gameLogic';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [companions, setCompanions] = useState(['', '', '', '']);
  const [occupation, setOccupation] = useState('banker');
  const [showInstructions, setShowInstructions] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showSupplies, setShowSupplies] = useState(false);
  const [showHunting, setShowHunting] = useState(false);
  const [showRiverCrossing, setShowRiverCrossing] = useState(false);
  const [showPaceSelection, setShowPaceSelection] = useState(false);
  const [showRationsSelection, setShowRationsSelection] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showWagonAnimation, setShowWagonAnimation] = useState(false);
  const [animationDays, setAnimationDays] = useState(1);
  const [pendingGameUpdate, setPendingGameUpdate] = useState<GameState | null>(null);
  const [messagesToShow, setMessagesToShow] = useState<string[]>([]);
  const [isAutoTraveling, setIsAutoTraveling] = useState(false);
  const [shouldStopAutoTravel, setShouldStopAutoTravel] = useState(false);

  // Initialize game state when game starts
  useEffect(() => {
    if (gameStarted && gameState === null) {
      const newGameState = initializeGame(
        playerName,
        companions.filter(name => name.trim() !== ''),
        occupation as any
      );
      // Add milestones to game state
      newGameState.milestones = milestones;
      setGameState(newGameState);
      setMessagesToShow(newGameState.messages);
    }
  }, [gameStarted, gameState, playerName, companions, occupation]);
  
  // Setup key press listener for stopping auto-travel
  useEffect(() => {
    if (isAutoTraveling) {
      const handleKeyDown = () => {
        setShouldStopAutoTravel(true);
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      // Return cleanup function
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isAutoTraveling]);

  const handleNameChange = (index: number, value: string) => {
    if (index === 0) {
      setPlayerName(value);
    } else {
      const newCompanions = [...companions];
      newCompanions[index - 1] = value;
      setCompanions(newCompanions);
    }
  };

  const handleStartGame = () => {
    // Validate player name
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    // Start the game!
    setGameStarted(true);
  };

  const handleContinueOnTrail = () => {
    if (!gameState) return;
    
    // Check if at a river crossing
    if (gameState.nextMilestone.type === 'river') {
      setShowRiverCrossing(true);
      return;
    }
    
    // Advance the game by one day
    const updatedGameState = advanceTurn(gameState);
    
    // Show wagon animation and save the updated state to apply after animation
    setAnimationDays(1);
    setPendingGameUpdate(updatedGameState);
    setShowWagonAnimation(true);
  };
  
  // Handle animation completion
  const handleAnimationComplete = () => {
    if (pendingGameUpdate) {
      setGameState(pendingGameUpdate);
      
      // Show any new messages
      if (pendingGameUpdate.messages.length > 0) {
        setMessagesToShow(pendingGameUpdate.messages);
      }
      
      // Reset the pending update
      setPendingGameUpdate(null);
      
      // Check if auto-traveling and should continue
      if (isAutoTraveling && !shouldStopAutoTravel && !pendingGameUpdate.hadSignificantEvent) {
        // Continue auto-travel after a small delay
        setTimeout(() => {
          continueAutoTravel();
        }, 500);
      } else if (isAutoTraveling) {
        // Stop auto travel if we should stop or had an event
        setIsAutoTraveling(false);
        setShouldStopAutoTravel(false);
        
        if (pendingGameUpdate.hadSignificantEvent) {
          setMessagesToShow([...pendingGameUpdate.messages, 'Auto-travel stopped due to an event.']);
        } else {
          setMessagesToShow([...pendingGameUpdate.messages, 'Auto-travel stopped.']);
        }
      }
    }
    
    // Hide the animation
    setShowWagonAnimation(false);
  };

  // Start or continue auto-travel
  const startAutoTravel = () => {
    if (!gameState) return;
    
    // Set auto-travel state
    setIsAutoTraveling(true);
    setShouldStopAutoTravel(false);
    
    // Display message about auto-travel
    setMessagesToShow(['Auto-travel started. The journey will continue until an event occurs or you press any key to stop.']);
    
    // Start the auto-travel process
    continueAutoTravel();
  };
  
  // Continue auto-travel for one day
  const continueAutoTravel = () => {
    if (!gameState || !isAutoTraveling || shouldStopAutoTravel) {
      setIsAutoTraveling(false);
      setShouldStopAutoTravel(false);
      return;
    }
    
    // Check if at a river crossing (auto-travel should stop)
    if (gameState.nextMilestone.type === 'river') {
      setShowRiverCrossing(true);
      setIsAutoTraveling(false);
      return;
    }
    
    // Advance the game by one day
    const updatedGameState = advanceTurn(gameState);
    
    // Show wagon animation and save the updated state
    setAnimationDays(1);
    setPendingGameUpdate(updatedGameState);
    setShowWagonAnimation(true);
  };

  const handleChangePace = (newPace: 'steady' | 'strenuous' | 'grueling' | 'resting') => {
    if (!gameState) return;
    
    const updatedGameState = { 
      ...gameState,
      pace: newPace,
      messages: [`You changed your pace to ${newPace}.`]
    };
    
    setGameState(updatedGameState);
    setMessagesToShow(updatedGameState.messages);
    setShowPaceSelection(false);
  };

  const handleChangeRations = (newRations: 'filling' | 'meager' | 'bare bones' | 'none') => {
    if (!gameState) return;
    
    const updatedGameState = { 
      ...gameState,
      rations: newRations,
      messages: [`You changed your rations to ${newRations}.`]
    };
    
    setGameState(updatedGameState);
    setMessagesToShow(updatedGameState.messages);
    setShowRationsSelection(false);
  };

  const handleRest = () => {
    if (!gameState) return;
    
    // Rest for a day (using the pace 'resting')
    const restGameState = { ...gameState, pace: 'resting' };
    const updatedGameState = advanceTurn(restGameState);
    
    updatedGameState.messages = ['You rested for a day. Your party\'s health may improve.'];
    
    // Show a brief "resting" animation
    setAnimationDays(1);
    setPendingGameUpdate(updatedGameState);
    setShowWagonAnimation(true);
  };

  const handleHuntingSuccess = (foodGained: number, bulletsUsed: number) => {
    if (!gameState) return;
    
    // Update game state with hunting results
    const updatedGameState = { 
      ...gameState,
      supplies: {
        ...gameState.supplies,
        food: gameState.supplies.food + foodGained,
        ammunition: gameState.supplies.ammunition - Math.ceil(bulletsUsed / 20) // 20 bullets per box
      },
      messages: [`Hunting successful! You got ${foodGained} pounds of food using ${bulletsUsed} bullets.`]
    };
    
    setGameState(updatedGameState);
    setMessagesToShow(updatedGameState.messages);
  };

  const handleHuntingFailure = (bulletsUsed: number) => {
    if (!gameState) return;
    
    // Update game state with hunting results (just ammunition loss)
    const updatedGameState = { 
      ...gameState,
      supplies: {
        ...gameState.supplies,
        ammunition: gameState.supplies.ammunition - Math.ceil(bulletsUsed / 20) // 20 bullets per box
      },
      messages: ['Your hunting was unsuccessful. Better luck next time.']
    };
    
    setGameState(updatedGameState);
    setMessagesToShow(updatedGameState.messages);
  };

  const handleRiverCrossing = (
    success: boolean, 
    message: string, 
    damageTaken?: { food: number; supplies: boolean; injury: boolean },
    daysLost?: number,
    cost?: number
  ) => {
    if (!gameState) return;
    
    let updatedGameState = { ...gameState };
    
    // Apply consequences
    if (cost) {
      updatedGameState.supplies.cash = Math.max(0, updatedGameState.supplies.cash - cost);
    }
    
    if (damageTaken) {
      // Food damage
      updatedGameState.supplies.food = Math.max(0, updatedGameState.supplies.food - damageTaken.food);
      
      // Supply damage (lose a random spare part)
      if (damageTaken.supplies) {
        const parts = ['wheels', 'axles', 'tongues'] as const;
        const randomPart = parts[Math.floor(Math.random() * parts.length)];
        
        if (updatedGameState.supplies.spareParts[randomPart] > 0) {
          updatedGameState.supplies.spareParts[randomPart] -= 1;
          updatedGameState.messages.push(`You lost a spare ${randomPart.slice(0, -1)} in the river.`);
        }
      }
      
      // Injury (random party member gets sick or injured)
      if (damageTaken.injury) {
        const allPeople = [updatedGameState.partyLeader, ...updatedGameState.companions]
          .filter(person => person.isAlive);
        
        if (allPeople.length > 0) {
          const randomIndex = Math.floor(Math.random() * allPeople.length);
          const person = allPeople[randomIndex];
          
          // Determine if it's the leader or a companion
          if (person.name === updatedGameState.partyLeader.name) {
            updatedGameState.partyLeader.health = 'poor';
            updatedGameState.partyLeader.illness = 'injured during river crossing';
          } else {
            const companionIndex = updatedGameState.companions.findIndex(c => c.name === person.name);
            if (companionIndex !== -1) {
              updatedGameState.companions[companionIndex].health = 'poor';
              updatedGameState.companions[companionIndex].illness = 'injured during river crossing';
            }
          }
          
          updatedGameState.messages.push(`${person.name} was injured during the river crossing.`);
        }
      }
    }
    
    // Advance time by the number of days lost
    if (daysLost) {
      for (let i = 0; i < daysLost; i++) {
        updatedGameState = advanceTurn(updatedGameState);
      }
    }
    
    // If crossing was successful, move past the river
    if (success) {
      // If we're at a river, move past it
      if (updatedGameState.nextMilestone.type === 'river') {
        // Update miles traveled to be just past the river
        updatedGameState.milesTraveled = updatedGameState.nextMilestone.distance + 1;
        
        // Set the current location to indicate we crossed the river
        updatedGameState.currentLocation = `Crossed ${updatedGameState.nextMilestone.name}`;
        
        // Get the next milestone
        updatedGameState.nextMilestone = milestones.find(m => m.distance > updatedGameState.milesTraveled) || milestones[milestones.length - 1];
        
        // Add a river crossing achievement to events
        updatedGameState.events.push(`Successfully crossed ${updatedGameState.nextMilestone.name}`);
      }
    }
    
    updatedGameState.messages = [message];
    
    setGameState(updatedGameState);
    setMessagesToShow(updatedGameState.messages);
  };
  
  const handlePurchase = (updatedSupplies: Supply) => {
    if (!gameState) return;
    
    const updatedGameState = {
      ...gameState,
      supplies: updatedSupplies,
      messages: ['You purchased new supplies from the general store.']
    };
    
    setGameState(updatedGameState);
    setMessagesToShow(updatedGameState.messages);
    setShowStore(false);
  };

  const formatDate = (month: number, day: number, year: number) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return `${monthNames[month - 1]} ${day}, ${year}`;
  };

  if (showInstructions) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-green-500">Oregon Trail - Instructions</h1>
        
        <div className="mb-6">
          <p className="mb-4">
            Try to get to Oregon by traveling the Oregon Trail! You start in Independence, Missouri in 1848 with your family and must make it to Oregon&apos;s Willamette Valley before winter.
          </p>
          
          <h2 className="text-xl font-bold mb-2 text-green-400">Gameplay</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Manage your supplies (food, ammunition, clothing, etc.)</li>
            <li>Make decisions about rest, pace, and river crossings</li>
            <li>Hunt for food when supplies run low</li>
            <li>Deal with random events like illness, bad weather, and broken wagon parts</li>
          </ul>
          
          <h2 className="text-xl font-bold mb-2 text-green-400">Occupations</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Banker:</strong> Start with more money ($1600) but score fewer points</li>
            <li><strong>Carpenter:</strong> Medium starting money ($800) and points</li>
            <li><strong>Farmer:</strong> Less starting money ($400) but score more points</li>
          </ul>
        </div>
        
        <button 
          onClick={() => setShowInstructions(false)}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
        >
          Return to Main Menu
        </button>
      </div>
    );
  }
  
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-green-500">The Oregon Trail</h1>
        
        <div className="w-full p-6 bg-gray-800 rounded-lg shadow-lg mb-8">
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Choose your occupation:</label>
            <select 
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
            >
              <option value="banker">Banker from Boston ($1600)</option>
              <option value="carpenter">Carpenter from Ohio ($800)</option>
              <option value="farmer">Farmer from Illinois ($400)</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">What is your name?</label>
            <input 
              type="text"
              value={playerName}
              onChange={(e) => handleNameChange(0, e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              placeholder="Enter your name"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">What are the names of your companions?</label>
            {companions.map((name, index) => (
              <input 
                key={index}
                type="text"
                value={name}
                onChange={(e) => handleNameChange(index + 1, e.target.value)}
                className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                placeholder={`Companion ${index + 1}`}
              />
            ))}
          </div>
          
          <div className="flex gap-4 justify-center">
            <button 
              onClick={handleStartGame}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
            >
              Start Game
            </button>
            <button 
              onClick={() => setShowInstructions(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
            >
              Instructions
            </button>
          </div>
        </div>
        
        <div className="text-center text-gray-400 text-sm">
          <p>© 2025 Oregon Trail Web Edition</p>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return <div className="text-center p-12">Loading game...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-green-500">Oregon Trail</h1>
        
        {/* Permanent Wagon Animation - Always visible on main interface */}
        <div className="mb-6">
          <WagonAnimation 
            dayCount={animationDays}
            onAnimationComplete={handleAnimationComplete}
            startDate={{
              day: gameState.day,
              month: gameState.month,
              year: gameState.year
            }}
            gameState={gameState}
            isAnimating={showWagonAnimation}
            isActive={true} // Always show wagon but only animate when traveling
            currentLocation={gameState.currentLocation}
          />
        </div>
        
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="flex justify-between mb-4">
            <div>
              <h2 className="font-bold">Date: {formatDate(gameState.month, gameState.day, gameState.year)}</h2>
              <p>Weather: {gameState.weather}</p>
            </div>
            <div>
              <h2 className="font-bold">Location: {gameState.currentLocation}</h2>
              <p>Miles traveled: {gameState.milesTraveled}</p>
            </div>
          </div>
          
          <div className="flex justify-between">
            <div>
              <h2 className="font-bold">Health:</h2>
              <p>You ({gameState.partyLeader.name}): {gameState.partyLeader.health}</p>
              {gameState.companions.filter(c => c.name.trim()).map((companion, index) => (
                <p key={index}>{companion.name}: {companion.health}</p>
              ))}
            </div>
            <div>
              <h2 className="font-bold">Supplies:</h2>
              <p>Food: {gameState.supplies.food} lbs</p>
              <p>Ammunition: {gameState.supplies.ammunition} boxes</p>
              <p>Money: ${gameState.supplies.cash.toFixed(2)}</p>
              <p>Pace: {gameState.pace}</p>
              <p>Rations: {gameState.rations}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <button 
            onClick={handleContinueOnTrail}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200">
            Continue on trail
          </button>
          {/* Auto-travel button */}
          <button 
            onClick={startAutoTravel}
            disabled={isAutoTraveling || gameState.nextMilestone.type === 'river'}
            className={`px-4 py-2 text-white rounded-md transition duration-200 ${
              isAutoTraveling || gameState.nextMilestone.type === 'river' 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-green-800 hover:bg-green-900'
            }`}
            title={gameState.nextMilestone.type === 'river' ? "Cannot auto-travel when approaching a river" : ""}
          >
            {isAutoTraveling ? "Auto-traveling..." : "Auto-travel to next event"}
          </button>
          <button 
            onClick={() => setShowSupplies(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200">
            Check supplies
          </button>
          <button 
            onClick={() => setShowStore(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200">
            Buy supplies
          </button>
          <button 
            onClick={() => setShowMap(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200">
            Look at map
          </button>
          <button 
            onClick={() => setShowPaceSelection(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200">
            Change pace
          </button>
          <button 
            onClick={() => setShowRationsSelection(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200">
            Change rations
          </button>
          <button 
            onClick={handleRest}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200">
            Stop to rest
          </button>
          <button 
            onClick={() => setShowHunting(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200">
            Hunt for food
          </button>
        </div>
        
        <div className="p-4 bg-gray-700 rounded-lg mb-6">
          {messagesToShow.map((message, index) => (
            <p key={index} className="italic mb-2">{message}</p>
          ))}
        </div>
        
        <button 
          onClick={() => {
            setGameStarted(false);
            setGameState(null);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
        >
          Return to Main Menu
        </button>
      </div>
      
      {/* Map Modal */}
      {showMap && gameState && (
        <TravelMap 
          gameState={gameState} 
          onClose={() => setShowMap(false)} 
        />
      )}
      
      {/* Supplies Modal */}
      {showSupplies && gameState && (
        <SuppliesView 
          gameState={gameState} 
          onClose={() => setShowSupplies(false)} 
        />
      )}
      
      {/* Hunting Game */}
      {showHunting && gameState && (
        <HuntingGame 
          onSuccess={handleHuntingSuccess}
          onFailure={handleHuntingFailure}
          onExit={() => setShowHunting(false)}
          availableBullets={gameState.supplies.ammunition * 20} // 20 bullets per box
        />
      )}
      
      {/* River Crossing */}
      {showRiverCrossing && gameState && (
        <RiverCrossing 
          gameState={gameState} 
          onCrossing={handleRiverCrossing}
          onClose={() => setShowRiverCrossing(false)} 
        />
      )}
      
      {/* Pace Selection */}
      {showPaceSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-green-500">Change Pace</h2>
            
            <div className="mb-6 space-y-3">
              <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="pace"
                  checked={true}
                  onChange={() => handleChangePace('steady')}
                  className="form-radio h-4 w-4 text-green-600"
                />
                <div>
                  <p className="font-semibold">Steady (15 miles per day)</p>
                  <p className="text-sm text-gray-400">
                    A reasonable pace that balances progress with health.
                  </p>
                </div>
              </label>
              
              <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="pace"
                  checked={false}
                  onChange={() => handleChangePace('strenuous')}
                  className="form-radio h-4 w-4 text-green-600"
                />
                <div>
                  <p className="font-semibold">Strenuous (20 miles per day)</p>
                  <p className="text-sm text-gray-400">
                    Faster pace that may impact health slightly.
                  </p>
                </div>
              </label>
              
              <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="pace"
                  checked={false}
                  onChange={() => handleChangePace('grueling')}
                  className="form-radio h-4 w-4 text-green-600"
                />
                <div>
                  <p className="font-semibold">Grueling (25 miles per day)</p>
                  <p className="text-sm text-gray-400">
                    Maximum speed but may cause health problems.
                  </p>
                </div>
              </label>
              
              <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="pace"
                  checked={false}
                  onChange={() => handleChangePace('resting')}
                  className="form-radio h-4 w-4 text-green-600"
                />
                <div>
                  <p className="font-semibold">Resting (0 miles per day)</p>
                  <p className="text-sm text-gray-400">
                    No travel but health may improve.
                  </p>
                </div>
              </label>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setShowPaceSelection(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Rations Selection */}
      {showRationsSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-green-500">Change Rations</h2>
            
            <div className="mb-6 space-y-3">
              <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="rations"
                  checked={true}
                  onChange={() => handleChangeRations('filling')}
                  className="form-radio h-4 w-4 text-green-600"
                />
                <div>
                  <p className="font-semibold">Filling (3 lbs per person per day)</p>
                  <p className="text-sm text-gray-400">
                    Plenty of food to maintain health and energy.
                  </p>
                </div>
              </label>
              
              <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="rations"
                  checked={false}
                  onChange={() => handleChangeRations('meager')}
                  className="form-radio h-4 w-4 text-green-600"
                />
                <div>
                  <p className="font-semibold">Meager (2 lbs per person per day)</p>
                  <p className="text-sm text-gray-400">
                    Just enough food to get by without health impacts.
                  </p>
                </div>
              </label>
              
              <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="rations"
                  checked={false}
                  onChange={() => handleChangeRations('bare bones')}
                  className="form-radio h-4 w-4 text-green-600"
                />
                <div>
                  <p className="font-semibold">Bare bones (1 lb per person per day)</p>
                  <p className="text-sm text-gray-400">
                    Minimum food needed; may cause health to deteriorate.
                  </p>
                </div>
              </label>
              
              <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="rations"
                  checked={false}
                  onChange={() => handleChangeRations('none')}
                  className="form-radio h-4 w-4 text-green-600"
                />
                <div>
                  <p className="font-semibold">None (0 lbs per person per day)</p>
                  <p className="text-sm text-gray-400">
                    No food. Health will rapidly deteriorate.
                  </p>
                </div>
              </label>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setShowRationsSelection(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Store View */}
      {showStore && gameState && (
        <StoreView 
          gameState={gameState} 
          onPurchase={handlePurchase}
          onClose={() => setShowStore(false)} 
        />
      )}
      
      {/* Integrated Wagon Animation - No longer a modal */}
    </div>
  );
}