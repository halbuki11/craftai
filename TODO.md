# CraftAI — TODO

## Yapılması Gerekenler

### Yüksek Öncelik (Launch Blockers)
- [ ] Stripe entegrasyonu — key'leri ekle, checkout test et, Pro plan ($19/mo) aktif et
- [ ] OpenAI API key ekle sunucuya — yoksa GPT modellerini kaldır
- [ ] Gerçek kullanıcı testi — 5-10 kişiye göster, feedback al

### Orta Öncelik (Post-Launch)
- [ ] Sentry/error monitoring entegre et — prod hataları yakala
- [ ] Google Analytics veya Plausible ekle — trafik takibi
- [ ] OG Image oluştur — sosyal medya paylaşımları için
- [ ] Blog/içerik marketing başlat — SEO için
- [ ] Landing page'e demo/screenshot ekle — ürünü göster
- [ ] Landing page'e testimonial bölümü ekle — sosyal kanıt

### Düşük Öncelik (Gelecek)
- [ ] Upstash Redis ile dağıtık rate limiting (şu an in-memory)
- [ ] Email ile workspace davet gönderme (şu an sadece DB'ye kaydediliyor)
- [ ] Kullanıcı profil fotoğrafı
- [ ] Sohbet klasörleri/etiketleme
- [ ] Mobil app (React Native veya PWA iyileştirme)
- [ ] A/B testing landing page

## Tamamlananlar ✅
- [x] Chat (Claude Haiku/Sonnet + GPT-4o/Mini) + streaming
- [x] 20 AI skill (bilingual trigger patterns)
- [x] Skill auto-detection
- [x] / command palette
- [x] Model seçici (plan bazlı kilitleme)
- [x] Token bazlı kullanım + aylık auto-renew
- [x] Supabase Auth (Google OAuth + email/password)
- [x] Login/Signup/Forgot Password
- [x] Fiyatlandırma: Free (50K) + Pro $19/mo (2M)
- [x] Sohbet geçmişi + silme + arama + otomatik başlık
- [x] Dosya yükleme (görsel, PDF, metin) + sürükle-bırak
- [x] Markdown rendering (kod, tablo, liste, başlık)
- [x] KaTeX LaTeX rendering (Math Solver ile entegre)
- [x] Smooth streaming (rAF buffer + ayrı state)
- [x] Sohbet URL persistence (sayfa yenilenince korunur)
- [x] Chat export (text dosyası)
- [x] TR/EN lokalizasyon (tüm sayfalar)
- [x] Dil değiştirme (sidebar toggle)
- [x] Middleware auth koruması
- [x] Rate limiting (in-memory)
- [x] Security headers (X-Frame, CSP, Referrer)
- [x] PWA (service worker + manifest)
- [x] Landing page (SEO, karşılaştırma tablosu, FAQ, pricing)
- [x] Analytics dashboard (7 gün grafik, model dağılımı)
- [x] Cool & Minimal tema (teal/cyan)
- [x] Deploy (SSH + nginx + pm2 → aimaa.cloud)
- [x] Auth callback fix (reverse proxy)
- [x] Code Writer skill eklendi
- [x] Tüm Türkçe metinler İngilizce'ye çevrildi
- [x] Gereksiz sayfalar kaldırıldı (notes, todos, skills, team, files, api-keys)
- [x] Opus kaldırıldı (maliyet kontrolü)
- [x] Gemini kaldırıldı (gereksiz karmaşıklık)
- [x] Sesli mesaj kaldırıldı (gereksiz maliyet)
