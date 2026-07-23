#!/usr/bin/env node

/**
 * iOS & FCM Test Push Notification Script
 * 
 * Usage:
 *   node test-notification.js [token] [title] [body]
 * 
 * Options via CLI flags or Environment Variables:
 *   --server-key <KEY>     Use Firebase Legacy Server Key
 *   --access-token <TOKEN> Use Firebase OAuth2 Access Token directly
 *   --key-file <PATH>      Path to service account JSON file
 * 
 * Examples:
 *   node test-notification.js
 *   node test-notification.js "YOUR_FCM_TOKEN" "Hello" "Notification message"
 *   node test-notification.js --server-key "YOUR_LEGACY_SERVER_KEY"
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Default target FCM token provided
const DEFAULT_TOKEN = "f-oiPbjjR0wHmyxUBeVjYk:APA91bF48nhqiO2zQh7q0SzA6uu347nx7DJXEJvdHzZwZu7L6xfrXQxhK0K6ZxL-Bqo_FI8c4ZjhKI8ezPD9iPsIZR9Vwmo0ywMXcYXSSmUZrv28lAg0i2M";
const DEFAULT_PROJECT_ID = "agi-spares";

// Parse CLI flags and positional arguments
const args = process.argv.slice(2);
let token = DEFAULT_TOKEN;
let title = "iOS Push Notification Test 🚀";
let body = "Hello! Push notifications on iOS are working correctly.";
let serverKey = process.env.FIREBASE_SERVER_KEY || null;
let customAccessToken = process.env.ACCESS_TOKEN || null;
let customKeyFile = process.env.SERVICE_ACCOUNT_KEY || null;

const positionals = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--server-key' && args[i + 1]) {
    serverKey = args[++i];
  } else if (args[i] === '--access-token' && args[i + 1]) {
    customAccessToken = args[++i];
  } else if (args[i] === '--key-file' && args[i + 1]) {
    customKeyFile = args[++i];
  } else if (!args[i].startsWith('--')) {
    positionals.push(args[i]);
  }
}

if (positionals[0]) token = positionals[0];
if (positionals[1]) title = positionals[1];
if (positionals[2]) body = positionals[2];

// Look for Firebase service account JSON in workspace root or specified path
function findServiceAccountKey() {
  if (customKeyFile && fs.existsSync(customKeyFile)) {
    try {
      const content = JSON.parse(fs.readFileSync(customKeyFile, 'utf8'));
      return { filePath: customKeyFile, data: content };
    } catch (e) {
      console.error(`❌ Failed to read key file ${customKeyFile}:`, e.message);
    }
  }

  const root = __dirname;
  const files = fs.readdirSync(root);
  for (const file of files) {
    if (file.endsWith('.json') && (file.includes('service') || file.includes('firebase') || file.includes('agi-spares') || file.includes('key') || file.includes('account'))) {
      try {
        const filePath = path.join(root, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (content.type === 'service_account' && content.private_key) {
          return { filePath: file, data: content };
        }
      } catch (e) {
        // ignore invalid files
      }
    }
  }
  return null;
}

// Generate JWT token from service account private key (RS256)
function generateJWT(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(claimSet)).toString('base64url');
  const signatureInput = `${base64Header}.${base64Payload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  const signature = signer.sign(serviceAccount.private_key, 'base64url');

  return `${signatureInput}.${signature}`;
}

// Request OAuth2 access token from Google
function getAccessToken(jwt) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    }).toString();

    const req = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data).access_token);
        } else {
          reject(new Error(`Failed to get OAuth token [${res.statusCode}]: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Send FCM notification using HTTP v1 API
function sendFCMv1(accessToken, projectId, targetToken, notificationTitle, notificationBody) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      message: {
        token: targetToken,
        notification: {
          title: notificationTitle,
          body: notificationBody
        },
        apns: {
          headers: {
            "apns-priority": "10"
          },
          payload: {
            aps: {
              alert: {
                title: notificationTitle,
                body: notificationBody
              },
              sound: "default",
              badge: 1,
              "content-available": 1
            }
          }
        },
        data: {
          test: "true",
          timestamp: new Date().toISOString()
        }
      }
    });

    const req = https.request(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`FCM API Error [${res.statusCode}]: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Send FCM notification using Legacy HTTP API
function sendFCMLegacy(key, targetToken, notificationTitle, notificationBody) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      to: targetToken,
      notification: {
        title: notificationTitle,
        body: notificationBody,
        sound: "default",
        badge: 1
      },
      priority: "high",
      data: {
        test: "true"
      }
    });

    const req = https.request('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${key}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`FCM Legacy Error [${res.statusCode}]: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log("\n=========================================");
  console.log("  iOS Push Notification Test Runner 📲  ");
  console.log("=========================================\n");
  console.log(`📌 Target Token : ${token}`);
  console.log(`📌 Title        : ${title}`);
  console.log(`📌 Body         : ${body}\n`);

  // Option 1: Legacy Server Key provided
  if (serverKey) {
    console.log("🔑 Using Legacy Server Key...");
    try {
      const result = await sendFCMLegacy(serverKey, token, title, body);
      console.log("\n✅ SUCCESS! Notification sent via Legacy API!");
      console.log("FCM Response:", JSON.stringify(result, null, 2));
      return;
    } catch (err) {
      console.error("\n❌ Error sending via Legacy API:", err.message);
      process.exit(1);
    }
  }

  // Option 2: Direct Bearer Access Token provided
  if (customAccessToken) {
    console.log("🔑 Using provided OAuth Access Token...");
    try {
      const result = await sendFCMv1(customAccessToken, DEFAULT_PROJECT_ID, token, title, body);
      console.log("\n✅ SUCCESS! Notification sent via FCM v1!");
      console.log("FCM Response:", JSON.stringify(result, null, 2));
      return;
    } catch (err) {
      console.error("\n❌ Error sending via FCM v1:", err.message);
      process.exit(1);
    }
  }

  // Option 3: Service Account Key JSON
  const saInfo = findServiceAccountKey();

  if (!saInfo) {
    console.log("⚠️  No Service Account Key JSON found in project directory.");
    console.log("\n📋 How to use this script:\n");
    console.log("Method A (Recommended - Firebase v1 API):");
    console.log("  1. Go to Firebase Console -> Project Settings -> Service accounts");
    console.log("  2. Click 'Generate new private key' and save as 'serviceAccountKey.json' in this folder.");
    console.log("  3. Run: node test-notification.js\n");
    console.log("Method B (Legacy Server Key):");
    console.log("  $ node test-notification.js --server-key \"YOUR_LEGACY_SERVER_KEY\"\n");
    console.log("Method C (iOS Simulator):");
    console.log("  $ xcrun simctl push booted com.algyas.agispares test_notification.apns\n");
    process.exit(1);
  }

  console.log(`🔑 Found Service Account Key: ${saInfo.filePath}`);
  const projectId = saInfo.data.project_id || DEFAULT_PROJECT_ID;
  console.log(`🚀 Firebase Project ID    : ${projectId}`);

  try {
    console.log("🔑 Generating JWT & Requesting OAuth2 token from Google...");
    const jwt = generateJWT(saInfo.data);
    const accessToken = await getAccessToken(jwt);

    console.log("📨 Sending Push Notification via FCM v1 API...");
    const result = await sendFCMv1(accessToken, projectId, token, title, body);

    console.log("\n✅ SUCCESS! Notification sent successfully!");
    console.log("FCM Response:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("\n❌ Error sending notification:", error.message);
    process.exit(1);
  }
}

main();
