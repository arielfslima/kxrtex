const webpush = require('web-push');

console.log('Generating VAPID keys for web push notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('=== VAPID Keys Generated ===');
console.log('Add these to your .env file:\n');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:noreply@kxrtex.com`);
console.log('\n=== Public Key for Frontend ===');
console.log('Use this public key in your frontend application:');
console.log(`const vapidPublicKey = '${vapidKeys.publicKey}';`);
console.log('\nNote: Keep the private key secure and never expose it on the frontend!');