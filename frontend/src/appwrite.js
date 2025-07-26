import { Client, Account } from 'appwrite';

const client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6881edab0015c849630d');

export const account = new Account(client); 
import { account } from './appwrite';

export const loginWithGoogle = () => {
  const redirectUrl = window.location.origin;
  account.createOAuth2Session('google', redirectUrl, redirectUrl);
};
