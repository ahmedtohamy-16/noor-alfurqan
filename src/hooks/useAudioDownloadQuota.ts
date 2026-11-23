import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/untypedClient';
import { audioStorageLimit, REGULAR_AUDIO_LIMIT } from '@/lib/audioRangeRules';
import { setDownloadStorageLimit } from '@/lib/ayahDownloads';

export function useAudioDownloadQuota() {
  const { user } = useAuth();
  useEffect(() => {
    let current = true;
    setDownloadStorageLimit(REGULAR_AUDIO_LIMIT);
    if (!user) return;
    const refresh = async () => {
      const { data, error } = await supabase.from('pro_entitlements')
        .select('status,expires_at').eq('user_id', user.uid).maybeSingle();
      if (current) setDownloadStorageLimit(error ? REGULAR_AUDIO_LIMIT : audioStorageLimit(data));
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60_000);
    window.addEventListener('focus', refresh);
    return () => { current = false; clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [user?.uid]);
}