import { afterEach, describe, expect, it, vi } from "vitest";
import { registerMessagingWorker } from "./messagingWorker";
afterEach(() => vi.unstubAllGlobals());
describe("messaging and offline coexistence", () => {
  it("keeps Firebase Messaging off the root offline scope", async () => {
    const register = vi.fn().mockResolvedValue({ scope: "/firebase-cloud-messaging-push-scope/" });
    vi.stubGlobal("navigator", { serviceWorker: { register } });
    await registerMessagingWorker();
    expect(register).toHaveBeenCalledWith("/firebase-messaging-sw.js", { scope: "/firebase-cloud-messaging-push-scope/" });
  });
});