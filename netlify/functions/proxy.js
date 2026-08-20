const { HttpsProxyAgent } = require('https-proxy-agent');
const fetch = require('node-fetch'); // Dùng node-fetch để tương thích tốt với Agent

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Chỉ nhận POST" };

    try {
        const { targetUrl, method, headers, payload, proxyConfig } = JSON.parse(event.body);

        const fetchOptions = {
            method: method || "GET",
            headers: headers || {}
        };
        
        if (payload && method === "POST") {
            fetchOptions.body = JSON.stringify(payload);
        }

        // --- XỬ LÝ PROXY NẾU CÓ ---
        if (proxyConfig && proxyConfig.trim() !== '') {
            // Cắt chuỗi theo định dạng ip:port:user:pass
            const parts = proxyConfig.trim().split(':');
            if (parts.length === 4) {
                const [host, port, user, pass] = parts;
                // Tạo URL proxy có chứa xác thực
                const proxyUrl = `http://${user}:${pass}@${host}:${port}`;
                // Gắn Agent vào Fetch
                fetchOptions.agent = new HttpsProxyAgent(proxyUrl);
            } else if (parts.length === 2) {
                 // Dành cho proxy không có pass: ip:port
                 const [host, port] = parts;
                 const proxyUrl = `http://${host}:${port}`;
                 fetchOptions.agent = new HttpsProxyAgent(proxyUrl);
            }
        }
        // -------------------------

        // Gửi Request đi
        const response = await fetch(targetUrl, fetchOptions);
        const textData = await response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, text: textData })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
