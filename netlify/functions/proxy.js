const { HttpsProxyAgent } = require('https-proxy-agent');
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    const { targetUrl, method, headers, payload, proxyConfig } = JSON.parse(event.body);

    // Bắt buộc phải có User-Agent của Chrome thật
    const customHeaders = {
        ...headers,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://hoathinh3d.so/",
    };

    const options = { method, headers: customHeaders };
    if (payload && method === "POST") options.body = JSON.stringify(payload);

    // Cấu hình Proxy
    if (proxyConfig) {
        const p = proxyConfig.split(':');
        const proxyUrl = p.length === 4 ? `http://${p[2]}:${p[3]}@${p[0]}:${p[1]}` : `http://${p[0]}:${p[1]}`;
        options.agent = new HttpsProxyAgent(proxyUrl);
    }

    try {
        const response = await fetch(targetUrl, options);
        const text = await response.text();
        return { statusCode: 200, body: JSON.stringify({ success: true, text }) };
    } catch (e) {
        return { statusCode: 500, body: JSON.stringify({ success: false, error: e.message }) };
    }
};
