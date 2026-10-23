import { AMBIENT_DIALOGUE, DIALOGUE } from '../../src/game/dialogue';

const VOICES = {
  Ava: 'ga-IE-OrlaNeural',
  Leo: 'ga-IE-ColmNeural',
};
const audioCache = new Map();

function textResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body,
  };
}

function escapeXml(text) {
  return text.replace(/[<>&"']/g, (character) => {
    const replacements = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&apos;',
    };
    return replacements[character];
  });
}

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return textResponse(405, 'Only GET requests are supported.');
  }

  const query = event.queryStringParameters ?? {};
  if (Object.keys(query).length !== 1 || typeof query.line !== 'string') {
    return textResponse(400, 'Request must include one approved line identifier.');
  }

  const lineMatch = /^(dialogue|ambient)-(\d+)$/.exec(query.line);
  if (!lineMatch) {
    return textResponse(400, 'Unknown Irish dialogue line.');
  }

  const lineIndex = Number(lineMatch[2]);
  const lines = lineMatch[1] === 'dialogue' ? DIALOGUE : AMBIENT_DIALOGUE;
  const line = lines[lineIndex];
  if (!Number.isSafeInteger(lineIndex) || !line) {
    return textResponse(400, 'Unknown Irish dialogue line.');
  }

  const { speaker, text } = line;
  const key = `${speaker}:${text}`;
  const cachedAudio = audioCache.get(key);
  if (cachedAudio) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
        'Netlify-CDN-Cache-Control': 'public, s-maxage=86400',
      },
      body: cachedAudio,
      isBase64Encoded: true,
    };
  }

  const subscriptionKey = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!subscriptionKey || !region || !/^[a-z0-9-]+$/i.test(region)) {
    return textResponse(
      503,
      'Configure AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in Netlify environment variables.',
    );
  }

  const ssml = `<speak version="1.0" xml:lang="ga-IE"><voice xml:lang="ga-IE" name="${VOICES[speaker]}">${escapeXml(text)}</voice></speak>`;
  let audio;
  try {
    const azureResponse = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        },
        body: ssml,
      },
    );
    if (!azureResponse.ok) {
      console.error('Azure Speech returned status:', azureResponse.status);
      return textResponse(
        502,
        `Azure Speech could not synthesize the line (HTTP ${azureResponse.status}). Check the key, region, and Azure quota.`,
      );
    }
    audio = Buffer.from(await azureResponse.arrayBuffer()).toString('base64');
  } catch (error) {
    console.error('Azure Speech request failed:', error);
    return textResponse(502, 'Could not reach Azure Speech. Check the function logs and try again.');
  }

  audioCache.set(key, audio);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400',
      'Netlify-CDN-Cache-Control': 'public, s-maxage=86400',
    },
    body: audio,
    isBase64Encoded: true,
  };
}
