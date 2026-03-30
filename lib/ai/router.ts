import OpenAI from 'openai';
import { sendClaudeJson, sendClaudeMessage } from './claude';
import { type ModelId, DEFAULT_MODEL } from './model-config';

// Keep OpenAI for DALL-E image generation only (lazy init)
let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '', timeout: 60_000 });
  }
  return _openai;
}

export type ActionType =
  | 'note_save'
  | 'gmail_draft'
  | 'calendar_add'
  | 'reminder_set'
  | 'todo_create'
  | 'summarize'
  | 'notion_save'
  | 'create_content'
  | 'generate_image'
  | 'web_research'
  | 'analyze_document'
  | 'quick_answer';

export interface DetectedAction {
  type: ActionType;
  params: Record<string, unknown>;
  confidence: number;
}

export interface RouterResult {
  detected_language: string;
  actions: DetectedAction[];
  formatted_content: string;
  title: string;
  tags: string[];
  response_message: string;
}

const SYSTEM_PROMPT = `Sen güçlü bir AI asistansın. Kullanıcının mesajını analiz et ve doğru aksiyonu belirle. Sen sadece not tutan bir uygulama DEĞİLSİN — sen iş yapan bir asistansın.

DESTEKLENEN AKSİYONLAR:

📧 gmail_draft - Mail isteniyorsa taslak oluştur
   params: { to, subject, body }
   - "to": e-posta veya kişi ismi. "Ali'ye" → to="Ali"
   - "subject": bağlamdan uygun konu
   - "body": kullanıcının söylediklerinden profesyonel mail yaz. UYDURMA, sadece söylenenleri kullan.

📅 calendar_add - Etkinlik/randevu ekle
   params: { title, datetime, duration, description }

⏰ reminder_set - Hatırlatma kur
   params: { message, remind_at }

✅ todo_create - Görev oluştur
   params: { title, due_date, priority }

✍️ create_content - İçerik üret (blog yazısı, LinkedIn postu, sosyal medya, tweet, teklif, rapor, metin vb.)
   params: { content_type, topic, tone, length, content }
   - content_type: "blog" | "linkedin" | "tweet" | "instagram" | "email_template" | "proposal" | "report" | "general"
   - topic: konu
   - tone: "professional" | "casual" | "friendly" | "formal" (varsayılan: professional)
   - length: "short" | "medium" | "long" (varsayılan: medium)
   - content: OLUŞTURULMUŞ İÇERİK. Tam, yayına hazır içerik yaz. Başlık, gövde, hashtag (varsa) dahil.

🎨 generate_image - Görsel üret (DALL-E)
   params: { prompt, style }
   - prompt: İngilizce, detaylı görsel açıklaması yaz
   - style: "realistic" | "artistic" | "minimal" | "cartoon"

🔍 web_research - Web araştırma / URL özetle
   params: { query, url }
   - Kullanıcı URL verdiyse url alanına yaz
   - Genel araştırma istiyorsa query alanına yaz

📄 analyze_document - Görsel/döküman analizi (kullanıcı fotoğraf/PDF gönderdiğinde)
   params: { instruction }
   - instruction: kullanıcının analiz talebi

💬 quick_answer - Hızlı soru cevabı (genel bilgi sorusu, çeviri, hesaplama vb.)
   params: { question, answer }
   - question: sorulan soru
   - answer: DETAYLI ve FAYDALI cevap yaz. Kısa değil, açıklayıcı ol.

📝 note_save - SADECE kullanıcı açıkça "not al", "kaydet" dediğinde
   params: {}

💡 summarize - Metin özetleme
   params: {}

KURALLAR:
- Mesajın dilini algıla ve İÇERİK DAHİL aynı dilde yaz
- Tarih/saat: ISO 8601. Kullanıcı saat dilimi: __TIMEZONE__
- Şu an: __NOW__
- create_content'te İÇERİĞİ KENDİN YAZ. "content" alanı boş olmasın, tam metin üret.
- quick_answer'da CEVABI KENDİN YAZ. "answer" alanı boş olmasın.
- Hiçbir aksiyona uymuyorsa quick_answer kullan
- note_save otomatik ekleme, sadece istendiğinde
- confidence 0.7 altındaysa ekleme

JSON FORMATI (SADECE JSON DÖNDÜR, başka metin ekleme):
{
  "detected_language": "ISO 639-1 kodu",
  "actions": [
    {"type": "action_type", "params": {...}, "confidence": 0.0-1.0}
  ],
  "formatted_content": "Düzenlenmiş içerik",
  "title": "Kısa başlık (max 50 karakter)",
  "tags": ["etiket1"],
  "response_message": "Kullanıcıya kısa onay mesajı"
}`;

