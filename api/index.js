export default async function handler(req, res) {
  // Get client IP from Vercel headers
  const ip = req.headers['x-real-ip'] ||
             req.headers['x-forwarded-for']?.split(',')[0] ||
             req.connection?.remoteAddress ||
             'unknown';

  try {
    // Fetch geolocation data from ipapi.co (free, no API key needed)
    const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
    const geoData = await geoResponse.json();

    // Check if request is from curl or browser
    const userAgent = req.headers['user-agent'] || '';
    const acceptHeader = req.headers['accept'] || '';
    const isCurl = userAgent.toLowerCase().includes('curl') ||
                   !acceptHeader.includes('text/html');

    // Prepare response data
    const data = {
      ip: geoData.ip || ip,
      asn: geoData.asn || 'unknown',
      org: geoData.org || 'unknown',
      city: geoData.city || 'unknown',
      region: geoData.region || 'unknown',
      country: geoData.country_name || 'unknown',
      country_code: geoData.country_code || 'unknown',
      latitude: geoData.latitude || 'unknown',
      longitude: geoData.longitude || 'unknown',
      timezone: geoData.timezone || 'unknown'
    };

    if (isCurl) {
      // Plain text format for curl
      const plainText = `IP: ${data.ip}
ASN: ${data.asn}
Organization: ${data.org}
Location: ${data.city}, ${data.region}, ${data.country}
Coordinates: ${data.latitude}, ${data.longitude}
Timezone: ${data.timezone}
`;
      res.setHeader('Content-Type', 'text/plain');
      res.status(200).send(plainText);
    } else {
      // HTML format for browsers
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IP Information</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      margin-top: 0;
      color: #333;
    }
    .info-row {
      display: flex;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: 600;
      color: #666;
      width: 150px;
    }
    .value {
      color: #333;
      font-family: 'Courier New', monospace;
    }
    .footer {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #999;
      font-size: 14px;
    }
    code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Your IP Information</h1>
    <div class="info-row">
      <div class="label">IP Address:</div>
      <div class="value">${data.ip}</div>
    </div>
    <div class="info-row">
      <div class="label">ASN:</div>
      <div class="value">${data.asn}</div>
    </div>
    <div class="info-row">
      <div class="label">Organization:</div>
      <div class="value">${data.org}</div>
    </div>
    <div class="info-row">
      <div class="label">City:</div>
      <div class="value">${data.city}</div>
    </div>
    <div class="info-row">
      <div class="label">Region:</div>
      <div class="value">${data.region}</div>
    </div>
    <div class="info-row">
      <div class="label">Country:</div>
      <div class="value">${data.country} (${data.country_code})</div>
    </div>
    <div class="info-row">
      <div class="label">Coordinates:</div>
      <div class="value">${data.latitude}, ${data.longitude}</div>
    </div>
    <div class="info-row">
      <div class="label">Timezone:</div>
      <div class="value">${data.timezone}</div>
    </div>
    <div class="footer">
      Try with curl: <code>curl ${req.headers.host || 'this-url'}</code>
    </div>
  </div>
</body>
</html>`;
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
    }
  } catch (error) {
    // Error handling
    res.status(500).json({
      error: 'Failed to fetch IP information',
      ip: ip
    });
  }
}
