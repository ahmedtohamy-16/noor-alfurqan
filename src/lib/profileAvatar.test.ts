import { describe, expect, it } from 'vitest';
import { avatarFileAllowed, MAX_AVATAR_BYTES } from './profileAvatar';
describe('private profile image upload', () => {
  it('accepts actual JPEG/PNG/WebP files up to two MB', () => {
    expect(avatarFileAllowed({ type: 'image/jpeg', size: MAX_AVATAR_BYTES })).toBe(true);
    expect(avatarFileAllowed({ type: 'image/png', size: MAX_AVATAR_BYTES + 1 })).toBe(false);
    expect(avatarFileAllowed({ type: 'image/svg+xml', size: 100 })).toBe(false);
  });
});