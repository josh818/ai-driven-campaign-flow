
// RunwayML API client for image and video generation with improved error handling
export async function generateRunwayMLImage(prompt: string, retries = 2) {
  const runwayApiKey = Deno.env.get('RUNWAYML_API_KEY');
  if (!runwayApiKey) {
    throw new Error('RunwayML API key not configured');
  }

  console.log('Starting RunwayML image generation with prompt:', prompt);

  for (let i = 0; i <= retries; i++) {
    try {
      // Use the correct RunwayML API endpoint for image generation
      const response = await fetch('https://api.runwayml.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${runwayApiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0',
        },
        body: JSON.stringify({
          prompt: prompt,
          width: 1024,
          height: 1024,
          guidance_scale: 7,
          num_inference_steps: 25,
          seed: Math.floor(Math.random() * 1000000),
        }),
      });

      console.log('RunwayML image response status:', response.status);

      if (response.status === 429 && i < retries) {
        const waitTime = Math.pow(2, i) * 3000;
        console.log(`RunwayML rate limited, waiting ${waitTime}ms before retry ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('RunwayML image error response:', errorText);
        throw new Error(`RunwayML API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('RunwayML image generation successful');
      return { ok: true, json: () => Promise.resolve(data) };
    } catch (error) {
      console.error(`RunwayML image request failed (attempt ${i + 1}):`, error);
      if (i === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

export async function generateRunwayMLVideo(prompt: string, retries = 2) {
  const runwayApiKey = Deno.env.get('RUNWAYML_API_KEY');
  if (!runwayApiKey) {
    throw new Error('RunwayML API key not configured');
  }

  console.log('Starting RunwayML video generation with prompt:', prompt);

  for (let i = 0; i <= retries; i++) {
    try {
      // Use the correct RunwayML API endpoint for video generation
      const response = await fetch('https://api.runwayml.com/v1/video/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${runwayApiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0',
        },
        body: JSON.stringify({
          prompt: prompt,
          duration: 5, // 5 seconds as requested
          aspect_ratio: '16:9',
          resolution: 'hd',
          seed: Math.floor(Math.random() * 1000000)
        }),
      });

      console.log('RunwayML video response status:', response.status);

      if (response.status === 429 && i < retries) {
        const waitTime = Math.pow(2, i) * 3000;
        console.log(`RunwayML video rate limited, waiting ${waitTime}ms before retry ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('RunwayML video error response:', errorText);
        throw new Error(`RunwayML API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('RunwayML video generation successful');
      return { ok: true, json: () => Promise.resolve(data) };
    } catch (error) {
      console.error(`RunwayML video request failed (attempt ${i + 1}):`, error);
      if (i === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}
