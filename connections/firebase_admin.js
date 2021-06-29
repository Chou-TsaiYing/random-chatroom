const firebaseAdmin = require('firebase-admin');
require('dotenv').config();

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
        type: "service_account",
        project_id: process.env.FIREBSAE_PROJECT_ID,
        private_key_id: process.env.FIREBSAE_PRIVATE_KEY_ID,
        private_key:process.env.FIREBSAE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBSAE_CLIENT_EMAIL,
        client_id: process.env.FIREBSAE_CLIENT_ID,
        auth_uri: process.env.FIREBSAE_AUTH_URI,
        token_uri: process.env.FIREBSAE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBSAE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBSAE_CLIENT_PROVIDER_X509_CERT_URL,
    }),
    databaseURL: process.env.FIREBASE_DATABASEURL,
  });

  const db =firebaseAdmin.database();

  module.exports = db;