export async function routeMessage(
  message: string,
  timezone?: string,
  context?: { history?: Array<{ role: 'user' | 'assistant'; content: string }>; userInfo?: string },
  model?: ModelId
): Promise<RouterResult> {
  const tz = timezone || 'Europe/Istanbul';
  const nowLocal = new Date().toLocaleString('tr-TR', { timeZone: tz, dateStyle: 'short', timeStyle: 'short' });
  let systemPrompt = SYSTEM_PROMPT
    .replace('__TIMEZONE__', tz)
    .replace('__NOW__', nowLocal);

  if (context?.userInfo) {
    systemPrompt += `\n\nKULLANICI BİLGİSİ: ${context.userInfo}`;
  }

  // Build messages for Claude
  const messages: { role: 'user' | 'assistant'; content: string }[] = [];

  if (context?.history && context.history.length > 0) {
    for (const entry of context.history.slice(-5)) {
      messages.push({ role: entry.role, content: entry.content });
    }
  }

  messages.push({ role: 'user', content: message });

  const result = await sendClaudeJson<RouterResult>({
    model: model || DEFAULT_MODEL,
    system: systemPrompt,
    messages,
    temperature: 0.4,
  });

  result.actions = result.actions.filter(
    action => action.confidence >= 0.7
  );

  // Safety: gmail_send → gmail_draft
  result.actions = result.actions.map(action => {
    if ((action.type as string) === 'gmail_send') {
      return { ...action, type: 'gmail_draft' as ActionType };
    }
    return action;
  });

  // Fallback: no actions → quick_answer
  if (result.actions.length === 0) {
    result.actions.push({
      type: 'quick_answer',
      params: { question: message, answer: result.response_message || '' },
      confidence: 1.0,
    });
  }

  return result;
}

/**
 * Analyze an image or document using Claude Vision
 */
export async function analyzeImage(imageUrl: string, instruction?: string, model?: ModelId): Promise<string> {
  const claude = (await import('./claude')).getClaudeClient();
  const { getModelConfig } = await import('./model-config');
  const config = getModelConfig(model || DEFAULT_MODEL);

  // Fetch image as base64
  const res = await fetch(imageUrl);
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mediaType = res.headers.get('content-type') || 'image/jpeg';

  const response = await claude.messages.create({
    model: config.apiModel,
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: base64,
            },
          },
          {
            type: 'text',
            text: instruction || 'Bu görseli detaylı analiz et. İçeriğini, önemli bilgileri ve varsa metinleri açıkla.',
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find(b => b.type === 'text');
  return textBlock?.text || 'Analiz yapılamadı.';
}

/**
 * Generate an image using DALL-E (stays on OpenAI)
 */
export async function generateImage(prompt: string, style?: string): Promise<string> {
  const styledPrompt = style
    ? `${prompt}, ${style} style`
    : prompt;

  const response = await getOpenAI().images.generate({
    model: 'dall-e-3',
    prompt: styledPrompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  });

  return response.data?.[0]?.url || '';
}

/**
 * Research a topic or summarize a URL using Claude
 */
export async function webResearch(query?: string, url?: string, model?: ModelId): Promise<string> {
  let content = '';

  if (url) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'CraftAI/1.0' },
        signal: AbortSignal.timeout(10000),
      });
      const html = await res.text();
      content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 8000);
    } catch {
      content = 'URL içeriği alınamadı.';
    }
  }

  const userMessage = url
    ? `Bu web sayfasının içeriğini özetle ve önemli noktaları çıkar:\n\nURL: ${url}\n\nİçerik:\n${content}`
    : `Şu konuyu araştır ve kapsamlı bilgi ver: ${query}`;

  return sendClaudeMessage({
    model: model || DEFAULT_MODEL,
    system: 'Sen bir araştırma asistanısın. Verilen konu veya içerik hakkında kapsamlı, doğru ve faydalı bilgi sun. Türkçe yaz (kullanıcı farklı dilde sormadıysa).',
    messages: [{ role: 'user', content: userMessage }],
    maxTokens: 3000,
  });
}
