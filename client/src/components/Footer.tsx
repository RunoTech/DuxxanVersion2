import { Link } from 'wouter';
import { Github, Twitter, MessageCircle, Mail } from 'lucide-react';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="text-2xl font-bold text-yellow-500 mb-4">
              DUXXAN
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Blockchain tabanlı şeffaf çekiliş ve bağış platformu. Güvenli, adil ve topluluk odaklı.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-500 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-500 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-yellow-500 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/raffles" onClick={scrollToTop} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                  Çekilişler
                </Link>
              </li>
              <li>
                <Link href="/donations" onClick={scrollToTop} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                  Bağış Kampanyaları
                </Link>
              </li>
              <li>
                <Link href="/community" onClick={scrollToTop} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                  Topluluk
                </Link>
              </li>
              <li>
                <Link href="/profile" onClick={scrollToTop} className="text-gray-600 dark:text-duxxan-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                  Profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Oluştur */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Oluştur</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/create-raffle" onClick={scrollToTop} className="text-gray-600 dark:text-duxxan-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                  Çekiliş Oluştur
                </Link>
              </li>
              <li>
                <Link href="/create-donation" onClick={scrollToTop} className="text-gray-600 dark:text-duxxan-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                  Kampanya Başlat
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-duxxan-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                  API Dokümantasyonu
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-duxxan-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                  Geliştiriciler
                </a>
              </li>
            </ul>
          </div>

          {/* Destek */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Destek</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 dark:text-duxxan-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                  Yardım Merkezi
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-duxxan-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                  Nasıl Başlarım?
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-duxxan-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                  Güvenlik
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-duxxan-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                  İletişim
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-duxxan-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 text-sm text-gray-600 dark:text-duxxan-text-secondary">
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                Gizlilik Politikası
              </a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                Kullanım Şartları
              </a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                Çerez Politikası
              </a>
            </div>
            <div className="text-sm text-gray-600 dark:text-duxxan-text-secondary mt-4 md:mt-0">
              © 2024 DUXXAN. Tüm hakları saklıdır.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}