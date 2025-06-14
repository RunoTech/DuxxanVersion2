import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

export function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, connectMetaMask, connectTrustWallet, disconnect, connection } = useWallet();

  const navItems = [
    { href: '/', label: 'Ana Sayfa' },
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
          className={`font-medium transition-colors hover:text-white ${
            location === item.href ? 'text-white' : 'text-duxxan-text-secondary'
          } ${mobile ? 'block py-2' : ''}`}
          onClick={() => mobile && setIsOpen(false)}
        >
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <nav className="bg-duxxan-surface border-b border-duxxan-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex flex-col items-start">
            <div className="text-2xl font-bold text-duxxan-yellow">
              DUXXAN
            </div>
            <div className="text-xs text-duxxan-text-secondary italic transform -rotate-12 -mt-1 ml-2 opacity-75">
              good luck
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </div>

          <div className="flex items-center space-x-4">
            {/* Profile Icon moved to the end */}
            {isConnected && (
              <Link href="/profile" className="hidden md:block">
                <Button variant="ghost" size="icon" className="text-duxxan-text-secondary hover:text-white">
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
