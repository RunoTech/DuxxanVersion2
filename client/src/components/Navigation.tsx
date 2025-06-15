import { useState, memo } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Menu, Sun, Moon, Wallet } from 'lucide-react';
import { useSimpleWallet } from '@/hooks/useSimpleWallet';
import { useTheme } from '@/components/ThemeProvider';

function NavigationComponent() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isConnected, address, connectMetaMask, connectTrustWallet, disconnect, isConnecting } = useSimpleWallet();

  const navItems = [
    { href: '/raffles', label: 'Çekilişler' },
    { href: '/donations', label: 'Bağışlar' },
    { href: '/community', label: 'Topluluk' },
  ];

  const NavLinks = ({ mobile = false }) => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`font-semibold transition-colors hover:text-gray-600 dark:hover:text-gray-300 ${
            location === item.href ? 'text-gray-900 dark:text-white' : 'text-black dark:text-white'
          } ${mobile ? 'block py-2' : ''}`}
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
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-duxxan-yellow">
            DUXXAN
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              className="text-gray-600 dark:text-duxxan-text-secondary hover:text-gray-900 dark:hover:text-white"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Wallet Connection */}
            <div className="hidden md:block">
              {isConnected ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <Button onClick={disconnect} variant="outline" size="sm">
                    Çıkış
                  </Button>
                </div>
              ) : (
                <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
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
                          await connectMetaMask();
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
                          await connectTrustWallet();
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
                        <Button onClick={disconnect} variant="outline" className="w-full">
                          Cüzdan Bağlantısını Kes
                        </Button>
                      </div>
                    ) : (
                      <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
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
                                await connectMetaMask();
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
                                await connectTrustWallet();
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
