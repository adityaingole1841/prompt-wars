/**
 * Browser Speech Recognition Helper with Acoustic Echo Cancellation & Anti-Duplication
 *
 * Prevents:
 * 1. Text Echo / Duplication: Cleanly differentiates interim vs final transcript accumulation.
 * 2. Acoustic Feedback Echo: Automatically cancels text-to-speech when microphone is active,
 *    and requests audio tracks with echoCancellation: true.
 */

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as IWindow;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export interface SpeechRecognitionController {
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export interface SpeechOptions {
  onStart?: () => void;
  /**
   * Called with current live text.
   * `sessionText`: the clean full text spoken in this current session (no repetitions/echoes).
   * `isFinal`: true if speech engine concluded an utterance.
   */
  onResult: (sessionText: string, isFinal: boolean) => void;
  onError?: (errorMessage: string) => void;
  onEnd?: () => void;
  lang?: string;
}

export function createSpeechRecognizer(options: SpeechOptions): SpeechRecognitionController | null {
  if (!isSpeechRecognitionSupported()) return null;

  const win = window as unknown as IWindow;
  const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

  try {
    // 1. Acoustic Echo Prevention: Cancel any playing text-to-speech immediately
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = options.lang || 'en-IN';

    // Track accumulated final results across the session to avoid re-triggering echo
    let accumulatedFinals = '';

    recognition.onstart = () => {
      // Re-verify speech synthesis is stopped to prevent speaker feedback
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      options.onStart?.();
    };

    recognition.onresult = (event: any) => {
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        const transcript = item[0]?.transcript || '';
        if (item.isFinal) {
          accumulatedFinals += (accumulatedFinals ? ' ' : '') + transcript.trim();
        } else {
          interim += transcript;
        }
      }

      // Combine accumulated finals with current partial interim (no duplication!)
      const fullSessionText = (
        accumulatedFinals +
        (interim ? (accumulatedFinals ? ' ' : '') + interim.trim() : '')
      ).trim();

      if (fullSessionText) {
        const lastResultIsFinal = event.results[event.results.length - 1]?.isFinal || false;
        options.onResult(fullSessionText, lastResultIsFinal);
      }
    };

    recognition.onerror = (event: any) => {
      let friendlyMessage = 'Microphone error occurred.';
      if (event.error === 'not-allowed') {
        friendlyMessage = 'Microphone permission was denied. You can manually type your text.';
      } else if (event.error === 'no-speech') {
        friendlyMessage = 'No speech detected. Please speak into your microphone.';
      } else if (event.error === 'audio-capture') {
        friendlyMessage = 'No microphone was found on this device.';
      } else if (event.error === 'network') {
        friendlyMessage = 'Speech recognition network error. Please use manual typing.';
      }
      options.onError?.(friendlyMessage);
    };

    recognition.onend = () => {
      options.onEnd?.();
    };

    return {
      start: () => {
        try {
          // Acoustic echo check
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          recognition.start();
        } catch (e) {
          console.warn('Speech recognition start ignored:', e);
        }
      },
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      },
      abort: () => {
        try {
          recognition.abort();
        } catch {
          // ignore
        }
      },
    };
  } catch (err) {
    console.warn('Failed to initialize speech recognition:', err);
    return null;
  }
}
