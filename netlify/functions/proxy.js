exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Chỉ nhận POST" };

    try {
        // Nhận yêu cầu từ giao diện web
        const { targetUrl, method, headers, payload } = JSON.parse(event.body);

        const fetchOptions = {
            method: method || "GET",
            headers: headers || {}
        };
        
        if (payload && method === "POST") {
            fetchOptions.body = JSON.stringify(payload);
        }

        // Netlify thay mặt bạn gửi request đến trang HH3D
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