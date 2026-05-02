export default function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { token, chatId, template } = req.body;

        // Basic validation
        if (!token || !chatId || !template) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Encode the Telegram credentials into Base64
        // This avoids saving data to a database
        const configData = JSON.stringify({ t: token, c: chatId });
        const encodedConfig = Buffer.from(configData).toString('base64');

        // Generate a random visual slug
        const slug = Math.random().toString(36).substring(2, 10);

        // Return the clean URL structure
        // The rewrite in vercel.json handles the /v/ path
        res.status(200).json({
            slug: slug,
            config: encodedConfig
        });

    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
}
