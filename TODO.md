# CraftAI — TODO

## Kalan İşler

### Yüksek Öncelik
- [x] Markdown rendering düzeltmesi — tablolar, kod blokları streaming sırasında düzgün render edilmiyor ("code Copy" yazısı çıkıyor)
- [ ] LaTeX (KaTeX) rendering test — $$ formüller doğru render ediliyor mu kontrol et
- [x] Free plan token limitini 50K → 15K'ya düşür (kullanıcıyı ücretli plana yönlendirmek için)
- [ ] Sohbet geçmişi devam etme testi — eski sohbete yazınca aynı thread'den devam ediyor mu doğrula
- [ ] Görsel/PDF yükleme testi — sürükle-bırak, yapıştır, dosya seçme hepsi çalışıyor mu
- [ ] OpenAI API key ekle — GPT-4o ve GPT-4o Mini modelleri aktif etmek için

### Orta Öncelik
- [ ] Stripe key'leri ekle — ödeme sistemi aktif etmek için
- [ ] Deploy — Vercel'e deploy et, environment variables ekle
- [ ] Custom domain bağla
- [ ] Mobil responsiveness testi
- [ ] PDF export özelliği — sohbeti PDF olarak indir
- [x] Sohbet silme — sidebar'dan sohbet silme butonu

### Düşük Öncelik
- [x] Sohbet başlığı otomatik güncelleme — ilk mesajdan daha iyi başlık oluştur
- [x] Sohbet arama — sidebar'da sohbet geçmişinde arama
- [ ] Kullanıcı profil sayfası düzenleme
- [ ] Email doğrulama akışı
- [ ] Forgot password sayfası
- [ ] PWA desteği (service worker)
- [ ] Rate limiting (Upstash)
- [ ] Analytics dashboard (usage sayfası gerçek verilerle)

### Gelecek Özellikler
- [ ] Gemini modelleri ekle (Google AI)
- [ ] Groq modelleri ekle (Llama, Mixtral — ultra hızlı)
- [ ] Skill oluşturucu — kullanıcılar kendi skill'lerini oluşturabilsin
- [ ] Skill marketplace — kullanıcılar skill paylaşabilsin
- [ ] Dosya geçmişi — yüklenen dosyalar kaydedilsin
- [ ] Sesli mesaj desteği (Whisper transkripsiyon)
- [ ] Gerçek zamanlı sohbet paylaşma (link ile)
- [ ] Team/workspace desteği
- [ ] API erişimi (geliştiriciler için)

## Tamamlananlar ✅
- [x] Chat arayüzü (dark theme, glassmorphism, framer-motion)
- [x] Streaming API (SSE, Claude + OpenAI)
- [x] 19 AI skill (SKILL.md format, Anthropic standardı)
- [x] Skill auto-detection (trigger patterns)
- [x] / command palette
- [x] Model seçici (Claude Haiku/Sonnet/Opus, GPT-4o/Mini)
- [x] Kilitli modeller (plan bazlı)
- [x] Token bazlı kullanım takibi
- [x] Supabase Auth (email + Google OAuth)
- [x] Login/Signup sayfaları
- [x] Subscription sayfası (Free/Starter/Pro/Business)
- [x] Sohbet geçmişi kaydetme (notes tablosu)
- [x] Sidebar sohbet geçmişi (tarih gruplu)
- [x] Sidebar'dan sohbet yükleme (aynı sayfada)
- [x] Çoklu tur sohbet devam ettirme
- [x] Dosya yükleme (görsel, PDF, metin)
- [x] Sürükle-bırak + clipboard yapıştırma
- [x] Claude Vision + OpenAI Vision desteği
- [x] KaTeX LaTeX rendering
- [x] Markdown rendering (kod blokları, listeler, başlıklar)
- [x] Login zorunlu (anonim kullanım kapalı)
- [x] Token göstergesi sidebar'da
- [x] Sign out
- [x] CLAUDE.md + README.md dokümantasyon
- [x] Kullanılmayan dosyalar temizlendi
- [x] Tüm UI İngilizce
- [x] Build temiz (0 hata)
