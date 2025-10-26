import express from 'express';

const router = express.Router();

/**
 * Get Google Maps API key
 * Returns API key for frontend use
 *
 * Security: This is acceptable because:
 * 1. Google Maps API keys should have restrictions (HTTP referrers, IP addresses)
 * 2. Key should have usage quotas set
 * 3. Better than hardcoding in frontend bundle
 *
 * TODO: For better security, implement token-based access or server-side proxy
 */
router.get('/token', (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Google Maps API key not configured'
    });
  }

  res.json({
    apiKey,
    // Send restrictions info for client to validate
    restrictions: {
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || []
    }
  });
});

/**
 * Proxy endpoint for Google Places Autocomplete
 * More secure alternative - all requests go through backend
 */
router.post('/places/autocomplete', async (req, res) => {
  try {
    const { input, sessionToken } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input is required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&sessiontoken=${sessionToken || ''}&components=country:br`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error('Google Places API error:', error);
    res.status(500).json({ error: 'Failed to fetch autocomplete results' });
  }
});

/**
 * Proxy endpoint for Place Details
 */
router.post('/places/details', async (req, res) => {
  try {
    const { placeId, sessionToken } = req.body;

    if (!placeId) {
      return res.status(400).json({ error: 'Place ID is required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&sessiontoken=${sessionToken || ''}&fields=formatted_address,address_components,geometry`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error('Google Places Details API error:', error);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
});

export default router;
