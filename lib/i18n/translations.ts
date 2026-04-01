export type Locale = "en" | "tr";

const translations = {
  // Auth
  "auth.welcome": { en: "Welcome back", tr: "Tekrar hoş geldiniz" },
  "auth.signInDesc": { en: "Sign in to your CraftAI account", tr: "CraftAI hesabınıza giriş yapın" },
  "auth.continueGoogle": { en: "Continue with Google", tr: "Google ile devam et" },
  "auth.or": { en: "or", tr: "veya" },
  "auth.email": { en: "Email", tr: "E-posta" },
  "auth.password": { en: "Password", tr: "Şifre" },
  "auth.signIn": { en: "Sign In", tr: "Giriş Yap" },
  "auth.noAccount": { en: "Don't have an account?", tr: "Hesabınız yok mu?" },
  "auth.signUp": { en: "Sign Up", tr: "Kayıt Ol" },
  "auth.createAccount": { en: "Create account", tr: "Hesap oluştur" },
  "auth.createDesc": { en: "Get started with CraftAI", tr: "CraftAI ile başlayın" },
  "auth.fullName": { en: "Full Name", tr: "Ad Soyad" },
  "auth.haveAccount": { en: "Already have an account?", tr: "Zaten hesabınız var mı?" },
  "auth.signedIn": { en: "Signed in successfully", tr: "Giriş başarılı" },
  "auth.accountCreated": { en: "Account created! Check your email.", tr: "Hesap oluşturuldu! E-postanızı kontrol edin." },
  "auth.signUpLink": { en: "Sign up", tr: "Kayıt ol" },
  "auth.signInLink": { en: "Sign in", tr: "Giriş yap" },

  "auth.forgotPassword": { en: "Forgot password?", tr: "Şifrenizi mi unuttunuz?" },
  "auth.resetPassword": { en: "Reset Password", tr: "Şifreyi Sıfırla" },
  "auth.resetDesc": { en: "Enter your email and we'll send a reset link", tr: "E-postanızı girin, sıfırlama linki gönderelim" },
  "auth.sendReset": { en: "Send Reset Link", tr: "Sıfırlama Linki Gönder" },
  "auth.resetSent": { en: "Check your email for the reset link", tr: "Sıfırlama linki e-postanıza gönderildi" },
  "auth.backToLogin": { en: "Back to sign in", tr: "Giriş sayfasına dön" },

  // Sidebar
  "sidebar.newChat": { en: "New chat", tr: "Yeni sohbet" },
  "sidebar.search": { en: "Search", tr: "Ara" },
  "sidebar.plans": { en: "Plans", tr: "Planlar" },
  "sidebar.signOut": { en: "Sign Out", tr: "Çıkış Yap" },
  "sidebar.signIn": { en: "Sign In", tr: "Giriş Yap" },
  "sidebar.remaining": { en: "remaining", tr: "kalan" },
  "sidebar.today": { en: "Today", tr: "Bugün" },
  "sidebar.yesterday": { en: "Yesterday", tr: "Dün" },
  "sidebar.thisWeek": { en: "This Week", tr: "Bu Hafta" },
  "sidebar.older": { en: "Older", tr: "Daha Eski" },
  "sidebar.noChats": { en: "Conversations will\nappear here", tr: "Sohbetler burada\ngörünecek" },

  // Chat
  "chat.placeholder": { en: "Message CraftAI or type / for skills...", tr: "CraftAI'ye mesaj yaz veya / ile skill seç..." },
  "chat.askSkill": { en: "Ask {skill}...", tr: "{skill} sor..." },
  "chat.stop": { en: "Stop", tr: "Durdur" },
  "chat.send": { en: "Send", tr: "Gönder" },
  "chat.copy": { en: "Copy", tr: "Kopyala" },
  "chat.copied": { en: "Copied", tr: "Kopyalandı" },
  "chat.disclaimer": { en: "CraftAI can make mistakes. Verify important information.", tr: "CraftAI hata yapabilir. Önemli bilgileri doğrulayın." },
  "chat.signUpPrompt": { en: "Sign up or sign in to start chatting", tr: "Sohbete başlamak için giriş yapın" },

  // Welcome
  "welcome.hello": { en: "Hello,", tr: "Merhaba," },
  "welcome.howCanIHelp": { en: "How can I help you today?", tr: "Bugün size nasıl yardımcı olabilirim?" },
  "welcome.skills": { en: "Skills", tr: "Yetenekler" },

  // Subscription
  "sub.plans": { en: "Plans", tr: "Planlar" },
  "sub.tokenPool": { en: "All models share the same token pool", tr: "Tüm modeller aynı token havuzunu paylaşır" },
  "sub.tokenUsage": { en: "Token Usage", tr: "Token Kullanımı" },
  "sub.used": { en: "used", tr: "kullanıldı" },
  "sub.remaining": { en: "tokens remaining this period", tr: "token kaldı bu dönem" },
  "sub.manage": { en: "Manage Subscription", tr: "Aboneliği Yönet" },
  "sub.currentPlan": { en: "Current Plan", tr: "Mevcut Plan" },
  "sub.upgrade": { en: "Upgrade", tr: "Yükselt" },
  "sub.current": { en: "Current", tr: "Mevcut" },
  "sub.tryIt": { en: "Try it out", tr: "Deneyin" },
  "sub.popular": { en: "Most popular", tr: "En popüler" },
  "sub.tokensMonth": { en: "tokens/mo", tr: "token/ay" },
  "sub.month": { en: "/month", tr: "/ay" },
  "sub.free": { en: "Free", tr: "Ücretsiz" },
  "sub.allModels": { en: "All models", tr: "Tüm modeller" },
  "sub.includingOpus": { en: "Including Claude Opus 4.6", tr: "Claude Opus 4.6 dahil" },
  "sub.prioritySupport": { en: "Priority support", tr: "Öncelikli destek" },

  // Usage
  "usage.title": { en: "Usage", tr: "Kullanım" },
  "usage.desc": { en: "Your credit usage details", tr: "Kredi kullanım detaylarınız" },
  "usage.remaining": { en: "Remaining", tr: "Kalan" },
  "usage.used": { en: "Used", tr: "Kullanılan" },
  "usage.totalRequests": { en: "Total Requests", tr: "Toplam İstek" },
  "usage.periodEnd": { en: "Period End", tr: "Dönem Sonu" },
  "usage.creditUsage": { en: "Credit Usage", tr: "Kredi Kullanımı" },
  "usage.modelBreakdown": { en: "Model Breakdown", tr: "Model Dağılımı" },
  "usage.recentUsage": { en: "Recent Usage", tr: "Son Kullanım" },
  "usage.credits": { en: "credits", tr: "kredi" },
  "usage.general": { en: "General", tr: "Genel" },

  // Settings
  "settings.title": { en: "Settings", tr: "Ayarlar" },
  "settings.desc": { en: "Your account details and connections", tr: "Hesap bilgileriniz ve bağlantılarınız" },
  "settings.accountInfo": { en: "Account Info", tr: "Hesap Bilgileri" },
  "settings.accountInfoDesc": { en: "Your basic account details", tr: "Temel hesap bilgileriniz" },
  "settings.email": { en: "Email", tr: "E-posta" },
  "settings.joined": { en: "Joined", tr: "Katılım" },
  "settings.status": { en: "Status", tr: "Durum" },
  "settings.active": { en: "Active", tr: "Aktif" },
  "settings.timezone": { en: "Timezone", tr: "Saat Dilimi" },
  "settings.timezoneDesc": { en: "Timezone for calendar and reminders", tr: "Takvim ve hatırlatmalar için saat dilimi" },
  "settings.aiModel": { en: "AI Model", tr: "AI Modeli" },
  "settings.aiModelDesc": { en: "Choose your default AI model", tr: "Varsayılan AI modelinizi seçin" },
  "settings.profile": { en: "Profile", tr: "Profil" },
  "settings.language": { en: "Language", tr: "Dil" },
  "settings.save": { en: "Save", tr: "Kaydet" },

  // Suggestions
  "sug.scraper": { en: "Write a Python web scraper", tr: "Python web scraper yaz" },
  "sug.email": { en: "Draft a professional email", tr: "Profesyonel bir e-posta yaz" },
  "sug.research": { en: "Research top tech trends 2026", tr: "2026 teknoloji trendlerini araştır" },
  "sug.startup": { en: "Brainstorm startup ideas", tr: "Startup fikirleri üret" },

  // Skill names
  "skill.brainstorm": { en: "Brainstorm", tr: "Beyin Fırtınası" },
  "skill.budget-planner": { en: "Budget Planner", tr: "Bütçe Planlayıcı" },
  "skill.content-writer": { en: "Content Writer", tr: "İçerik Yazarı" },
  "skill.cv-writer": { en: "CV Writer", tr: "CV Yazarı" },
  "skill.email-assistant": { en: "Email Assistant", tr: "E-posta Asistanı" },
  "skill.grammar-fixer": { en: "Grammar Fixer", tr: "Dilbilgisi Düzeltici" },
  "skill.health-advisor": { en: "Health & Wellness Advisor", tr: "Sağlık Danışmanı" },
  "skill.legal-review": { en: "Legal Document Review", tr: "Hukuki Belge İnceleme" },
  "skill.math-solver": { en: "Math Solver", tr: "Matematik Çözücü" },
  "skill.meeting-notes": { en: "Meeting Notes", tr: "Toplantı Notları" },
  "skill.motivation-coach": { en: "Motivation Coach", tr: "Motivasyon Koçu" },
  "skill.pdf-summarize": { en: "PDF Summarizer", tr: "PDF Özetleyici" },
  "skill.petition-writer": { en: "Petition Writer", tr: "Dilekçe Yazarı" },
  "skill.quick-answer": { en: "Quick Answer", tr: "Hızlı Cevap" },
  "skill.recipe": { en: "Recipe", tr: "Tarif" },
  "skill.research": { en: "Research", tr: "Araştırma" },
  "skill.social-media": { en: "Social Media", tr: "Sosyal Medya" },
  "skill.translator": { en: "Translator", tr: "Çevirmen" },
  "skill.travel-planner": { en: "Travel Planner", tr: "Seyahat Planlayıcı" },

  // Common
  "chat.exportPdf": { en: "Export as PDF", tr: "PDF olarak indir" },
  "common.delete": { en: "Delete", tr: "Sil" },
  "common.cancel": { en: "Cancel", tr: "İptal" },
  "common.loading": { en: "Loading...", tr: "Yükleniyor..." },
  "common.error": { en: "Something went wrong", tr: "Bir hata oluştu" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale, params?: Record<string, string>): string {
  const entry = translations[key];
  let text: string = entry?.[locale] || entry?.["en"] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}

export default translations;
