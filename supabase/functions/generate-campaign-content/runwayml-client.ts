
// RunwayML API client for image and video generation
export async function generateRunwayMLImage(prompt: string, retries = 2) {
  const runwayApiKey = Deno.env.get('RUNWAYML_API_KEY');
  if (!runwayApiKey) {
    throw new Error('RunwayML API key not configured');
  }

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch('https://api.runwayml.com/v1/image_generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${runwayApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gen3a_turbo',
          prompt: prompt,
          width: 1024,
          height: 1024,
          num_outputs: 1
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
        throw new Error(`RunwayML API error: ${response.status}`);
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
      const response = await fetch('https://api.runwayml.com/v1/video_generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${runwayApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gen3a_turbo',
          prompt: prompt,
          duration: 15, // Maximum 15 seconds as requested
          aspect_ratio: '16:9',
          resolution: '1280x720'
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
        throw new Error(`RunwayML API error: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (i === retries) throw error;
      console.log(`RunwayML video request failed, retrying... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}
