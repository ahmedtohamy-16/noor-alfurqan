export function createRangeEncoder(signal: AbortSignal) {
  const worker = new Worker(new URL('./mp3Range.worker.ts', import.meta.url), { type: 'module' });
  const context = new AudioContext({ sampleRate: 44100 });
  const exchange = <T,>(message: object, transfer: Transferable[] = []): Promise<T> => new Promise((resolve, reject) => {
    const abort = () => { cleanup(); reject(new DOMException('Aborted', 'AbortError')); };
    const cleanup = () => { signal.removeEventListener('abort', abort); worker.onmessage = null; worker.onerror = null; };
    if (signal.aborted) { abort(); return; }
    signal.addEventListener('abort', abort, { once: true });
    worker.onerror = () => { cleanup(); reject(new Error('تعذّر تجميع المقطع الصوتي')); };
    worker.onmessage = (event) => {
      cleanup();
      if (event.data.error) reject(new Error(event.data.error));
      else resolve(event.data.blob ?? event.data.encoded);
    };
    worker.postMessage(message, transfer);
  });
  return {
    async append(blob: Blob) {
      const decoded = await context.decodeAudioData(await blob.arrayBuffer());
      // Decode one ayah at a time; the worker maintains a single continuous MP3 stream.
      const mono = new Float32Array(decoded.length);
      for (let c = 0; c < decoded.numberOfChannels; c++) {
        const channel = decoded.getChannelData(c);
        for (let i = 0; i < mono.length; i++) mono[i] += channel[i] / decoded.numberOfChannels;
      }
      await exchange({ type: 'encode', samples: mono }, [mono.buffer]);
    },
    finish: () => exchange<Blob>({ type: 'finish' }),
    close() { worker.terminate(); void context.close(); },
  };
}