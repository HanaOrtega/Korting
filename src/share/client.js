// Client ID Google wbudowany w aplikację w czasie budowania (deploy/aplikacja.sh zapisuje go w .google-client-id i
// przekazuje jako EXPO_PUBLIC_GOOGLE_CLIENT_ID). Dzięki temu użytkownik tylko loguje się do Google – nic nie konfiguruje.
export const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
