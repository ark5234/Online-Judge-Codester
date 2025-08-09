// Deprecated duplicate file. Re-export from services/appwrite to avoid broken self-imports.
export { client, account } from './services/appwrite';
export const loginWithGoogle = () => {
  const redirectUrl = window.location.origin;
  account.createOAuth2Session('google', redirectUrl, redirectUrl);
};
