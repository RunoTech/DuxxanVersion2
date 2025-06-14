import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Sun, Moon } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useTheme } from '@/components/ThemeProvider';

export function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, connectMetaMask, connectTrustWallet, disconnect, connection } = useWallet();
  const { theme, toggleTheme } = useTheme();

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

            {/* Profile Icon moved to the end */}
            {isConnected && (
              <Link href="/profile" className="hidden md:block">
                <Button variant="ghost" size="icon" className="text-gray-600 dark:text-duxxan-text-secondary hover:text-gray-900 dark:hover:text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </Button>
              </Link>
            )}
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-duxxan-text-secondary hidden sm:block">
                  {connection?.address.slice(0, 6)}...{connection?.address.slice(-4)}
                </span>
                <Button
                  onClick={disconnect}
                  variant="outline"
                  className="duxxan-button-secondary"
                >
                  Bağlantıyı Kes
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Button
                  onClick={connectMetaMask}
                  className="duxxan-button-primary"
                >
                  MetaMask Bağla
                </Button>
                <Button
                  onClick={connectTrustWallet}
                  variant="outline"
                  className="duxxan-button-secondary"
                >
                  Trust Wallet
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-duxxan-surface border-duxxan-border">
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks mobile />
                  
                  {!isConnected && (
                    <div className="flex flex-col space-y-2 pt-4 border-t border-duxxan-border">
                      <Button
                        onClick={() => {
                          connectMetaMask();
                          setIsOpen(false);
                        }}
                        className="duxxan-button-primary w-full"
                      >
                        MetaMask Bağla
                      </Button>
                      <Button
                        onClick={() => {
                          connectTrustWallet();
                          setIsOpen(false);
                        }}
                        variant="outline"
                        className="duxxan-button-secondary w-full"
                      >
                        Trust Wallet
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
