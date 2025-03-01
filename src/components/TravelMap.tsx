import React from 'react';
import { Milestone, GameState } from '../game/gameState';
import Image from 'next/image';

interface TravelMapProps {
  gameState: GameState;
  onClose: () => void;
}

// Define milestone coordinates for visual placement on the map
// Coordinates are percentage values (0-100) representing position on the map image
interface MilestonePosition {
  name: string;
  x: number; // percentage from left
  y: number; // percentage from top
}

const milestonePositions: MilestonePosition[] = [
  { name: 'Independence, Missouri', x: 9, y: 38 },
  { name: 'Kansas River Crossing', x: 13, y: 35 },
  { name: 'Big Blue River Crossing', x: 18, y: 32 },
  { name: 'Fort Kearney', x: 22, y: 30 },
  { name: 'Chimney Rock', x: 31, y: 27 },
  { name: 'Fort Laramie', x: 35, y: 25 },
  { name: 'Independence Rock', x: 42, y: 22 },
  { name: 'South Pass', x: 46, y: 20 },
  { name: 'Fort Bridger', x: 51, y: 23 },
  { name: 'Green River Crossing', x: 54, y: 26 },
  { name: 'Soda Springs', x: 62, y: 20 },
  { name: 'Fort Hall', x: 65, y: 17 },
  { name: 'Snake River Crossing', x: 73, y: 16 },
  { name: 'Fort Boise', x: 75, y: 14 },
  { name: 'Blue Mountains', x: 82, y: 12 },
  { name: 'Fort Walla Walla', x: 85, y: 10 },
  { name: 'The Dalles', x: 90, y: 8 },
  { name: 'Willamette Valley', x: 94, y: 6 },
];

// Define trail segments to draw the route
interface TrailSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Create trail segments connecting each milestone
const createTrailSegments = (): TrailSegment[] => {
  const segments: TrailSegment[] = [];
  for (let i = 0; i < milestonePositions.length - 1; i++) {
    segments.push({
      x1: milestonePositions[i].x,
      y1: milestonePositions[i].y,
      x2: milestonePositions[i + 1].x,
      y2: milestonePositions[i + 1].y,
    });
  }
  return segments;
};

const trailSegments = createTrailSegments();

