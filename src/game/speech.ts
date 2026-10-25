let activeAudio: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;
let activeRequest: AbortController | null = null;
const audioCache = new Map<string, Blob>();

export function speakIrish(lineId: string): Promise<void> {
  return playSpeech(lineId, `line=${encodeURIComponent(lineId)}`);
}

export function speakShopLine(voice: 'orla' | 'colm', key: string): Promise<void> {
  const id = `${voice}.${key}`;
  return playSpeech(`shop:${id}`, `shop=${encodeURIComponent(id)}`);
}

async function playSpeech(lineId: string, query: string): Promise<void> {
  stopIrishSpeech();
  const controller = new AbortController();
  activeRequest = controller;

  try {
    let audio = audioCache.get(lineId);
    if (!audio) {
      const response = await fetch(
        `/.netlify/functions/irish-tts?${query}`,
        { signal: controller.signal },
      );
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `Irish voice service returned ${response.status}.`);
      }
      const contentType = response.headers.get('Content-Type') ?? '';
      if (!contentType.startsWith('audio/')) {
        throw new Error(
          'The Irish voice function is not running. Locally, start the site with `netlify dev`.',
        );
      }
      audio = await response.blob();
      audioCache.set(lineId, audio);
    }

    if (controller.signal.aborted) return;

    activeObjectUrl = URL.createObjectURL(audio);
    activeAudio = new Audio(activeObjectUrl);
    const objectUrl = activeObjectUrl;
    activeAudio.addEventListener(
      'ended',
      () => {
        URL.revokeObjectURL(objectUrl);
        if (activeObjectUrl === objectUrl) {
          activeObjectUrl = null;
          activeAudio = null;
        }
      },
      { once: true },
    );
    await activeAudio.play();
  } finally {
    if (activeRequest === controller) activeRequest = null;
  }
}

export function stopIrishSpeech(): void {
  activeRequest?.abort();
  activeRequest = null;

  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = '';
    activeAudio = null;
  }

  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
  }
}
