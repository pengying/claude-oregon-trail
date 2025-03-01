import React from 'react';
import { GameState } from '../game/gameState';

interface SuppliesViewProps {
  gameState: GameState;
  onClose: () => void;
}

const SuppliesView: React.FC<SuppliesViewProps> = ({ gameState, onClose }) => {
  const { supplies, occupation } = gameState;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4 text-green-500">Your Supplies</h2>
        
        <div className="mb-6 space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-green-400">Food and Ammunition</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Food:</span>
                <span className="font-mono">{supplies.food} pounds</span>
              </li>
              <li className="flex justify-between">
                <span>Ammunition:</span>
                <span className="font-mono">{supplies.ammunition} boxes ({supplies.ammunition * 20} bullets)</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-green-400">Clothing and Oxen</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Clothing:</span>
                <span className="font-mono">{supplies.clothing} sets</span>
              </li>
              <li className="flex justify-between">
                <span>Oxen:</span>
                <span className="font-mono">{supplies.oxen} (need at least 2 to travel)</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-green-400">Spare Parts</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Wagon wheels:</span>
                <span className="font-mono">{supplies.spareParts.wheels}</span>
              </li>
              <li className="flex justify-between">
                <span>Wagon axles:</span>
                <span className="font-mono">{supplies.spareParts.axles}</span>
              </li>
              <li className="flex justify-between">
                <span>Wagon tongues:</span>
                <span className="font-mono">{supplies.spareParts.tongues}</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-green-400">Money</h3>
            <p className="flex justify-between">
              <span>Cash on hand:</span>
              <span className="font-mono">${supplies.cash.toFixed(2)}</span>
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {occupation === 'banker' 
                ? 'As a banker, you started with more money but will score fewer points.'
                : occupation === 'carpenter'
                  ? 'As a carpenter, you started with a moderate amount of money and will earn moderate points.'
                  : 'As a farmer, you started with less money but will score more points at the end.'}
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuppliesView;