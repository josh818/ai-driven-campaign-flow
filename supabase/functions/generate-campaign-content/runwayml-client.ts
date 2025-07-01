
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
          model: 'runway-ml/stable-diffusion-v1-5',
          prompt: prompt,
          width: 1024,
          height: 1024,
          num_inference_steps: 25,
          guidance_scale: 7.5
        }),
      });

      if (response.status === 429 && i < retries) {
        const waitTime = Math.pow(2, i) * 2000;
        console.log(`RunwayML rate limited, waiting ${waitTime}ms before retry ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      return response;
    } catch (error) {
      if (i === retries) throw error;
      console.log(`RunwayML request failed, retrying... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
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
          duration: 15, // 15 seconds max
          aspect_ratio: '16:9',
          resolution: '1280x720'
        }),
      });

      if (response.status === 429 && i < retries) {
        const waitTime = Math.pow(2, i) * 2000;
        console.log(`RunwayML rate limited, waiting ${waitTime}ms before retry ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      return response;
    } catch (error) {
      if (i === retries) throw error;
      console.log(`RunwayML request failed, retrying... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}
