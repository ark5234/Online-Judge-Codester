import { Client, Account } from 'appwrite';

const client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6881edab0015c849630d');

export const account = new Account(client); 