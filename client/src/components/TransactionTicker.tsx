import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MockTransaction {
  id: string;
  wallet: string;
  amount: number;
  type: 'raffle_created' | 'raffle_joined' | 'ticket_bought' | 'donation_made';
  timestamp: number;
}

const transactionTypes = [
  { type: 'raffle_created' as const, text: 'çekiliş oluşturdu', amount: 25 },
  { type: 'raffle_joined' as const, text: 'çekilişe katıldı', amount: 25 },
  { type: 'ticket_bought' as const, text: 'bilet aldı', amount: 10 },
  { type: 'donation_made' as const, text: 'donate yaptı', amount: 10 },
];

// Generate 2000+ random wallet addresses
const generateWallets = (): string[] => {
  const wallets: string[] = [];
  const chars = '0123456789abcdef';
  
  for (let i = 0; i < 2500; i++) {
    let wallet = '0x';
    for (let j = 0; j < 40; j++) {
      wallet += chars[Math.floor(Math.random() * chars.length)];
    }
    wallets.push(wallet);
  }
  
  return wallets;
};

const mockWallets = generateWallets();

const generateMockTransaction = (): MockTransaction => {
  const randomType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
  const randomWallet = mockWallets[Math.floor(Math.random() * mockWallets.length)];
  
  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    wallet: randomWallet,
    amount: randomType.amount,
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
  const [transactions, setTransactions] = useState<MockTransaction[]>([]);

  useEffect(() => {
    // Initialize with some transactions
    const initialTransactions = Array.from({ length: 20 }, () => generateMockTransaction());
    setTransactions(initialTransactions);

    // Add new transaction every 2-4 seconds
    const interval = setInterval(() => {
      setTransactions(prev => {
        const newTransaction = generateMockTransaction();
        const updated = [newTransaction, ...prev];
        // Keep only last 50 transactions for performance
        return updated.slice(0, 50);
      });
    }, Math.random() * 2000 + 2000); // 2-4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-white py-2 shadow-lg border-t border-yellow-400">
      <div className="overflow-hidden whitespace-nowrap">
        <motion.div
          className="inline-block"
          animate={{ x: ['100%', '-100%'] }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className="inline-flex items-center space-x-8">
            {transactions.map((tx, index) => (
              <div key={`${tx.id}-${index}`} className="inline-flex items-center space-x-2 text-sm md:text-base font-medium px-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="font-mono text-yellow-100 text-xs md:text-sm">
                    {formatWallet(tx.wallet)}
                  </span>
                  <span className="text-white">→</span>
                  <span className="font-bold text-yellow-100">
                    {tx.amount} USDT
                  </span>
                  <span className="text-white text-xs md:text-sm">
                    {getTransactionText(tx)}
                  </span>
                </div>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {transactions.map((tx, index) => (
              <div key={`${tx.id}-duplicate-${index}`} className="inline-flex items-center space-x-2 text-sm md:text-base font-medium px-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="font-mono text-yellow-100 text-xs md:text-sm">
                    {formatWallet(tx.wallet)}
                  </span>
                  <span className="text-white">→</span>
                  <span className="font-bold text-yellow-100">
                    {tx.amount} USDT
                  </span>
                  <span className="text-white text-xs md:text-sm">
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