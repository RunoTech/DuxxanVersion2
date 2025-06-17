# Manual Winner Selection - Admin Feature

## Admin Kontrolü ile Kazanan Belirleme ✅

### Yetki Sistemi
Sadece yetkili cüzdanlar manual winner seçebilir:
- **Deploy Wallet** 
- **Commission Wallet**

### Kısıtlamalar
Manuel kazanan seçimi sadece şu koşullarda:
- Çekilişi deploy veya commission wallet oluşturmuş olmalı
- Çekiliş aktif durumda olmalı
- Seçilen kişinin biletleri olmalı

### Implementation
```solidity
function selectManualWinner(uint256 _raffleId, address _winner) external {
    require(
        msg.sender == deployWallet || msg.sender == commissionWallet,
        "Only admin can select manual winner"
    );
    require(
        raffle.creator == deployWallet || raffle.creator == commissionWallet,
        "Manual selection only for admin-created raffles"
    );
    require(raffleTickets[_raffleId][_winner] > 0, "Winner must have tickets");
}
```

### Otomatik İşlemler

#### USDT Çekilişleri
- Manuel seçim → Anında ödeme
- Otomatik onay (creator + platform)
- Hemen transfer, bekleme yok

#### Fiziksel Ödül Çekilişleri
- Manuel seçim → Onay süreci devam eder
- Creator ve winner onayı gerekli
- 6 gün claim süresi

### Güvenlik Özellikleri
- Sadmin admin-created raffles için
- Winner'ın biletleri olmalı
- Event logging ile şeffaflık
- Immutable deploy wallet

### Events
```solidity
event ManualWinnerSelected(uint256 indexed raffleId, address indexed winner, address indexed admin);
```

### View Functions
```solidity
function canSelectManualWinner(address _user, uint256 _raffleId) external view returns (bool)
```

### Kullanım Senaryoları

**✅ İzin Verilen:**
- Deploy wallet admin-created USDT çekilişinde manuel seçim
- Commission wallet admin-created fiziksel çekilişte manuel seçim

**❌ İzin Verilmeyen:**
- Normal kullanıcının oluşturduğu çekilişte manuel seçim
- Biletleri olmayan kişiyi winner seçme
- Pasif çekilişte manuel seçim

Bu özellik platform kontrolünü artırır ve özel çekilişler için esneklik sağlar.