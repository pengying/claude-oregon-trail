import React, { useState } from 'react';
import { Milestone, GameState } from '../game/gameState';
import { riverCrossing } from '../game/gameLogic';

interface RiverCrossingProps {
  gameState: GameState;
  onCrossing: (
    success: boolean, 
    message: string, 
    damageTaken?: { food: number; supplies: boolean; injury: boolean }, 
    daysLost?: number, 
    cost?: number
  ) => void;
  onClose: () => void;
}

const RiverCrossing: React.FC<RiverCrossingProps> = ({ gameState, onCrossing, onClose }) => {
  const [selectedOption, setSelectedOption] = useState<'ford' | 'ferry' | 'caulk' | 'wait'>('ford');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState('');
  
  const river = gameState.nextMilestone.riverData;
  
  // If there's no river data, return to trail
  if (!river) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full">
          <h2 className="text-2xl font-bold mb-4 text-green-500">No River to Cross</h2>
          <p className="mb-6">There is no river to cross at this location.</p>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Return to Trail
          </button>
        </div>
      </div>
    );
  }
  
  const handleCrossing = () => {
    const result = riverCrossing(
      river.depth,
      river.width,
      selectedOption,
      gameState.supplies.cash,
      gameState.weather
    );
    
    setMessage(result.message);
    setShowConfirmation(true);
    
    onCrossing(
      result.success,
      result.message,
      result.damage,
      result.daysLost,
      result.cost
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4 text-green-500">
          River Crossing - {gameState.nextMilestone.name}
        </h2>
        
        <div className="mb-6 bg-gray-700 p-4 rounded-lg">
          <p className="mb-2">The river is {river.width} feet wide and {river.depth} feet deep.</p>
          <p className="text-sm text-gray-400">Current weather: {gameState.weather}</p>
        </div>
        
        {!showConfirmation ? (
          <>
            <div className="mb-6">
              <h3 className="font-bold mb-2">How would you like to cross?</h3>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <input 
                    type="radio" 
                    name="crossing"
                    checked={selectedOption === 'ford'}
                    onChange={() => setSelectedOption('ford')}
                    className="form-radio h-4 w-4 text-green-600"
                  />
                  <div>
                    <p className="font-semibold">Attempt to ford the river</p>
                    <p className="text-sm text-gray-400">
                      Attempt to walk across. Only safe if river is less than 3 feet deep.
                    </p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <input 
                    type="radio" 
                    name="crossing"
                    checked={selectedOption === 'caulk'}
                    onChange={() => setSelectedOption('caulk')}
                    className="form-radio h-4 w-4 text-green-600"
                  />
                  <div>
                    <p className="font-semibold">Caulk the wagon and float across</p>
                    <p className="text-sm text-gray-400">
                      Seal the wagon and float it like a boat. Risky in bad weather.
                    </p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <input 
                    type="radio" 
                    name="crossing"
                    checked={selectedOption === 'ferry'}
                    onChange={() => setSelectedOption('ferry')}
                    className="form-radio h-4 w-4 text-green-600"
                  />
                  <div>
                    <p className="font-semibold">Take a ferry</p>
                    <p className="text-sm text-gray-400">
                      Pay ${Math.floor(river.width / 20)} to use the ferry. Safe but costs money.
                    </p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <input 
                    type="radio" 
                    name="crossing"
                    checked={selectedOption === 'wait'}
                    onChange={() => setSelectedOption('wait')}
                    className="form-radio h-4 w-4 text-green-600"
                  />
                  <div>
                    <p className="font-semibold">Wait for conditions to improve</p>
                    <p className="text-sm text-gray-400">
                      Rest 2-5 days and hope the river level goes down. Consumes food but may be safer.
                    </p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleCrossing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Attempt Crossing
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p>{message}</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RiverCrossing;