import React, { useState, useEffect, useRef } from 'react';

interface HuntingGameProps {
  onSuccess: (foodGained: number, bulletsUsed: number) => void;
  onFailure: (bulletsUsed: number) => void;
  onExit: () => void;
  availableBullets: number;
}

interface Target {
  id: number;
  type: 'rabbit' | 'deer' | 'buffalo' | 'bear';
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: number;
  foodValue: number;
  hit: boolean;
  active: boolean;
}

const HuntingGame: React.FC<HuntingGameProps> = ({ 
  onSuccess, 
  onFailure, 
  onExit,
  availableBullets 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds to hunt
  const [bullets, setBullets] = useState(availableBullets);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [bulletsUsed, setBulletsUsed] = useState(0);
  
  // Initialize game
  useEffect(() => {
    // Create initial targets
    const initialTargets: Target[] = [];
    
    // Add random targets
    for (let i = 0; i < 5; i++) {
      addRandomTarget(initialTargets, i);
    }
    
    setTargets(initialTargets);
    
    // Start game timer
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          endHunt();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    // Clean up
    return () => clearInterval(timer);
  }, []);
  
  // Add a random target to the array
  const addRandomTarget = (targetArray: Target[], id: number) => {
    const types = ['rabbit', 'deer', 'buffalo', 'bear'];
    const typeWeights = [0.4, 0.3, 0.2, 0.1]; // Probability weights
    
    // Select random type based on weights
    const rand = Math.random();
    let cumulativeProb = 0;
    let selectedType = types[0];
    
    for (let i = 0; i < types.length; i++) {
      cumulativeProb += typeWeights[i];
      if (rand <= cumulativeProb) {
        selectedType = types[i];
        break;
      }
    }
    
    // Set properties based on type
    let width, height, speed, foodValue;
    switch (selectedType) {
      case 'rabbit':
        width = 30;
        height = 20;
        speed = 5;
        foodValue = 5;
        break;
      case 'deer':
        width = 60;
        height = 50;
        speed = 3;
        foodValue = 15;
        break;
      case 'buffalo':
        width = 80;
        height = 60;
        speed = 2;
        foodValue = 40;
        break;
      case 'bear':
        width = 70;
        height = 65;
        speed = 1.5;
        foodValue = 30;
        break;
      default:
        width = 30;
        height = 20;
        speed = 3;
        foodValue = 5;
    }
    
    // Add to array
    targetArray.push({
      id,
      type: selectedType as any,
      // Start from sides
      x: Math.random() < 0.5 ? -width : 800 + width,
      y: 100 + Math.random() * 300, // Random y position
      width,
      height,
      speed,
      direction: Math.random() < 0.5 ? -1 : 1, // Left or right
      foodValue,
      hit: false,
      active: true
    });
  };
  
  // Game loop for animation
  useEffect(() => {
    if (gameOver) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Animation frame
    const animationId = requestAnimationFrame(() => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      ctx.fillStyle = '#2d3748'; // dark background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grass
      ctx.fillStyle = '#276749'; // dark green
      ctx.fillRect(0, 400, canvas.width, 100);
      
      // Draw trees
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = '#4a5568'; // trunk
        ctx.fillRect(100 + i * 160, 320, 20, 80);
        
        ctx.fillStyle = '#2f855a'; // leaves
        ctx.beginPath();
        ctx.moveTo(110 + i * 160, 250);
        ctx.lineTo(70 + i * 160, 330);
        ctx.lineTo(150 + i * 160, 330);
        ctx.fill();
      }
      
      // Update and draw targets
      const updatedTargets = [...targets];
      
      updatedTargets.forEach(target => {
        if (!target.active) return;
        
        // Move target
        target.x += target.speed * target.direction;
        
        // Check if target is off screen
        if ((target.direction < 0 && target.x < -target.width) || 
            (target.direction > 0 && target.x > canvas.width + target.width)) {
          // Reset target
          target.active = false;
          
          // 30% chance to add a new target
          if (Math.random() < 0.3) {
            addRandomTarget(updatedTargets, Date.now() + Math.random());
          }
        }
        
        // Draw target
        if (!target.hit) {
          switch (target.type) {
            case 'rabbit':
              ctx.fillStyle = '#d69e2e'; // yellowish
              break;
            case 'deer':
              ctx.fillStyle = '#b7791f'; // brownish
              break;
            case 'buffalo':
              ctx.fillStyle = '#744210'; // dark brown
              break;
            case 'bear':
              ctx.fillStyle = '#2d3748'; // dark gray
              break;
          }
          
          ctx.fillRect(target.x, target.y, target.width, target.height);
        }
      });
      
      // Draw crosshair
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      
      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(mousePos.x - 15, mousePos.y);
      ctx.lineTo(mousePos.x + 15, mousePos.y);
      ctx.stroke();
      
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mousePos.x, mousePos.y - 15);
      ctx.lineTo(mousePos.x, mousePos.y + 15);
      ctx.stroke();
      
      // Draw UI elements
      ctx.fillStyle = 'white';
      ctx.font = '20px Courier';
      ctx.fillText(`Time: ${timeLeft}s`, 20, 30);
      ctx.fillText(`Food: ${score} lbs`, 20, 60);
      ctx.fillText(`Bullets: ${bullets}`, 20, 90);
      
      setTargets(updatedTargets.filter(t => t.active));
    });
    
    return () => cancelAnimationFrame(animationId);
  }, [targets, gameOver, mousePos, timeLeft, bullets, score]);
  
  // Track mouse position
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  // Handle shooting
  const handleClick = () => {
    if (gameOver || bullets <= 0) return;
    
    setBullets(prev => prev - 1);
    setBulletsUsed(prev => prev + 1);
    
    // Check for hits
    const updatedTargets = [...targets];
    let hit = false;
    
    for (const target of updatedTargets) {
      if (target.hit) continue;
      
      // Check if target was hit
      if (
        mousePos.x >= target.x && 
        mousePos.x <= target.x + target.width &&
        mousePos.y >= target.y && 
        mousePos.y <= target.y + target.height
      ) {
        target.hit = true;
        hit = true;
        
        // Add food based on animal type
        setScore(prev => prev + target.foodValue);
        
        // Set target to be removed in next frame
        setTimeout(() => {
          target.active = false;
          
          // Maybe add a new target to replace it
          if (Math.random() < 0.5 && !gameOver) {
            addRandomTarget(updatedTargets, Date.now() + Math.random());
          }
        }, 500);
        
        break; // Only hit one target per shot
      }
    }
    
    // If out of bullets, end the hunt
    if (bullets - 1 <= 0) {
      setTimeout(endHunt, 1000);
    }
  };
  
  // End the hunt
  const endHunt = () => {
    setGameOver(true);
    
    // Determine success/failure
    if (score > 0) {
      onSuccess(score, bulletsUsed);
    } else {
      onFailure(bulletsUsed);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50">
      <div className="max-w-4xl w-full">
        <h2 className="text-3xl font-bold mb-4 text-center text-green-500">Hunting</h2>
        
        <div className="mb-4 bg-gray-800 p-4 rounded-lg">
          <p className="text-center">
            Click to shoot! Aim carefully - you have {bullets} bullets.
          </p>
        </div>
        
        <div className="relative mb-4">
          <canvas 
            ref={canvasRef}
            width={800}
            height={500}
            className="border-2 border-gray-700 rounded-lg cursor-none mx-auto"
            onMouseMove={handleMouseMove}
            onClick={handleClick}
          />
          
          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <h3 className="text-2xl font-bold mb-2">Hunting Complete!</h3>
                <p className="mb-4">
                  You got {score} pounds of food using {bulletsUsed} bullets.
                </p>
                <button
                  onClick={onExit}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Return to Trail
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <button
            onClick={onExit}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Quit Hunting
          </button>
        </div>
      </div>
    </div>
  );
};

export default HuntingGame;