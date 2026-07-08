exports.handler = async function (event) {

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const params = new URLSearchParams(event.body);
    const email = params.get('email');
    const phone = params.get('phone');
    const recaptchaToken = params.get('recaptchaToken');

    // Basic validation before even hitting Google
    if (!email || !recaptchaToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ result: 'error', message: 'Missing required fields.' })
      };
    }

    // Forward to Google Apps Script
    // URL comes from environment variable — never exposed to the browser
    const scriptURL = process.env.GOOGLE_SCRIPT_URL;

    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('phone', phone || '');
    formData.append('recaptchaToken', recaptchaToken);

    const response = await fetch(scriptURL, {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const text = await response.text();

    // Try to parse Google's response and pass it through
    try {
      const data = JSON.parse(text);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
    } catch {
      // Google returned something unexpected
      return {
        statusCode: 502,
        body: JSON.stringify({ result: 'error', message: 'Unexpected response from backend.' })
      };
    }

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ result: 'error', message: 'Internal server error.' })
    };
  }
};