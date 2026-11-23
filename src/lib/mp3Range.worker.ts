import { Mp3Encoder } from '@breezystack/lamejs';

let encoder: Mp3Encoder | undefined;
const chunks: ArrayBuffer[] = [];
self.onmessage = (event: MessageEvent<{ type: 'encode' | 'finish'; samples?: Float32Array }>) => {
  try {
    if (event.data.type === 'finish') {
      if (!encoder) throw new Error('No audio');
      const tail = encoder.flush();
      if (tail.length) chunks.push(new Uint8Array(tail).buffer);
      self.postMessage({ blob: new Blob(chunks, { type: 'audio/mpeg' }) });
      return;
    }
    encoder ??= new Mp3Encoder(1, 44100, 128);
    const samples = event.data.samples;
    if (!samples) return;
    for (let i = 0; i < samples.length; i += 1152) {
      const slice = samples.subarray(i, i + 1152);
      const pcm = new Int16Array(slice.length);
      for (let n = 0; n < slice.length; n++) {
        const value = Math.max(-1, Math.min(1, slice[n]));
        pcm[n] = Math.round(value * (value < 0 ? 32768 : 32767));
      }
      const encoded = encoder.encodeBuffer(pcm);
      if (encoded.length) chunks.push(new Uint8Array(encoded).buffer);
    }
    self.postMessage({ encoded: true });
  } catch {
    self.postMessage({ error: 'تعذّر تجميع المقطع الصوتي' });
  }
};