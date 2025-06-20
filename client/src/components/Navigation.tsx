import { useState, memo } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Menu, Sun, Moon, Wallet, ArrowUpRight } from 'lucide-react';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';
import { useTheme } from '@/components/ThemeProvider';

function NavigationComponent() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isConnected, address, connectWallet, disconnectWallet, isConnecting } = useWallet();

  const navItems = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/raffles', label: 'Çekilişler' },
    { href: '/donations', label: 'Bağışlar' },
    { href: '/community', label: 'Topluluk' },
  ];

  const NavLinks = ({ mobile = false, compact = false }) => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`font-semibold transition-colors hover:text-gray-600 dark:hover:text-gray-300 ${
            location === item.href ? 'text-gray-900 dark:text-white' : 'text-black dark:text-white'
          } ${mobile ? 'block py-2' : ''} ${compact ? 'text-sm' : ''}`}
          onClick={() => mobile && setIsOpen(false)}
        >
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <nav className="bg-white dark:bg-duxxan-surface border-b border-gray-200 dark:border-duxxan-border sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-duxxan-surface/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-duxxan-yellow">
            DUXXAN
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-8">
            <NavLinks />
          </div>
          
          {/* Tablet Navigation - Compact */}
          <div className="hidden lg:flex xl:hidden items-center space-x-4">
            <NavLinks compact />
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Theme Toggle */}
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              className="text-gray-600 dark:text-duxxan-text-secondary hover:text-gray-900 dark:hover:text-white h-8 w-8 lg:h-10 lg:w-10"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 lg:w-5 lg:h-5" /> : <Moon className="w-4 h-4 lg:w-5 lg:h-5" />}
            </Button>

            {/* Wallet Connection */}
            <div className="hidden lg:block">
              {isConnected ? (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl px-4 py-2 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">Cüzdan Bağlı</span>
                    </div>
                    
                    <div className="h-4 w-px bg-green-300 dark:bg-green-600"></div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">BSC</span>
                      <code className="text-sm font-mono text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-800/50 px-2 py-0.5 rounded">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </code>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        onClick={() => {
                          if (address) {
                            navigator.clipboard.writeText(address);
                          }
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-green-200 dark:hover:bg-green-700 text-green-600 dark:text-green-400"
                        title="Adresi Kopyala"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </Button>
                      
                      <Button
                        onClick={() => window.open(`https://bscscan.com/address/${address}`, '_blank')}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-green-200 dark:hover:bg-green-700 text-green-600 dark:text-green-400"
                        title="BSC Scan'de Görüntüle"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        onClick={disconnectWallet}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 ml-2"
                        title="Cüzdanı Bağlantısını Kes"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Dialog open={isWalletDialogOpen} onOpenChange={(open) => {
                  if (open) {
                    // Trigger wallet detection when dialog opens
                    import('@/lib/wallet').then(({ walletManager }) => {
                      walletManager.checkAvailableWallets();
                    });
                  }
                  setIsWalletDialogOpen(open);
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-duxxan-yellow hover:bg-duxxan-yellow/90 text-black">
                      <Wallet className="mr-2 h-4 w-4" />
                      Cüzdan Bağla
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Cüzdan Seçin</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Button
                        onClick={async () => {
                          await connectWallet('metamask');
                          setIsWalletDialogOpen(false);
                        }}
                        disabled={isConnecting}
                        className="w-full h-16 justify-start space-x-4"
                        variant="outline"
                      >
                        <img 
                          src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" 
                          alt="MetaMask" 
                          className="w-8 h-8"
                        />
                        <div className="text-left">
                          <div className="font-semibold">MetaMask</div>
                          <div className="text-sm text-gray-500">En popüler cüzdan</div>
                        </div>
                      </Button>
                      
                      <Button
                        onClick={async () => {
                          await connectWallet('trustwallet');
                          setIsWalletDialogOpen(false);
                        }}
                        disabled={isConnecting}
                        className="w-full h-16 justify-start space-x-4"
                        variant="outline"
                      >
                        <img 
                          src="https://trustwallet.com/assets/images/media/assets/trust_platform.svg" 
                          alt="Trust Wallet" 
                          className="w-8 h-8"
                        />
                        <div className="text-left">
                          <div className="font-semibold">Trust Wallet</div>
                          <div className="text-sm text-gray-500">Mobil ve güvenli</div>
                        </div>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Profile Icon for connected users */}
            {isConnected && address && (
              <Link href="/profile-new" className="hidden md:block">
                <Button variant="ghost" size="icon" className="text-gray-600 dark:text-duxxan-text-secondary hover:text-gray-900 dark:hover:text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-duxxan-surface border-duxxan-border">
                <SheetHeader>
                  <SheetTitle>Menü</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks mobile />
                  
                  <div className="pt-4 border-t border-duxxan-border">
                    {isConnected ? (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Bağlı Cüzdan: {address?.slice(0, 6)}...{address?.slice(-4)}
                        </div>
                        <Button onClick={disconnectWallet} variant="outline" className="w-full">
                          Cüzdan Bağlantısını Kes
                        </Button>
                      </div>
                    ) : (
                      <Dialog open={isWalletDialogOpen} onOpenChange={(open) => {
                        if (open) {
                          // Trigger wallet detection when dialog opens
                          import('@/lib/wallet').then(({ walletManager }) => {
                            walletManager.checkAvailableWallets();
                          });
                        }
                        setIsWalletDialogOpen(open);
                      }}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-duxxan-yellow hover:bg-duxxan-yellow/90 text-black">
                            <Wallet className="mr-2 h-4 w-4" />
                            Cüzdan Bağla
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Cüzdan Seçin</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Button
                              onClick={async () => {
                                await connectWallet('metamask');
                                setIsWalletDialogOpen(false);
                                setIsOpen(false);
                              }}
                              disabled={isConnecting}
                              className="w-full h-16 justify-start space-x-4"
                              variant="outline"
                            >
                              <img 
                                src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" 
                                alt="MetaMask" 
                                className="w-8 h-8"
                              />
                              <div className="text-left">
                                <div className="font-semibold">MetaMask</div>
                                <div className="text-sm text-gray-500">En popüler cüzdan</div>
                              </div>
                            </Button>
                            
                            <Button
                              onClick={async () => {
                                await connectWallet('trustwallet');
                                setIsWalletDialogOpen(false);
                                setIsOpen(false);
                              }}
                              disabled={isConnecting}
                              className="w-full h-16 justify-start space-x-4"
                              variant="outline"
                            >
                              <img 
                                src="https://trustwallet.com/assets/images/media/assets/trust_platform.svg" 
                                alt="Trust Wallet" 
                                className="w-8 h-8"
                              />
                              <div className="text-left">
                                <div className="font-semibold">Trust Wallet</div>
                                <div className="text-sm text-gray-500">Mobil ve güvenli</div>
                              </div>
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

export const Navigation = memo(NavigationComponent);
