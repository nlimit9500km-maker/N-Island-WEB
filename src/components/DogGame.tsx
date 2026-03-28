import React, { useState, useEffect, useRef, useCallback } from 'react';

export const DogGame = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [dogY, setDogY] = useState(0);
  const [obstacleX, setObstacleX] = useState(1000);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const velocityRef = useRef(0);
  const dogYRef = useRef(0);
  const obstacleXRef = useRef(1000);
  const scoreRef = useRef(0);

  const GRAVITY = 0.6;
  const JUMP_STRENGTH = 9;
  const OBSTACLE_SPEED = 4.5;

  const jump = useCallback(() => {
    if (!isPlaying && !isGameOver) {
      setIsPlaying(true);
      obstacleXRef.current = containerRef.current?.clientWidth || 300;
    }
    if (isGameOver) {
      setIsPlaying(true);
      setIsGameOver(false);
      setScore(0);
      scoreRef.current = 0;
      obstacleXRef.current = containerRef.current?.clientWidth || 300;
      dogYRef.current = 0;
      velocityRef.current = 0;
    }
    if (dogYRef.current === 0) {
      velocityRef.current = JUMP_STRENGTH;
    }
  }, [isPlaying, isGameOver]);

  const updateGame = useCallback(() => {
    if (!isPlaying || isGameOver) return;

    velocityRef.current -= GRAVITY;
    dogYRef.current += velocityRef.current;

    if (dogYRef.current <= 0) {
      dogYRef.current = 0;
      velocityRef.current = 0;
    }

    obstacleXRef.current -= OBSTACLE_SPEED;
    if (obstacleXRef.current < -30) {
      obstacleXRef.current = containerRef.current?.clientWidth || 300;
      scoreRef.current += 10;
    }

    // Collision detection
    const dogRight = 30 + 20;
    const dogLeft = 30 + 4;
    const dogBottom = dogYRef.current;
    const dogTop = dogYRef.current + 20;

    const obsLeft = obstacleXRef.current + 4;
    const obsRight = obstacleXRef.current + 16;
    const obsBottom = 0;
    const obsTop = 20;

    if (
      dogRight > obsLeft &&
      dogLeft < obsRight &&
      dogBottom < obsTop
    ) {
      setIsGameOver(true);
      setIsPlaying(false);
    }

    setDogY(dogYRef.current);
    setObstacleX(obstacleXRef.current);
    setScore(scoreRef.current);

    requestRef.current = requestAnimationFrame(updateGame);
  }, [isPlaying, isGameOver]);

  useEffect(() => {
    if (isPlaying && !isGameOver) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isGameOver, updateGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-24 bg-[#f7f7f7] border border-gray-200 rounded-lg relative overflow-hidden mb-4 cursor-pointer select-none group"
      onClick={jump}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dino-cloud {
          0% { transform: translateX(50px); }
          100% { transform: translateX(-300px); }
        }
      `}} />
      
      {/* Ground */}
      <div className="absolute bottom-4 left-0 w-full h-px bg-gray-300"></div>
      
      {/* Clouds */}
      <div className="absolute top-3 right-10 w-8 h-2 bg-gray-200 rounded-full" style={{ animation: 'dino-cloud 15s linear infinite' }}></div>
      <div className="absolute top-6 left-20 w-6 h-1.5 bg-gray-200 rounded-full" style={{ animation: 'dino-cloud 25s linear infinite' }}></div>

      {/* Score */}
      <div className="absolute top-2 right-4 text-[10px] font-mono text-gray-400 font-bold tracking-widest">
        {score.toString().padStart(5, '0')}
      </div>

      {/* Dog */}
      <div 
        className="absolute left-[30px] text-xl transition-transform"
        style={{ 
          bottom: `${16 + dogY}px`, 
          width: '24px', 
          height: '24px', 
          lineHeight: '24px',
          transform: dogY > 0 ? 'rotate(-10deg)' : 'none'
        }}
      >
        <span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>🐕</span>
      </div>

      {/* Obstacle */}
      <div 
        className="absolute bottom-4 text-lg"
        style={{ left: `${obstacleX}px`, width: '20px', height: '24px', lineHeight: '24px' }}
      >
        🌵
      </div>

      {/* Overlays */}
      {!isPlaying && !isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-mono font-bold text-[#535353] tracking-tighter uppercase">Connection Lost</span>
          <span className="text-[8px] font-mono text-[#535353]/60 mt-1">Click or Space to jump</span>
        </div>
      )}
      
      {isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px]">
          <span className="text-xs font-mono font-bold text-red-800 tracking-tighter uppercase mb-1">Game Over</span>
          <span className="text-[9px] font-mono text-[#535353] bg-white px-2 py-1 rounded shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">Click to restart</span>
        </div>
      )}
    </div>
  );
};
