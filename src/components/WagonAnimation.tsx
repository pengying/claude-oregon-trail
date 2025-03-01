import React, { useEffect, useState, useRef } from 'react';
import { GameState } from '../game/gameState';

interface WagonAnimationProps {
  onAnimationComplete?: () => void;
  dayCount?: number;
  startDate?: {
    day: number;
    month: number;
    year: number;
  };
  gameState?: GameState;
  isAnimating?: boolean; // Whether animation is running
  isActive?: boolean; // Whether component should be shown (even when not animating)
  currentLocation?: string; // Current location text to display
}

const WagonAnimation: React.FC<WagonAnimationProps> = ({ 
  onAnimationComplete,
  dayCount = 1,
  startDate = { day: 1, month: 3, year: 1848 },
  gameState,
  isAnimating = true,
  isActive = true,
  currentLocation = "On the trail"
}) => {
  const [position, setPosition] = useState(0);
  const [showAnimation, setShowAnimation] = useState(isAnimating);
  const [currentDay, setCurrentDay] = useState(1);
  const [date, setDate] = useState(startDate);
  const [staticPosition, setStaticPosition] = useState(30); // Default position when not animating
  
  // Animation timing
  const animationDuration = 3000; // 3 seconds per day
  const frameRate = 50; // Update every 50ms
  const totalFrames = animationDuration / frameRate;
  const movePerFrame = 100 / totalFrames;
  
  // Track location type for context-specific messages
  const locationRef = useRef(currentLocation);
  const [locationType, setLocationType] = useState<'trail'|'town'|'river'|'fort'|'landmark'>('trail');
  
  // Update location type based on current location
  useEffect(() => {
    locationRef.current = currentLocation;
    
    // Determine location type based on name
    if (currentLocation?.toLowerCase().includes('river')) {
      setLocationType('river');
    } else if (currentLocation?.toLowerCase().includes('fort')) {
      setLocationType('fort');
    } else if (
      currentLocation?.toLowerCase().includes('town') || 
      currentLocation?.toLowerCase().includes('valley') ||
      currentLocation?.toLowerCase().includes('independence')
    ) {
      setLocationType('town'); 
    } else if (
      currentLocation?.toLowerCase().includes('rock') ||
      currentLocation?.toLowerCase().includes('pass') ||
      currentLocation?.toLowerCase().includes('mountain') ||
      currentLocation?.toLowerCase().includes('springs')
    ) {
      setLocationType('landmark');
    } else {
      setLocationType('trail');
    }
  }, [currentLocation]);
  
  // Format date for display
  const formatDate = (date: {day: number, month: number, year: number}) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[date.month - 1]} ${date.day}, ${date.year}`;
  };
  
  // Update animation based on isAnimating prop
  useEffect(() => {
    setShowAnimation(isAnimating);
  }, [isAnimating]);
  
  // Handle the animation when showAnimation is true
  useEffect(() => {
    if (!showAnimation) return;
    
    let frame = 0;
    let dayCounter = 1;
    
    const interval = setInterval(() => {
      frame++;
      
      // Move the wagon forward
      setPosition(prev => {
        // If we've reached 100%, reset to start a new day
        if (prev >= 100 && dayCounter < dayCount) {
          dayCounter++;
          setCurrentDay(dayCounter);
          
          // Advance the date by one day
          setDate(prevDate => {
            const newDate = { ...prevDate };
            
            // Advance day
            newDate.day++;
            
            // Handle month transitions
            const daysInMonth = new Date(newDate.year, newDate.month, 0).getDate();
            if (newDate.day > daysInMonth) {
              newDate.day = 1;
              newDate.month++;
              
              // Handle year transitions
              if (newDate.month > 12) {
                newDate.month = 1;
                newDate.year++;
              }
            }
            
            return newDate;
          });
          
          return 0;
        }
        return prev + movePerFrame;
      });
      
      // Complete animation when all days are done
      if (frame >= totalFrames * dayCount) {
        clearInterval(interval);
        setTimeout(() => {
          setShowAnimation(false);
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }, 500); // Short delay before finishing
      }
    }, frameRate);
    
    return () => clearInterval(interval);
  }, [showAnimation, dayCount, movePerFrame, onAnimationComplete]);
  
  // For the static display, we should still show the component even when not animating
  if (!isActive) return null;
  
  // Location-based title and scene variations
  const getLocationBasedTitle = () => {
    if (showAnimation) {
      return "Traveling on the Trail";
    }
    
    switch(locationType) {
      case 'town':
        return "Stopped in Town";
      case 'fort':
        return "At the Fort";
      case 'river':
        return "At the River Crossing";
      case 'landmark':
        return "At the Landmark";
      default:
        return "On the Oregon Trail";
    }
  };
  
  return (
    <div className="w-full">
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-green-500">{getLocationBasedTitle()}</h2>
          <div className="text-sm text-white">{currentLocation}</div>
        </div>
        <div className="flex justify-between items-center mb-2">
          <div className="text-base text-white">Date: {formatDate(date)}</div>
          {showAnimation && <div className="text-base text-white">Day {currentDay} of {dayCount}</div>}
        </div>
        
        {/* Enhanced Landscape */}
        <div className="relative w-full h-80 overflow-hidden rounded-lg mb-4 border-2 border-amber-800 shadow-lg">
          {/* Sky with enhanced gradient and time of day effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600" />
          
          {/* Clouds */}
          <div className="absolute w-24 h-10 bg-white rounded-full opacity-80 blur-sm top-8 left-[15%]" />
          <div className="absolute w-32 h-12 bg-white rounded-full opacity-80 blur-sm top-12 left-[45%]" />
          <div className="absolute w-28 h-10 bg-white rounded-full opacity-80 blur-sm top-6 left-[75%]" />
          
          {/* Sun with glow effect */}
          <div className="absolute w-20 h-20 rounded-full top-10 right-20">
            <div className="absolute inset-0 bg-yellow-300 rounded-full"></div>
            <div className="absolute inset-[-5px] bg-yellow-200 rounded-full opacity-50 animate-pulse"></div>
            <div className="absolute inset-[-10px] bg-yellow-100 rounded-full opacity-30"></div>
          </div>
          
          {/* Distant mountains with more detail and layering */}
          <div className="absolute bottom-[45%] left-0 right-0">
            <svg width="100%" height="120" viewBox="0 0 100 30" preserveAspectRatio="none">
              {/* Farthest mountains */}
              <path 
                d="M0 30 L8 15 L15 22 L25 8 L35 18 L45 5 L55 13 L65 7 L75 16 L85 3 L95 12 L100 9 L100 30 Z" 
                fill="#4B5563"
                opacity="0.7"
              />
              {/* Middle layer mountains */}
              <path 
                d="M0 30 L5 20 L15 25 L20 15 L30 23 L40 12 L50 20 L60 10 L70 18 L80 13 L90 21 L100 15 L100 30 Z" 
                fill="#6B7280"
                opacity="0.85"
              />
              {/* Closest mountain range */}
              <path 
                d="M0 30 L10 22 L20 27 L30 20 L40 26 L50 18 L60 25 L70 22 L80 27 L90 20 L100 23 L100 30 Z" 
                fill="#9CA3AF" 
              />
              {/* Snow caps on peaks */}
              <path 
                d="M44.5 5 L45.5 5 L46 6 L45 6.5 L44 6 Z M84.5 3 L85.5 3 L86 4 L85 4.5 L84 4 Z" 
                fill="white"
                opacity="0.9"
              />
            </svg>
          </div>
          
          {/* Hills in midground */}
          <div className="absolute bottom-[25%] left-0 right-0">
            <svg width="100%" height="60" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path 
                d="M0 20 Q10 10 20 15 T40 10 T60 15 T80 8 T100 12 L100 20 Z" 
                fill="#4F772D"
              />
            </svg>
          </div>
          
          {/* Improved ground with multiple layers */}
          <div className="absolute bottom-0 left-0 right-0 h-[25%] bg-gradient-to-b from-[#606c38] to-[#283618]" />
          
          {/* Enhanced trail with texture */}
          <div className="absolute bottom-[10%] left-0 right-0 h-14 bg-gradient-to-b from-amber-700 to-amber-800 opacity-80">
            {/* Trail texture */}
            <div className="absolute inset-0 opacity-20 bg-repeat" style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20L0 20z' fill='%23000000' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundSize: '8px 8px'
            }}></div>
          </div>
          
          {/* Enhanced Wagon with animations - Traveling west (right to left) */}
          <div 
            className="absolute bottom-[20%]"
            style={{ 
              right: `${position}%`, 
              transform: 'translateX(50%)',
              filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))'
            }}
          >
            <div className="relative">
              {/* Improved wagon with better styling */}
              <div className="h-20 w-32 flex items-end justify-center">
                {/* Enhanced wagon cover with texture */}
                <div className="absolute top-0 h-12 w-20 bg-gray-200 rounded-t-full border border-gray-400 overflow-hidden">
                  {/* Canvas texture */}
                  <div className="absolute inset-0 opacity-20 bg-repeat" style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.2' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 5v1H5z'/%3E%3Cpath d='M6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '3px 3px'
                  }}></div>
                </div>
                
                {/* Improved wagon base */}
                <div className="absolute bottom-5 h-8 w-24 bg-gradient-to-b from-yellow-700 to-yellow-900 border border-yellow-950 rounded"></div>
                
                {/* Enhanced wheels with spokes - counter clockwise for proper rotation */}
                <div className="wheel-left absolute bottom-0 left-3 h-10 w-10 animate-spin-ccw" style={{ animationDuration: '3s' }}>
                  <div className="absolute inset-0 rounded-full border-4 border-yellow-950 bg-yellow-800"></div>
                  <div className="absolute inset-[20%] rounded-full border-2 border-yellow-950"></div>
                  <div className="absolute top-[50%] left-0 right-0 h-1 bg-yellow-950 transform -translate-y-1/2"></div>
                  <div className="absolute left-[50%] top-0 bottom-0 w-1 bg-yellow-950 transform -translate-x-1/2"></div>
                </div>
                <div className="wheel-right absolute bottom-0 right-3 h-10 w-10 animate-spin-ccw" style={{ animationDuration: '3s' }}>
                  <div className="absolute inset-0 rounded-full border-4 border-yellow-950 bg-yellow-800"></div>
                  <div className="absolute inset-[20%] rounded-full border-2 border-yellow-950"></div>
                  <div className="absolute top-[50%] left-0 right-0 h-1 bg-yellow-950 transform -translate-y-1/2"></div>
                  <div className="absolute left-[50%] top-0 bottom-0 w-1 bg-yellow-950 transform -translate-x-1/2"></div>
                </div>
                
                {/* Multiple oxen for a team - now on the right side, facing left */}
                <div className="absolute bottom-3 right-[-70px] flex">
                  <div className="text-3xl">🐂</div>
                  <div className="text-3xl ml-[-12px]">🐂</div>
                </div>
                
                {/* People in the wagon */}
                <div className="absolute top-1 left-[50%] transform -translate-x-1/2 text-sm">👨‍👩‍👧</div>
                
                {/* Enhanced dust cloud animation - now on the right side */}
                <div className="absolute bottom-0 right-[-10px] opacity-70 flex space-x-[-12px]">
                  <span className="inline-block animate-pulse text-sm opacity-40" style={{ animationDuration: '1.0s' }}>💨</span>
                  <span className="inline-block animate-pulse text-lg opacity-60" style={{ animationDuration: '0.8s' }}>💨</span>
                  <span className="inline-block animate-pulse text-xl" style={{ animationDuration: '1.3s' }}>💨</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Improved scenery elements */}
          {/* Mixed vegetation: grass tufts, bushes, and rocks */}
          {[...Array(15)].map((_, i) => {
            const type = Math.random();
            const size = Math.random() * 0.8 + 0.4; // 0.4 to 1.2
            
            if (type < 0.4) {
              // Grass tuft
              return (
                <div 
                  key={`grass-${i}`}
                  className={`absolute bottom-[10%] bg-green-600 rounded-t-md`}
                  style={{ 
                    left: `${Math.random() * 100}%`,
                    height: `${8 * size}px`,
                    width: `${5 * size}px`,
                    transform: `translateX(-50%) rotate(${Math.random() * 10 - 5}deg)`,
                    opacity: 0.8 + Math.random() * 0.2
                  }}
                />
              );
            } else if (type < 0.7) {
              // Small bush
              return (
                <div 
                  key={`bush-${i}`}
                  className="absolute"
                  style={{ 
                    left: `${Math.random() * 100}%`,
                    bottom: `${Math.random() * 5 + 10}%`,
                    fontSize: `${Math.max(14, 20 * size)}px`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  🌿
                </div>
              );
            } else {
              // Rock or small object
              return (
                <div 
                  key={`rock-${i}`}
                  className="absolute"
                  style={{ 
                    left: `${Math.random() * 100}%`,
                    bottom: `${Math.random() * 5 + 10}%`,
                    fontSize: `${Math.max(12, 16 * size)}px`,
                    transform: 'translateX(-50%)',
                    filter: 'grayscale(0.5)'
                  }}
                >
                  {Math.random() > 0.5 ? '🪨' : '🌵'}
                </div>
              );
            }
          })}
          
          {/* Larger landscape features - distant trees, cacti, etc. */}
          {[...Array(5)].map((_, i) => {
            const elementType = Math.random();
            const scale = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
            
            return (
              <div 
                key={`feature-${i}`}
                className="absolute"
                style={{ 
                  left: `${(i * 20) + Math.random() * 10}%`,
                  bottom: `${Math.random() * 5 + 25}%`, // Higher on the screen, behind the trail
                  fontSize: `${Math.max(24, 30 * scale)}px`,
                  transform: 'translateX(-50%)',
                  filter: `brightness(${0.7 + Math.random() * 0.3})`, // Vary brightness for depth
                  opacity: 0.9
                }}
              >
                {elementType < 0.3 ? '🌲' : elementType < 0.6 ? '🌵' : '🌳'}
              </div>
            );
          })}
          
          {/* Time of day indicator with direction of travel */}
          <div className="absolute top-4 left-4 bg-amber-50 bg-opacity-80 p-2 rounded text-xs border border-amber-800">
            <div className="font-bold text-amber-800 mb-1">Time of day: Morning</div>
            <div className="flex items-center justify-center">
              <span className="mr-1 text-amber-700">East</span>
              <div className="w-10 h-4 bg-gradient-to-l from-amber-800 to-transparent relative">
                <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold">←</span>
              </div>
              <span className="ml-1 text-amber-700">West</span>
            </div>
            <div className="text-[8px] text-amber-600 mt-1 text-center">Traveling Westward</div>
          </div>
          
          {/* Weather effects */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Light dust particles */}
            {[...Array(20)].map((_, i) => (
              <div 
                key={`dust-${i}`}
                className="absolute bg-amber-200 rounded-full opacity-30 animate-float"
                style={{
                  width: `${Math.random() * 3 + 1}px`,
                  height: `${Math.random() * 3 + 1}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 60}%`,
                  animationDuration: `${Math.random() * 10 + 10}s`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Add custom animations */}
        <style jsx>{`
          @keyframes float {
            0% { transform: translate(0, 0); }
            50% { transform: translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px); }
            100% { transform: translate(0, 0); }
          }
          .animate-float {
            animation: float infinite ease-in-out;
          }
          
          @keyframes spin-ccw {
            from { transform: rotate(0deg); }
            to { transform: rotate(-360deg); }
          }
          .animate-spin-ccw {
            animation: spin-ccw linear infinite;
          }
        `}</style>
        
        <div className="bg-gray-700 p-3 rounded-md border border-gray-600 shadow-inner">
          <div className="text-center text-sm text-green-400 font-medium mb-1">
            {`The wagon party travels ${dayCount > 1 ? 'for several days' : 'onward'} through ${
              date.month < 5 ? 'the spring plains' : 
              date.month < 8 ? 'the summer heat' : 
              date.month < 11 ? 'the autumn landscape' : 
              'the winter cold'
            }...`}
          </div>
          <div className="text-xs text-gray-300 italic flex justify-between">
            <span>Next stop: {gameState?.nextMilestone.name || 'Unknown'}</span>
            <span>Miles to go: {gameState?.nextMilestone.distance - gameState?.milesTraveled || 'Unknown'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WagonAnimation;