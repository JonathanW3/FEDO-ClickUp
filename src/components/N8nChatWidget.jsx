import { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

export function N8nChatWidget() {
  useEffect(() => {
    createChat({
      webhookUrl: 'http://localhost:5678/webhook/89c5da79-c59c-4a16-abc9-88211ff7d44d/chat',
      mode: 'window',
      defaultLanguage: 'es',
      // responseMode: 'streaming',
      style: {
        '--chat--window--height': '600px',
      },
      initialMessages: ['¡Hola! ¿En qué puedo ayudarte?'],
      i18n: {
        es: {
          title: 'Asistente',
          subtitle: 'Siempre disponible',
          inputPlaceholder: 'Escribe tu mensaje...',
          getStarted: 'Comenzar',
          closeButtonTooltip: 'Cerrar',
        }
      }
    });
  }, []);

  return null;
}