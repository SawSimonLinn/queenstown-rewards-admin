import "server-only";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

type PushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

/** Sends push messages via Expo's push service, in batches of 100 per their limits. */
export async function sendExpoPushNotifications(messages: PushMessage[]): Promise<void> {
  const BATCH_SIZE = 100;
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);
    await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(batch),
    });
  }
}
