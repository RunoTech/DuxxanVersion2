# DUXXAN Platform - Mevcut Kontrat Özellikleri

## 🎲 ÇEKİLİŞ (RAFFLE) ÖZELLİKLERİ

### Temel Çekiliş Sistemi
- **Çekiliş Oluşturma:** 25 USDT oluşturma ücreti
- **Minimum Bilet Fiyatı:** 1 USDT
- **Prize Types:** USDT_ONLY ve PHYSICAL_ITEM
- **Süre Kontrolü:** Başlangıç/bitiş zamanları
- **Maksimum Bilet Sayısı:** Belirlenebilir limit

### Komisyon Sistemi
- **Toplam Komisyon:** %10
- **Platform Payı:** %5 (bilet satışında anında)
- **Creator Payı:** %5 (bilet satışında anında)
- **Komisyon Cüzdanı:** Değiştirilebilir

### Bilet Satış Sistemi
- **Çoklu Bilet:** Tek işlemde birden fazla bilet
- **Otomatik Komisyon:** Anında dağılım
- **Katılımcı Takibi:** Bilet sayıları kaydedilir
- **Otomatik Sonlandırma:** Tüm biletler satılınca

### Fiziksel Ödül Sistemi
- **Ev/Araba Çekilişleri:** Fiziksel ödüller
- **USDT Backing:** Fiziksel ödülün USDT karşılığı
- **30 Gün Claim Süresi:** Fiziksel ödül teslim alma
- **%60-40 Dağılım:** Alamazsa winner %60, platform %40

### Multi-Signature Onay
- **Creator Onayı:** Çekilişi oluşturan onaylar
- **Winner Onayı:** Kazanan onaylar
- **Çift Onay Sistemi:** Her iki taraf da onaylamalı
- **Otomatik Ödeme:** Onaylar tamamlanınca

### Gelişmiş Randomness (6 Katman)
- **Time-delayed seed evolution**
- **Participant-influenced entropy**
- **BSC block-based entropy**
- **Purchase history entropy**
- **BSC validator entropy (21 validator cycle)**
- **Global entropy seed**

## 💰 BAĞIŞ (DONATION) ÖZELLİKLERİ

### Temel Bağış Sistemi
- **Bağış Oluşturma:** 25 USDT oluşturma ücreti
- **Minimum Bağış:** 10 USDT
- **Hedef Miktar:** Belirlenebilir goal
- **Süresiz/Süreli:** Organizasyon tipine göre

### Komisyon Sistemi
- **Bağışçıdan Kesinti:** %2 komisyon
- **Anında Transfer:** Net miktar creator'a
- **Platform Komisyonu:** Otomatik kesinti

### Organizasyon Tipleri
- **Individual:** Süreli bağışlar
- **Foundation:** Süresiz bağışlar
- **Association:** Süresiz bağışlar
- **Official:** Süresiz bağışlar

### Bağış Takibi
- **Katılımcı Listesi:** Bağışçılar kaydedilir
- **Bireysel Tutarlar:** Kişi başı bağış miktarları
- **Toplam Tutar:** Net bağış toplamı
- **Komisyon Kaydı:** Toplanan komisyon

## 🔒 GÜVENLİK ÖZELLİKLERİ

### Smart Contract Güvenliği
- **ReentrancyGuard:** Saldırı koruması
- **Pausable:** Acil durum durdurma
- **Ownable:** Admin kontrolü
- **Input Validation:** Tüm girdiler kontrol edilir

### BSC Uyumluluğu
- **BSC Validator Integration:** 21 validator sistemi
- **No block.difficulty:** BSC'de bulunmayan özellik kaldırıldı
- **Chain ID entropy:** BSC chain ID (56) kullanılır
- **Gas optimization:** BSC için optimize edildi

## 📊 VİEW FONKSİYONLARI

### Çekiliş Görüntüleme
- **getRaffle:** Tekil çekiliş bilgisi
- **getActiveRaffles:** Aktif çekilişler
- **getRaffleTickets:** Çekiliş biletleri
- **getRaffleParticipants:** Katılımcı listesi

### Bağış Görüntüleme
- **getDonation:** Tekil bağış bilgisi
- **getActiveDonations:** Aktif bağışlar
- **getDonationContributions:** Bağış katkıları
- **getDonationDonors:** Bağışçı listesi

## ⚙️ ADMİN FONKSİYONLARI

### Platform Yönetimi
- **setCommissionWallet:** Komisyon cüzdanı değiştirme
- **pause/unpause:** Platform durdurma/başlatma
- **Ownership transfer:** Sahiplik devri

### Acil Durum
- **Emergency pause:** Tüm işlemleri durdurma
- **Commission wallet update:** Güvenlik için değiştirme

## 💎 ÖZEL ÖZELLİKLER

### BSC Mainnet Optimizasyonu
- **21 Validator Rotation:** BSC'nin özel yapısı
- **Low Gas Fees:** BSC'nin düşük ücretleri
- **Fast Confirmations:** Hızlı işlem onayları
- **USDT Integration:** BSC USDT token desteği

### Entropy Generation
- **No External Dependencies:** Chainlink VRF gereksiz
- **Multi-layer Security:** 6 farklı entropy kaynağı
- **Tamper Resistant:** Manipülasyon koruması
- **Fair Distribution:** Uniform random dağılım

## 📈 SABİTLER VE LİMİTLER

### Ücretler
- **Raffle Creation:** 25 USDT
- **Donation Creation:** 25 USDT
- **Minimum Ticket:** 1 USDT
- **Minimum Donation:** 10 USDT

### Komisyon Oranları
- **Raffle Commission:** %10 (5% platform + 5% creator)
- **Donation Commission:** %2 (platform'a)
- **Physical Prize Split:** %60 winner + %40 platform

### Zaman Limitleri
- **Physical Prize Claim:** 30 gün
- **Seed Commit Time:** Her çekiliş için
- **End Time Validation:** Süre kontrolü

Bu kontrat BSC mainnet'te deploy için tamamen hazır ve tüm güvenlik kontrolleri yapılmış durumda.