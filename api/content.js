export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const { get } = await import('@vercel/blob');
      try {
        const blob = await get('content.json');
        const response = await fetch(blob.url);
        const data = await response.json();
        return res.json(data);
      } catch {
        return res.json({});
      }
    } catch {
      return res.json({});
    }
  }

  if (req.method === 'POST') {
    try {
      const { logo, name, url, header1, header2, members, benefits, btnText, subText, testimonial, footer } = req.body;

      let logoUrl = logo && logo.startsWith('data:') ? '' : (logo || '');

      if (logo && logo.startsWith('data:image')) {
        const { put } = await import('@vercel/blob');
        const ext = logo.split(';')[0].split('/')[1] || 'png';
        const filename = `logo-${Date.now()}.${ext}`;
        const base64Data = logo.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const blob = await put(filename, buffer, {
          access: 'public',
          addRandomSuffix: true,
        });
        logoUrl = blob.url;
      }

      const content = { logo: logoUrl, name, url, header1, header2, members, benefits, btnText, subText, testimonial, footer };

      // Save to Vercel Blob
      const { put } = await import('@vercel/blob');
      await put('content.json', JSON.stringify(content), {
        access: 'public',
        contentType: 'application/json',
      });

      return res.json({ success: true, data: content });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
