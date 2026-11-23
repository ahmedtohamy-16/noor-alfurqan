import { supabase } from '@/integrations/supabase/client';
export const AVATAR_BUCKET = 'profile-avatars';
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const avatarFileAllowed = (file: Pick<File, 'type' | 'size'>) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size > 0 && file.size <= MAX_AVATAR_BYTES;
export async function resolveAvatar(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  if (/^https:\/\//.test(path)) return path;
  const { data, error } = await supabase.storage.from(AVATAR_BUCKET).createSignedUrl(path, 3600);
  return error ? null : data?.signedUrl || null;
}