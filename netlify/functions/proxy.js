exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Chỉ nhận POST" };

    try {
        const parsed = JSON.parse(event.body || '{}');
        const { targetUrl, method, headers, payload } = parsed;

        const fetchOptions = {
            method: method || "GET",
            headers: headers || {}
        };

        if (method === "POST") {
            fetchOptions.body = JSON.stringify(payload ?? {});
            if (!fetchOptions.headers["content-type"] && !fetchOptions.headers["Content-Type"]) {
                fetchOptions.headers["content-type"] = "application/json";
            }
        }

        const response = await fetch(targetUrl, fetchOptions);
        const textData = await response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: response.ok,
                status: response.status,
                text: textData
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
