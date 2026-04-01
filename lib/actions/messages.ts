export const ACTION_LABELS: Record<string, string> = {
  note_save: 'Note saved',
  gmail_draft: 'Email draft created — check Gmail',
  calendar_add: 'Event added to calendar',
  todo_create: 'To-do added',
  reminder_set: 'Reminder set',
  summarize: 'Summary created',
  notion_save: 'Saved to Notion',
  create_content: 'Content created',
  generate_image: 'Image generated',
  web_research: 'Research completed',
  analyze_document: 'Analysis completed',
  quick_answer: '',
};

export interface ContactChoice {
  name: string;
  email: string;
}

/**
 * Build a message asking the user to pick a recipient.
 */
export function buildClarificationMessage(choices: ContactChoice[]): string {
  const lines: string[] = ['<b>Who would you like to send this to?</b>', ''];

  if (choices.length > 0) {
    for (let i = 0; i < choices.length; i++) {
      lines.push(`${i + 1}. ${choices[i].name} — ${choices[i].email}`);
    }
    lines.push('');
    lines.push('Type a number or enter an email address.');
  } else {
    lines.push('Enter the recipient\'s email address.');
  }

  return lines.join('\n');
}

export function getErrorMessage(actionType: string, error?: string): string {
  if (error?.includes('not connected')) {
    const labels: Record<string, string> = {
      gmail_draft: 'Gmail is not connected — connect it from the integrations page',
      calendar_add: 'Google Calendar is not connected — connect it from the integrations page',
      notion_save: 'Notion is not connected — connect it from the integrations page',
    };
    return labels[actionType] || 'Integration not connected';
  }
  if (error?.includes('e-posta adresi bulunamadı') || error?.includes('email not found')) {
    return 'Contact not found — connect Google Contacts or provide an email address';
  }
  if (error?.includes('Token refresh') || error?.includes('refresh token')) {
    return 'Session expired — please reconnect the integration';
  }
  return `${actionType} action failed`;
}
