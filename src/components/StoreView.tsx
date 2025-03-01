import React, { useState } from 'react';
import { GameState, Supply } from '../game/gameState';

interface StoreViewProps {
  gameState: GameState;
  onPurchase: (updatedSupplies: Supply) => void;
  onClose: () => void;
}

interface ItemPrice {
  food: number; // per pound
  ammunition: number; // per box (20 bullets)
  clothing: number; // per set
  oxen: number; // per ox
  wheelPart: number; // per wheel
  axlePart: number; // per axle
  tonguePart: number; // per tongue
}

const StoreView: React.FC<StoreViewProps> = ({ gameState, onPurchase, onClose }) => {
  const { supplies } = gameState;
  
  // Store prices
  const prices: ItemPrice = {
    food: 0.20,      // $0.20 per pound
    ammunition: 2.00, // $2.00 per box
    clothing: 10.00,  // $10.00 per set
    oxen: 40.00,      // $40.00 per ox
    wheelPart: 10.00, // $10.00 per wheel
    axlePart: 10.00,  // $10.00 per axle
    tonguePart: 10.00, // $10.00 per tongue
  };
  
  // State for quantities to purchase
  const [quantities, setQuantities] = useState({
    food: 0,
    ammunition: 0,
    clothing: 0,
    oxen: 0,
    wheels: 0,
    axles: 0,
    tongues: 0
  });
  
  // Calculate total cost
  const totalCost = 
    quantities.food * prices.food +
    quantities.ammunition * prices.ammunition +
    quantities.clothing * prices.clothing +
    quantities.oxen * prices.oxen +
    quantities.wheels * prices.wheelPart +
    quantities.axles * prices.axlePart +
    quantities.tongues * prices.tonguePart;
  
  // Handle quantity changes
  const handleQuantityChange = (item: keyof typeof quantities, value: number) => {
    if (value < 0) value = 0;
    setQuantities({
      ...quantities,
      [item]: value
    });
  };
  
  // Handle purchase
  const handlePurchase = () => {
    if (totalCost > supplies.cash) {
      alert("You don't have enough money for this purchase!");
      return;
    }
    
    const updatedSupplies: Supply = {
      ...supplies,
      food: supplies.food + quantities.food,
      ammunition: supplies.ammunition + quantities.ammunition,
      clothing: supplies.clothing + quantities.clothing,
      oxen: supplies.oxen + quantities.oxen,
      spareParts: {
        wheels: supplies.spareParts.wheels + quantities.wheels,
        axles: supplies.spareParts.axles + quantities.axles,
        tongues: supplies.spareParts.tongues + quantities.tongues,
      },
      cash: supplies.cash - totalCost
    };
    
    onPurchase(updatedSupplies);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4 text-green-500">General Store</h2>
        <p className="mb-4 text-gray-300">You have: ${supplies.cash.toFixed(2)}</p>
        
        <div className="mb-6 space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-green-400">Food and Ammunition</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span>Food: </span>
                  <span className="text-gray-400">(${prices.food.toFixed(2)}/pound)</span>
                </div>
                <div className="flex items-center">
                  <button 
                    onClick={() => handleQuantityChange('food', quantities.food - 10)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-l-md hover:bg-gray-500"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={quantities.food}
                    onChange={(e) => handleQuantityChange('food', parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-center bg-gray-600 text-white border-x border-gray-500"
                  />
                  <button 
                    onClick={() => handleQuantityChange('food', quantities.food + 10)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-r-md hover:bg-gray-500"
                  >
                    +
                  </button>
                  <span className="ml-4">${(quantities.food * prices.food).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span>Ammunition: </span>
                  <span className="text-gray-400">(${prices.ammunition.toFixed(2)}/box - 20 bullets)</span>
                </div>
                <div className="flex items-center">
                  <button 
                    onClick={() => handleQuantityChange('ammunition', quantities.ammunition - 1)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-l-md hover:bg-gray-500"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={quantities.ammunition}
                    onChange={(e) => handleQuantityChange('ammunition', parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-center bg-gray-600 text-white border-x border-gray-500"
                  />
                  <button 
                    onClick={() => handleQuantityChange('ammunition', quantities.ammunition + 1)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-r-md hover:bg-gray-500"
                  >
                    +
                  </button>
                  <span className="ml-4">${(quantities.ammunition * prices.ammunition).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-green-400">Clothing and Oxen</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span>Clothing: </span>
                  <span className="text-gray-400">(${prices.clothing.toFixed(2)}/set)</span>
                </div>
                <div className="flex items-center">
                  <button 
                    onClick={() => handleQuantityChange('clothing', quantities.clothing - 1)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-l-md hover:bg-gray-500"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={quantities.clothing}
                    onChange={(e) => handleQuantityChange('clothing', parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-center bg-gray-600 text-white border-x border-gray-500"
                  />
                  <button 
                    onClick={() => handleQuantityChange('clothing', quantities.clothing + 1)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-r-md hover:bg-gray-500"
                  >
                    +
                  </button>
                  <span className="ml-4">${(quantities.clothing * prices.clothing).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span>Oxen: </span>
                  <span className="text-gray-400">(${prices.oxen.toFixed(2)}/ox, you have {supplies.oxen})</span>
                </div>
                <div className="flex items-center">
                  <button 
                    onClick={() => handleQuantityChange('oxen', quantities.oxen - 1)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-l-md hover:bg-gray-500"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={quantities.oxen}
                    onChange={(e) => handleQuantityChange('oxen', parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-center bg-gray-600 text-white border-x border-gray-500"
                  />
                  <button 
                    onClick={() => handleQuantityChange('oxen', quantities.oxen + 1)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-r-md hover:bg-gray-500"
                  >
                    +
                  </button>
                  <span className="ml-4">${(quantities.oxen * prices.oxen).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-green-400">Spare Parts</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span>Wagon wheels: </span>
                  <span className="text-gray-400">(${prices.wheelPart.toFixed(2)}/wheel)</span>
                </div>
                <div className="flex items-center">
                  <button 
                    onClick={() => handleQuantityChange('wheels', quantities.wheels - 1)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-l-md hover:bg-gray-500"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={quantities.wheels}
                    onChange={(e) => handleQuantityChange('wheels', parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-center bg-gray-600 text-white border-x border-gray-500"
                  />
                  <button 
                    onClick={() => handleQuantityChange('wheels', quantities.wheels + 1)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-r-md hover:bg-gray-500"
                  >
                    +
                  </button>
                  <span className="ml-4">${(quantities.wheels * prices.wheelPart).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span>Wagon axles: </span>
                  <span className="text-gray-400">(${prices.axlePart.toFixed(2)}/axle)</span>
                </div>
                <div className="flex items-center">
                  <button 
                    onClick={() => handleQuantityChange('axles', quantities.axles - 1)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-l-md hover:bg-gray-500"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={quantities.axles}
                    onChange={(e) => handleQuantityChange('axles', parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-center bg-gray-600 text-white border-x border-gray-500"
                  />
                  <button 
                    onClick={() => handleQuantityChange('axles', quantities.axles + 1)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-r-md hover:bg-gray-500"
                  >
                    +
                  </button>
                  <span className="ml-4">${(quantities.axles * prices.axlePart).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span>Wagon tongues: </span>
                  <span className="text-gray-400">(${prices.tonguePart.toFixed(2)}/tongue)</span>
                </div>
                <div className="flex items-center">
                  <button 
                    onClick={() => handleQuantityChange('tongues', quantities.tongues - 1)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-l-md hover:bg-gray-500"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={quantities.tongues}
                    onChange={(e) => handleQuantityChange('tongues', parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-center bg-gray-600 text-white border-x border-gray-500"
                  />
                  <button 
                    onClick={() => handleQuantityChange('tongues', quantities.tongues + 1)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-r-md hover:bg-gray-500"
                  >
                    +
                  </button>
                  <span className="ml-4">${(quantities.tongues * prices.tonguePart).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-green-400">Total Cost:</h3>
            <span className="text-xl font-semibold text-green-400">${totalCost.toFixed(2)}</span>
          </div>
          {totalCost > supplies.cash && (
            <p className="text-red-500 mt-2">You don't have enough money for this purchase!</p>
          )}
        </div>
        
        <div className="mt-6 flex justify-between">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
          >
            Cancel
          </button>
          <button 
            onClick={handlePurchase}
            disabled={totalCost === 0 || totalCost > supplies.cash}
            className={`px-4 py-2 text-white rounded-md transition duration-200 ${
              totalCost === 0 || totalCost > supplies.cash 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Make Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreView;