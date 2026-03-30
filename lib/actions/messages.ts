export const ACTION_LABELS: Record<string, string> = {
  note_save: '📝 Not kaydedildi',
  gmail_draft: "📧 Mail taslağı oluşturuldu — Gmail'den kontrol et",
  calendar_add: '📅 Takvime etkinlik eklendi',
  todo_create: '✅ Yapılacak iş eklendi',
  reminder_set: '⏰ Hatırlatma ayarlandı',
  summarize: '📋 Özet oluşturuldu',
  notion_save: "📓 Notion'a kaydedildi",
  create_content: '✍️ İçerik oluşturuldu',
  generate_image: '🎨 Görsel oluşturuldu',
  web_research: '🔍 Araştırma tamamlandı',
  analyze_document: '📄 Analiz tamamlandı',
  quick_answer: '💬',
};

export interface ContactChoice {
  name: string;
  email: string;
}

/**
 * Build a Telegram message asking the user to pick a recipient.
 */
export function buildClarificationMessage(choices: ContactChoice[]): string {
  const lines: string[] = ['📧 <b>Kime göndermek istiyorsunuz?</b>', ''];

  if (choices.length > 0) {
    for (let i = 0; i < choices.length; i++) {
      lines.push(`${i + 1}. ${choices[i].name} — ${choices[i].email}`);
    }
    lines.push('');
    lines.push('Numara yazın veya e-posta adresi girin.');
  } else {
    lines.push('Alıcının e-posta adresini yazın.');
  }

  return lines.join('\n');
}

export function getErrorMessage(actionType: string, error?: string): string {
  if (error?.includes('not connected')) {
    const labels: Record<string, string> = {
      gmail_draft: '⚠️ Gmail bağlı değil — aimaa.cloud/integrations sayfasından bağlayın',
      calendar_add: '⚠️ Google Calendar bağlı değil — aimaa.cloud/integrations sayfasından bağlayın',
      notion_save: '⚠️ Notion bağlı değil — aimaa.cloud/integrations sayfasından bağlayın',
    };
    return labels[actionType] || '⚠️ Entegrasyon bağlı değil';
  }
  if (error?.includes('e-posta adresi bulunamadı')) {
    return '⚠️ Kişi rehberinde bulunamadı — Google Rehber bağlayın veya e-posta adresini söyleyin';
  }
  if (error?.includes('Token refresh') || error?.includes('refresh token')) {
    return '⚠️ Oturum süresi dolmuş — lütfen entegrasyonu yeniden bağlayın';
  }
  return `⚠️ ${actionType} işlemi başarısız`;
}
