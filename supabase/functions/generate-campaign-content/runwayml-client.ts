
// RunwayML API client for image and video generation
export async function generateRunwayMLImage(prompt: string, retries = 2) {
  const runwayApiKey = Deno.env.get('RUNWAYML_API_KEY');
  if (!runwayApiKey) {
    throw new Error('RunwayML API key not configured');
  }

  for (let i = 0; i <= retries; i++) {
    try {
      // Updated to use the correct RunwayML API endpoint and structure
      const response = await fetch('https://api.runwayml.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${runwayApiKey}`,
          'Content-Type': 'application/json',
          'X-Runway-Version': '2024-09-13', // Add API version header
        },
        body: JSON.stringify({
          prompt: prompt,
          width: 1024,
          height: 1024,
          seed: Math.floor(Math.random() * 1000000),
          image_format: 'JPEG'
        }),
      });

      if (response.status === 429 && i < retries) {
        const waitTime = Math.pow(2, i) * 3000;
        console.log(`RunwayML rate limited, waiting ${waitTime}ms before retry ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('RunwayML image error:', errorText);
        throw new Error(`RunwayML API error: ${response.status} - ${errorText}`);
      }

      return response;
    } catch (error) {
      if (i === retries) throw error;
      console.log(`RunwayML image request failed, retrying... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

export async function generateRunwayMLVideo(prompt: string, retries = 2) {
  const runwayApiKey = Deno.env.get('RUNWAYML_API_KEY');
  if (!runwayApiKey) {
    throw new Error('RunwayML API key not configured');
  }

  for (let i = 0; i <= retries; i++) {
    try {
      // Updated to use the correct RunwayML video API endpoint
      const response = await fetch('https://api.runwayml.com/v1/video/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${runwayApiKey}`,
          'Content-Type': 'application/json',
          'X-Runway-Version': '2024-09-13', // Add API version header
        },
        body: JSON.stringify({
          prompt: prompt,
          duration: 5, // Reduced to 5 seconds as requested
          ratio: '16:9',
          seed: Math.floor(Math.random() * 1000000)
        }),
      });

      if (response.status === 429 && i < retries) {
        const waitTime = Math.pow(2, i) * 3000;
        console.log(`RunwayML video rate limited, waiting ${waitTime}ms before retry ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('RunwayML video error:', errorText);
        throw new Error(`RunwayML API error: ${response.status} - ${errorText}`);
      }

      return response;
    } catch (error) {
      if (i === retries) throw error;
      console.log(`RunwayML video request failed, retrying... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}
