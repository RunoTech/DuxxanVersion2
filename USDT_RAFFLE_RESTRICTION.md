# USDT Çekiliş Kısıtlaması

## Yeni Güvenlik Özelliği ✅

### USDT_ONLY Çekiliş Kısıtlaması
Sadece yetkili cüzdanlar USDT token ödüllü çekiliş oluşturabilir:

#### Yetkili Cüzdanlar:
- **Deploy Wallet:** Kontratı deploy eden cüzdan
- **Commission Wallet:** Platform komisyon cüzdanı

#### Kod Implementation:
```solidity
// Constructor'da deploy wallet kaydedilir
deployWallet = msg.sender; // Deploy wallet immutable

// USDT çekiliş oluştururken kontrol
if (_prizeType == PrizeType.USDT_ONLY) {
    require(
        msg.sender == deployWallet || msg.sender == commissionWallet,
        "Only deploy or commission wallet can create USDT raffles"
    );
}
```

#### Fiziksel Ödül Çekilişleri
- **PHYSICAL_ITEM** türü çekilişler herkes oluşturabilir
- Ev, araba, elektronik eşya vb. için kısıtlama yok
- Sadece pure USDT token ödülleri kısıtlı

#### Güvenlik View Fonksiyonu
```solidity
function canCreateUSDTRaffle(address _user) external view returns (bool) {
    return _user == deployWallet || _user == commissionWallet;
}
```

Frontend bu fonksiyonu kullanarak kullanıcıya uygun arayüz gösterebilir.

#### Kullanım Senaryoları:

**✅ İzin Verilen:**
- Deploy wallet → USDT çekiliş oluşturur
- Commission wallet → USDT çekiliş oluşturur
- Herhangi bir cüzdan → Fiziksel ödül çekilişi

**❌ İzin Verilmeyen:**
- Normal kullanıcı → USDT çekiliş oluşturamaz
- Sadece fiziksel ödül çekilişleri oluşturabilir

Bu sistem platform kontrolünü sağlar ve token dağıtımını yönetir.