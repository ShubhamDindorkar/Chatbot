import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatWidget } from './widget/ChatWidget';

const hostId = 'kaal-chatbot-root';

type Position = 'bottom-right' | 'bottom-left';

export type WidgetInitConfig = {
  brandColor?: string;
  position?: Position;
  apiBaseUrl?: string;
};

function resolveEmbedScript(): HTMLScriptElement | null {
  const current = document.currentScript;
  if (current && current instanceof HTMLScriptElement) return current;

  const scripts = Array.from(document.getElementsByTagName('script'));
  const tagged = scripts.find((s) => s.dataset && (s.dataset.apiUrl || s.dataset.brandColor || s.dataset.position || s.dataset.api_url || s.dataset.brand_color || s.dataset.position));
  if (tagged) return tagged;

  // Fallback: last script whose src looks like our widget bundle.
  for (let i = scripts.length - 1; i >= 0; i--) {
    const src = scripts[i].getAttribute('src') || '';
    if (src.includes('kaal-chatbot') && src.includes('widget')) return scripts[i];
    if (src.includes('kaal-chatbot-widget') || src.includes('kaal-chatbot-widget.iife.js')) return scripts[i];
  }

  return scripts.length > 0 ? scripts[scripts.length - 1] : null;
}

function getDatasetConfig(script: HTMLScriptElement | null): Required<WidgetInitConfig> {
  const brandColor = script?.dataset.brandColor || script?.dataset.brand_color || import.meta.env.VITE_WIDGET_BRAND_COLOR || '#1E3A5F';
  const position = (script?.dataset.position || script?.dataset.position || import.meta.env.VITE_WIDGET_POSITION || 'bottom-right') as Position;
  const apiBaseUrl = script?.dataset.apiUrl || script?.dataset.api_url || import.meta.env.VITE_API_BASE_URL;

  return { brandColor, position, apiBaseUrl };
}

function mountWidget(initConfig?: WidgetInitConfig) {
  if (document.getElementById(hostId)) {
    return;
  }

  const scriptTag = resolveEmbedScript();
  const datasetConfig = getDatasetConfig(scriptTag);
  const config: Required<WidgetInitConfig> = {
    brandColor: initConfig?.brandColor || datasetConfig.brandColor,
    position: initConfig?.position || datasetConfig.position,
    apiBaseUrl: initConfig?.apiBaseUrl || datasetConfig.apiBaseUrl,
  };

  const host = document.createElement('div');
  host.id = hostId;
  document.body.appendChild(host);

  const widgetRoot = document.createElement('div');
  host.appendChild(widgetRoot);

  const root = ReactDOM.createRoot(widgetRoot);
  root.render(
    <React.StrictMode>
      <ChatWidget brandColor={config.brandColor} position={config.position} apiBaseUrl={config.apiBaseUrl} />
    </React.StrictMode>,
  );
}

export function init(config?: WidgetInitConfig) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    mountWidget(config);
  } else {
    window.addEventListener('DOMContentLoaded', () => mountWidget(config), { once: true });
  }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  mountWidget();
} else {
  window.addEventListener('DOMContentLoaded', () => mountWidget(), { once: true });
}