const TravelMap: React.FC<TravelMapProps> = ({ gameState, onClose }) => {
  // Calculate total trail length
  const totalTrailLength = 2040; // miles
  
  // Calculate progress percentage
  const progressPercentage = (gameState.milesTraveled / totalTrailLength) * 100;
  
  // Find the last passed milestone without duplication
  const getLastPassedMilestoneIndex = () => {
    // Create displayMilestones array properly
    const displayMilestones = [...gameState.milestones];
    const hasIndependence = displayMilestones.some(m => m.name === 'Independence, Missouri');
    if (!hasIndependence) {
      displayMilestones.unshift({ name: 'Independence, Missouri', distance: 0, type: 'town' });
    }
    
    // Find the last milestone that was passed
    let lastPassed = -1;
    for (let i = 0; i < milestonePositions.length; i++) {
      const milestone = displayMilestones.find(m => m.name === milestonePositions[i].name);
      if (milestone && gameState.milesTraveled >= milestone.distance) {
        lastPassed = i;
      } else {
        break;
      }
    }
    return lastPassed;
  };
  
  const lastPassedMilestoneIndex = getLastPassedMilestoneIndex();
  
  // Get the position for the wagon icon (current position)
  const getCurrentPosition = () => {
    // If at the start or haven't moved yet
    if (gameState.milesTraveled === 0 || lastPassedMilestoneIndex === -1) {
      return { x: milestonePositions[0].x, y: milestonePositions[0].y };
    }
    
    // If at or past the final milestone
    if (lastPassedMilestoneIndex >= milestonePositions.length - 1) {
      return { 
        x: milestonePositions[milestonePositions.length - 1].x, 
        y: milestonePositions[milestonePositions.length - 1].y 
      };
    }
    
    // Find the distance between the last passed milestone and the next milestone
    const lastMilestoneName = milestonePositions[lastPassedMilestoneIndex].name;
    const nextMilestoneName = milestonePositions[lastPassedMilestoneIndex + 1].name;
    
    const lastMilestone = gameState.milestones.find(m => m.name === lastMilestoneName);
    const nextMilestone = gameState.milestones.find(m => m.name === nextMilestoneName);
    
    if (!lastMilestone || !nextMilestone) {
      return { x: milestonePositions[0].x, y: milestonePositions[0].y };
    }
    
    const totalSegmentDistance = nextMilestone.distance - lastMilestone.distance;
    const distanceTraveled = gameState.milesTraveled - lastMilestone.distance;
    const segmentPercentage = totalSegmentDistance > 0 ? distanceTraveled / totalSegmentDistance : 0;
    
    // Interpolate position between the two milestones
    const lastPos = milestonePositions[lastPassedMilestoneIndex];
    const nextPos = milestonePositions[lastPassedMilestoneIndex + 1];
    
    return {
      x: lastPos.x + (nextPos.x - lastPos.x) * segmentPercentage,
      y: lastPos.y + (nextPos.y - lastPos.y) * segmentPercentage
    };
  };
  
  const wagonPosition = getCurrentPosition();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl w-full">
        <h2 className="text-2xl font-bold mb-4 text-green-500">Oregon Trail Map</h2>
        
        {/* Map Display */}
        <div className="mb-6 relative">
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
            {/* Map Background with gradient to mimic parchment */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-700 shadow-inner">
              {/* Background texture overlay */}
              <div className="absolute inset-0 opacity-10 bg-repeat" style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23594e36' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              }}></div>
              
              {/* Map title - moved further up to avoid overlap */}
              <div className="absolute top-1 left-[50%] transform -translate-x-1/2 text-amber-800 font-bold text-lg italic border-b border-amber-800 pb-1 bg-amber-50 bg-opacity-80 px-4 rounded-t-md">
                Oregon Trail - 1848
              </div>
              
              {/* Water features with improved styling */}
              <div className="absolute left-[8%] top-[36%] w-[2%] h-[8%] bg-blue-500 opacity-70 rounded-md"></div> {/* Kansas River */}
              <div className="absolute left-[17%] top-[32%] w-[2%] h-[5%] bg-blue-500 opacity-70 rounded-md"></div> {/* Big Blue River */}
              <div className="absolute left-[54%] top-[25%] w-[3%] h-[5%] bg-blue-500 opacity-70 rounded-md"></div> {/* Green River */}
              <div className="absolute left-[72%] top-[15%] w-[5%] h-[6%] bg-blue-500 opacity-70 rounded-md"></div> {/* Snake River */}
              <div className="absolute left-[88%] top-[8%] w-[8%] h-[3%] bg-blue-500 opacity-70 rounded-md"></div> {/* Columbia River */}
              
              {/* River labels with improved visibility */}
              <div className="absolute left-[8%] top-[44%] text-[8px] text-blue-800 font-semibold bg-amber-50 bg-opacity-60 px-1 rounded">Kansas River</div>
              <div className="absolute left-[16%] top-[38%] text-[8px] text-blue-800 font-semibold bg-amber-50 bg-opacity-60 px-1 rounded">Big Blue River</div>
              <div className="absolute left-[54%] top-[31%] text-[8px] text-blue-800 font-semibold bg-amber-50 bg-opacity-60 px-1 rounded">Green River</div>
              <div className="absolute left-[72%] top-[22%] text-[8px] text-blue-800 font-semibold bg-amber-50 bg-opacity-60 px-1 rounded">Snake River</div>
              <div className="absolute left-[88%] top-[12%] text-[8px] text-blue-800 font-semibold bg-amber-50 bg-opacity-60 px-1 rounded">Columbia River</div>

              {/* Mountain ranges with improved styling */}
              <div className="absolute left-[45%] top-[18%] w-[10%] h-[14%] bg-gradient-to-t from-gray-700 to-gray-400 opacity-60 rounded-lg shadow-md"></div> {/* Rocky Mountains */}
              <div className="absolute left-[80%] top-[8%] w-[8%] h-[10%] bg-gradient-to-t from-gray-700 to-gray-400 opacity-60 rounded-lg shadow-md"></div> {/* Blue Mountains */}
              
              {/* Mountain labels with improved visibility */}
              <div className="absolute left-[46%] top-[33%] text-[8px] text-gray-800 font-semibold bg-amber-50 bg-opacity-60 px-1 rounded">Rocky Mountains</div>
              <div className="absolute left-[80%] top-[19%] text-[8px] text-gray-800 font-semibold bg-amber-50 bg-opacity-60 px-1 rounded">Blue Mountains</div>
              
              {/* State/territory boundaries - subtle dotted lines */}
              <div className="absolute left-[20%] top-[10%] w-[1px] h-[70%] border-l border-dashed border-amber-800 opacity-30"></div>
              <div className="absolute left-[40%] top-[10%] w-[1px] h-[70%] border-l border-dashed border-amber-800 opacity-30"></div>
              <div className="absolute left-[60%] top-[10%] w-[1px] h-[70%] border-l border-dashed border-amber-800 opacity-30"></div>
              <div className="absolute left-[80%] top-[10%] w-[1px] h-[70%] border-l border-dashed border-amber-800 opacity-30"></div>
              
              {/* Territory labels with improved styling */}
              <div className="absolute left-[10%] top-[80%] text-[9px] text-amber-800 font-semibold italic bg-amber-50 bg-opacity-60 px-1 rounded">MISSOURI</div>
              <div className="absolute left-[30%] top-[80%] text-[9px] text-amber-800 font-semibold italic bg-amber-50 bg-opacity-60 px-1 rounded">NEBRASKA TERRITORY</div>
              <div className="absolute left-[50%] top-[80%] text-[9px] text-amber-800 font-semibold italic bg-amber-50 bg-opacity-60 px-1 rounded">WYOMING TERRITORY</div>
              <div className="absolute left-[70%] top-[80%] text-[9px] text-amber-800 font-semibold italic bg-amber-50 bg-opacity-60 px-1 rounded">IDAHO TERRITORY</div>
              <div className="absolute left-[90%] top-[80%] text-[9px] text-amber-800 font-semibold italic bg-amber-50 bg-opacity-60 px-1 rounded">OREGON</div>
              
              {/* Draw the trail segments with improved styling */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Drop shadow filter for the trail */}
                <defs>
                  <filter id="trailShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.3" />
                  </filter>
                </defs>
                
                {/* Render trail - wider background for effect */}
                {trailSegments.map((segment, index) => (
                  <line 
                    key={`bg-${index}`}
                    x1={`${segment.x1}%`} 
                    y1={`${segment.y1}%`} 
                    x2={`${segment.x2}%`} 
                    y2={`${segment.y2}%`}
                    stroke="#A0522D"
                    strokeWidth="4"
                    strokeOpacity="0.3"
                    filter="url(#trailShadow)"
                  />
                ))}
                
                {/* Actual trail path with different styling based on progress */}
                {trailSegments.map((segment, index) => (
                  <line 
                    key={`trail-${index}`}
                    x1={`${segment.x1}%`} 
                    y1={`${segment.y1}%`} 
                    x2={`${segment.x2}%`} 
                    y2={`${segment.y2}%`}
                    stroke={index <= lastPassedMilestoneIndex ? "#8B4513" : "#B8860B"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={index <= lastPassedMilestoneIndex ? "none" : "3,2"}
                    strokeOpacity={index <= lastPassedMilestoneIndex ? "1" : "0.7"}
                  />
                ))}
                
                {/* Mile markers/stops along the trail */}
                {trailSegments.map((segment, index) => {
                  // Add small dots along the trail segment
                  const dots = [];
                  if (index % 2 === 0) { // Add stops to every other segment to avoid overcrowding
                    // Calculate mid-point of segment for a stop
                    const midX = (segment.x1 + segment.x2) / 2;
                    const midY = (segment.y1 + segment.y2) / 2;
                    
                    dots.push(
                      <circle
                        key={`stop-${index}`}
                        cx={`${midX}%`}
                        cy={`${midY}%`}
                        r="0.5"
                        fill={index <= lastPassedMilestoneIndex ? "#8B4513" : "#B8860B"}
                        strokeWidth="0.5"
                        stroke="#FFFFFF"
                        opacity={index <= lastPassedMilestoneIndex ? "1" : "0.7"}
                      />
                    );
                  }
                  return dots;
                })}
              </svg>
              
              {/* Place milestone markers with improved styling */}
              {milestonePositions.map((pos, index) => {
                // Use the milestone from gameState to avoid duplication
                const milestone = gameState.milestones.find(m => m.name === pos.name) || 
                                  (pos.name === 'Independence, Missouri' ? { name: 'Independence, Missouri', distance: 0, type: 'town' } : null);
                
                if (!milestone) return null; // Skip if milestone not found
                
                const isPassed = gameState.milesTraveled >= milestone.distance;
                const isNext = milestone.name === gameState.nextMilestone.name;
                const milestoneType = milestone.type || 'landmark';
                
                // Choose icon based on milestone type
                let icon = '🏠'; // default for towns
                if (milestoneType === 'fort') icon = '🏰';
                if (milestoneType === 'river') icon = '🌊';
                if (milestoneType === 'landmark') icon = '🏞️';
                
                // Calculate positions with slight offsets to prevent overlaps
                // Adjust position for certain milestones if they're too close to others
                let adjustedX = pos.x;
                let adjustedY = pos.y;
                let labelPosition = 'bottom'; // default label position
                
                // Apply position adjustments based on index to prevent overlaps
                if (index > 0) {
                  const prevPos = milestonePositions[index - 1];
                  const nextPos = index < milestonePositions.length - 1 ? milestonePositions[index + 1] : null;
                  
                  // Check if too close to previous milestone
                  const closeToNext = nextPos && Math.abs(pos.x - nextPos.x) < 7 && Math.abs(pos.y - nextPos.y) < 7;
                  const closeToPrev = Math.abs(pos.x - prevPos.x) < 7 && Math.abs(pos.y - prevPos.y) < 7;
                  
                  // Adjust label positioning based on proximity
                  if (closeToPrev) {
                    labelPosition = 'right';
                    adjustedY -= 2; // Slight vertical offset
                  } else if (closeToNext) {
                    labelPosition = 'left';
                    adjustedY += 2; // Slight vertical offset
                  }
                  
                  // Special handling for specific milestone indices that overlap
                  if (index === 3) { // Fort Kearney
                    labelPosition = 'right';
                  } else if (index === 15) { // Fort Walla Walla
                    labelPosition = 'left';
                    adjustedY -= 3; 
                  }
                }
                
                return (
                  <div key={index} className="absolute" style={{ left: `${adjustedX}%`, top: `${adjustedY}%` }}>
                    {/* Outer ring for visibility */}
                    <div 
                      className={`absolute w-5 h-5 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                        isPassed ? 'bg-green-500' : isNext ? 'bg-yellow-500' : 'bg-gray-400'
                      } opacity-30`}
                      style={{ left: '0', top: '0' }}
                    />
                    
                    {/* Inner dot */}
                    <div 
                      className={`absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                        isPassed ? 'bg-green-600 ring-2 ring-green-300' : 
                        isNext ? 'bg-yellow-600 ring-2 ring-yellow-300 animate-pulse' : 
                        'bg-gray-600 ring-1 ring-gray-300'
                      } shadow-md`}
                      style={{ left: '0', top: '0' }}
                    />
                    
                    {/* Milestone name label with adjusted positioning */}
                    {(isPassed || isNext || index === 0 || index === milestonePositions.length - 1) && (
                      <div 
                        className={`absolute whitespace-nowrap text-[8px] font-semibold ${
                          isPassed ? 'text-green-700' : isNext ? 'text-yellow-700' : 'text-amber-800'
                        }`}
                        style={{ 
                          ...(labelPosition === 'bottom' ? {
                            top: '10px', 
                            left: '0',
                            transform: 'translateX(-50%)'
                          } : labelPosition === 'right' ? {
                            top: '0px', 
                            left: '8px',
                            transform: 'translateY(-50%)'
                          } : {
                            top: '0px', 
                            right: '8px',
                            transform: 'translateY(-50%)'
                          }),
                          textShadow: '0px 0px 2px rgba(255,255,255,0.8)',
                          maxWidth: '100px'
                        }}
                      >
                        {pos.name}
                      </div>
                    )}
                    
                    {/* Small icon for milestone type */}
                    <div 
                      className="absolute text-xs transform -translate-x-1/2 -translate-y-[80%]"
                      style={{ left: '0', top: '-4px' }}
                    >
                      {isNext && <span className="inline-block animate-bounce">{icon}</span>}
                    </div>
                  </div>
                );
              })}
              
              {/* Current position wagon icon with enhancement - facing west */}
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: `${wagonPosition.x}%`, 
                  top: `${wagonPosition.y}%`,
                  filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))'
                }}
              >
                {/* Glow effect behind the wagon */}
                <div className="absolute w-8 h-8 bg-yellow-400 rounded-full opacity-30 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                
                {/* Covered wagon icon facing West (left on map) */}
                <div className="relative text-xl z-10 transform -scale-x-100">🛷</div>
                
                {/* "You are here" indicator */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-green-700 text-white text-[8px] px-1 rounded whitespace-nowrap font-bold">
                  You are here
                </div>
                
                {/* Direction indicator */}
                <div className="absolute -left-4 top-0 text-[10px] text-amber-800 font-bold">←</div>
              </div>
              
              {/* Improved legend */}
              <div className="absolute bottom-2 right-2 bg-amber-50 bg-opacity-90 p-2 rounded-md text-xs border border-amber-700">
                <div className="text-amber-800 font-bold mb-1 text-center border-b border-amber-300 pb-1">Map Legend</div>
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 rounded-full bg-green-600 ring-1 ring-green-300 mr-2"></div>
                  <span className="text-green-800">Visited Location</span>
                </div>
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-600 ring-1 ring-yellow-300 mr-2 animate-pulse"></div>
                  <span className="text-yellow-800">Next Destination</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-600 ring-1 ring-gray-300 mr-2"></div>
                  <span className="text-gray-800">Future Stop</span>
                </div>
              </div>
              
              {/* Compass rose repositioned to avoid overlap */}
              <div className="absolute bottom-6 right-4 w-14 h-14 bg-amber-50 bg-opacity-80 rounded-full p-1">
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 border-2 border-amber-700 rounded-full opacity-60"></div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-800 font-bold text-[10px]">N</div>
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 text-amber-800 font-bold text-[10px]">E</div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-amber-800 font-bold text-[10px]">S</div>
                  <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-800 font-bold text-[10px]">W</div>
                  <div className="absolute inset-[25%] border-2 border-amber-700 rounded-full opacity-60"></div>
                  <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-amber-800 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                  
                  {/* Direction arrow */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="text-amber-800 font-bold text-lg">⟵</span>
                  </div>
                </div>
              </div>
              
              {/* Journey direction label added to title area */}
              <div className="absolute top-5 left-[50%] transform -translate-x-1/2 text-amber-800 text-[10px] font-bold bg-amber-50 bg-opacity-80 px-2 rounded">
                Traveling East to West ⟵
              </div>
              
              {/* Distance scale */}
              <div className="absolute bottom-2 left-2 bg-amber-50 bg-opacity-90 p-1 rounded text-[8px] border border-amber-700">
                <div className="flex items-center">
                  <div className="w-12 h-0.5 bg-amber-800 mr-1"></div>
                  <span className="text-amber-800">~500 miles</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-6 bg-gray-700 mt-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-600 relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {Math.round(progressPercentage)}% - {gameState.milesTraveled} miles
              </span>
            </div>
          </div>
          
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>← EAST (Independence)</span>
            <span>(Willamette Valley) WEST →</span>
          </div>
        </div>
        
        {/* Milestone Table */}
        <div className="overflow-y-auto max-h-48">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2">Location</th>
                <th className="text-left py-2">Distance</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Make sure Independence only appears once by checking if it's already in gameState.milestones */}
              {(() => {
                // Start with all milestones from gameState
                const displayMilestones = [...gameState.milestones];
                
                // Check if Independence is already included
                const hasIndependence = displayMilestones.some(m => m.name === 'Independence, Missouri');
                
                // If not, add it to the beginning
                if (!hasIndependence) {
                  displayMilestones.unshift({ name: 'Independence, Missouri', distance: 0, type: 'town' });
                }
                
                // Sort by distance to ensure proper order
                displayMilestones.sort((a, b) => a.distance - b.distance);
                
                return displayMilestones.map((milestone: Milestone, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-2">{milestone.name}</td>
                    <td className="py-2">{milestone.distance} miles</td>
                    <td className="py-2 capitalize">{milestone.type}</td>
                    <td className="py-2">
                      {gameState.milesTraveled >= milestone.distance ? (
                        <span className="text-green-500">Passed</span>
                      ) : milestone.distance === gameState.nextMilestone.distance ? (
                        <span className="text-yellow-500">Next stop</span>
                      ) : (
                        <span className="text-gray-500">Ahead</span>
                      )}
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelMap;