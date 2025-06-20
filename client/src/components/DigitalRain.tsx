import { useEffect, useState, useRef } from 'react';

interface Transaction {
  id: string;
  wallet: string;
  amount: string;
  type: 'raffle' | 'donation';
  timestamp: number;
}

interface RainDrop {
  id: string;
  x: number;
  y: number;
  speed: number;
  text: string;
  opacity: number;
  color: string;
}

export function DigitalRain() {
  const [drops, setDrops] = useState<RainDrop[]>([]);
  const [transactions] = useState<Transaction[]>([
    { id: '1', wallet: '0x742d35Cc6609C1fCD37Bb6Ac2D5eF19B', amount: '125.50', type: 'raffle', timestamp: Date.now() },
    { id: '2', wallet: '0x8ba1f109551bD432803012645Hac18fcf', amount: '89.25', type: 'donation', timestamp: Date.now() },
    { id: '3', wallet: '0x1a2b3c4d5e6f7890abcdef1234567890', amount: '200.00', type: 'raffle', timestamp: Date.now() },
    { id: '4', wallet: '0x9876543210fedcba0987654321fedcba', amount: '45.75', type: 'donation', timestamp: Date.now() },
    { id: '5', wallet: '0xabcdef1234567890abcdef1234567890', amount: '350.00', type: 'raffle', timestamp: Date.now() },
    { id: '6', wallet: '0x5555666677778888999900001111aaaa', amount: '67.30', type: 'donation', timestamp: Date.now() },
    { id: '7', wallet: '0x123abc456def789012345678901234567', amount: '75.80', type: 'raffle', timestamp: Date.now() },
    { id: '8', wallet: '0xfedcba0987654321fedcba0987654321', amount: '310.25', type: 'donation', timestamp: Date.now() },
    { id: '9', wallet: '0x1111222233334444555566667777888', amount: '95.00', type: 'raffle', timestamp: Date.now() },
    { id: '10', wallet: '0xaaabbbcccdddeeefffaaabbbcccdddee', amount: '180.40', type: 'donation', timestamp: Date.now() },
  ]);
  const animationRef = useRef<number>();

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const createNewDrop = (): RainDrop => {
    const transaction = transactions[Math.floor(Math.random() * transactions.length)];
    const displayTexts = [
      `${formatWallet(transaction.wallet)} → $${transaction.amount}`,
      `$${transaction.amount} USDT`,
      `${formatWallet(transaction.wallet)}`,
      `+$${transaction.amount}`,
    ];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * window.innerWidth,
      y: -20,
      speed: Math.random() * 2 + 1,
      text: displayTexts[Math.floor(Math.random() * displayTexts.length)],
      opacity: Math.random() * 0.4 + 0.2,
      color: transaction.type === 'raffle' ? '#10b981' : '#f59e0b',
    };
  };

  useEffect(() => {
    const animate = () => {
      setDrops(prevDrops => {
        let newDrops = [...prevDrops];
        
        // Add new drops occasionally
        if (Math.random() < 0.015) {
          newDrops.push(createNewDrop());
        }
        
        // Update existing drops
        newDrops = newDrops
          .map(drop => ({
            ...drop,
            y: drop.y + drop.speed,
          }))
          .filter(drop => drop.y < window.innerHeight + 50);
        
        // Limit total drops
        if (newDrops.length > 15) {
          newDrops = newDrops.slice(-15);
        }
        
        return newDrops;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [transactions]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {drops.map(drop => (
        <div
          key={drop.id}
          className="absolute text-xs font-mono whitespace-nowrap"
          style={{
            left: drop.x,
            top: drop.y,
            opacity: drop.opacity,
            color: drop.color,
            textShadow: `0 0 5px ${drop.color}40`,
            transform: 'translateX(-50%)',
          }}
        >
          {drop.text}
        </div>
      ))}
      
      {/* Subtle matrix-like background effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-gradient-to-b from-transparent via-green-500/5 to-transparent"></div>
      </div>
    </div>
  );
}