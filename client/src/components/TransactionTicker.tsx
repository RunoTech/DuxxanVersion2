import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';

interface MockTransaction {
  id: string;
  wallet: string;
  amount: number;
  type: 'raffle_created' | 'raffle_joined' | 'ticket_bought' | 'donation_made';
  timestamp: number;
}

const transactionTypes = [
  { type: 'raffle_created' as const, text: 'çekiliş oluşturdu', amount: 25 },
  { type: 'raffle_joined' as const, text: 'çekilişe katıldı', minAmount: 1, maxAmount: 250 },
  { type: 'ticket_bought' as const, text: 'bilet aldı', minAmount: 1, maxAmount: 250 },
  { type: 'donation_made' as const, text: 'donate yaptı', minAmount: 1, maxAmount: 250 },
];

// Generate random wallet addresses on demand for better performance
const generateWallet = (): string => {
  const chars = '0123456789abcdef';
  let wallet = '0x';
  for (let j = 0; j < 40; j++) {
    wallet += chars[Math.floor(Math.random() * chars.length)];
  }
  return wallet;
};

const generateMockTransaction = (): MockTransaction => {
  const randomType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
  const randomWallet = generateWallet();
  
  let amount: number;
  if (randomType.type === 'raffle_created') {
    amount = 25; // Sabit çekiliş oluşturma ücreti
  } else {
    // Rastgele tutar 1-250 dolar arası
    amount = Math.floor(Math.random() * 250) + 1;
  }
  
  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    wallet: randomWallet,
    amount: amount,
    type: randomType.type,
    timestamp: Date.now(),
  };
};

const formatWallet = (wallet: string): string => {
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
};

const getTransactionText = (transaction: MockTransaction): string => {
  const typeInfo = transactionTypes.find(t => t.type === transaction.type);
  return typeInfo ? typeInfo.text : 'işlem yaptı';
};

export function TransactionTicker() {
  const { isConnected } = useWallet();
  const [transactions, setTransactions] = useState<MockTransaction[]>([]);

  // Don't render if wallet is not connected
  if (!isConnected) {
    return null;
  }

  useEffect(() => {
    if (!isConnected) return;
    
    // Initialize with minimal transactions to reduce server load
    const initialTransactions = Array.from({ length: 8 }, () => generateMockTransaction());
    setTransactions(initialTransactions);

    // Much slower updates to reduce server restarts
    const interval = setInterval(() => {
      setTransactions(prev => {
        const newTransaction = generateMockTransaction();
        const updated = [newTransaction, ...prev];
        // Keep minimal array for performance
        return updated.slice(0, 15);
      });
    }, 15000); // Her 15 saniyede 1 yeni işlem - server load azaltıldı

    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white py-3 shadow-2xl border-t border-gray-600">
      <div className="overflow-hidden whitespace-nowrap">
        <motion.div
          className="inline-block"
          animate={{ x: ['100%', '-100%'] }}
          transition={{
            duration: 150,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className="inline-flex items-center space-x-20">
            {transactions.map((tx, index) => (
              <div key={tx.id} className="inline-flex items-center space-x-3 text-sm md:text-base font-medium px-8">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
                  <span className="font-mono text-gray-300 text-xs md:text-sm tracking-wider">
                    {formatWallet(tx.wallet)}
                  </span>
                  <span className="text-gray-400 text-lg">→</span>
                  <span className="font-bold text-green-400 text-sm md:text-base">
                    ${tx.amount}
                  </span>
                  <span className="text-gray-400 text-xs">USDT</span>
                  <span className="text-white text-xs md:text-sm font-medium">
                    {getTransactionText(tx)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}