// Gemini API client for superior image and video generation
export async function generateGeminiImage(prompt: string, retries = 2) {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  console.log('Starting Gemini image generation with prompt:', prompt);

  for (let i = 0; i <= retries; i++) {
    try {
      // Use Gemini's latest API endpoint for image generation
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: {
            text: prompt
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ],
          generationConfig: {
            aspectRatio: "1:1",
            negativePrompt: "blurry, low quality, distorted, watermark, text overlay, duplicate, old video",
            seed: Math.floor(Math.random() * 1000000),
            guidanceScale: 7.0,
            outputMimeType: "image/png"
          }
        }),
      });

      console.log('Gemini image response status:', response.status);

      if (response.status === 429 && i < retries) {
        const waitTime = Math.pow(2, i) * 3000;
        console.log(`Gemini rate limited, waiting ${waitTime}ms before retry ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini image error response:', errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Gemini image generation successful');
      
      // Convert base64 to data URL if needed
      if (data.candidates && data.candidates[0] && data.candidates[0].image) {
        const imageData = data.candidates[0].image;
        const imageUrl = imageData.startsWith('data:') ? imageData : `data:image/png;base64,${imageData}`;
        return { ok: true, json: () => Promise.resolve({ url: imageUrl }) };
      }
      
      return { ok: true, json: () => Promise.resolve(data) };
    } catch (error) {
      console.error(`Gemini image request failed (attempt ${i + 1}):`, error);
      if (i === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

export async function generateGeminiVideo(prompt: string, retries = 2) {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  console.log('Starting Gemini video generation with prompt:', prompt);

  for (let i = 0; i <= retries; i++) {
    try {
      // Use Gemini's latest video API for 10-second video generation
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-001:generateVideo?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: {
            text: `${prompt} Duration: exactly 10 seconds or less. High quality commercial video, modern, professional.`
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ],
          generationConfig: {
            duration: "10s",
            aspectRatio: "16:9",
            resolution: "720p",
            frameRate: 24,
            seed: Math.floor(Math.random() * 1000000),
            negativePrompt: "shaky camera, poor lighting, low quality, watermark, long video, old footage",
            outputMimeType: "video/mp4"
          }
        }),
      });

      console.log('Gemini video response status:', response.status);

      if (response.status === 429 && i < retries) {
        const waitTime = Math.pow(2, i) * 3000;
        console.log(`Gemini video rate limited, waiting ${waitTime}ms before retry ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini video error response:', errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Gemini video generation successful');
      
      // Handle video response format
      if (data.candidates && data.candidates[0] && data.candidates[0].video) {
        const videoData = data.candidates[0].video;
        const videoUrl = videoData.startsWith('data:') ? videoData : `data:video/mp4;base64,${videoData}`;
        return { ok: true, json: () => Promise.resolve({ url: videoUrl }) };
      }
      
      return { ok: true, json: () => Promise.resolve(data) };
    } catch (error) {
      console.error(`Gemini video request failed (attempt ${i + 1}):`, error);
      if (i === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

// Alternative: Use OpenAI DALL-E for images as fallback
export async function generateOpenAIImage(prompt: string, retries = 2) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Starting OpenAI image generation with prompt:', prompt);

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: prompt,
          size: '1024x1024',
          quality: 'high',
          response_format: 'b64_json',
          n: 1
        }),
      });

      console.log('OpenAI image response status:', response.status);

      if (response.status === 429 && i < retries) {
        const waitTime = Math.pow(2, i) * 3000;
        console.log(`OpenAI rate limited, waiting ${waitTime}ms before retry ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI image error response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('OpenAI image generation successful');
      
      if (data.data && data.data[0] && data.data[0].b64_json) {
        const imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
        return { ok: true, json: () => Promise.resolve({ url: imageUrl }) };
      }
      
      return { ok: true, json: () => Promise.resolve(data) };
    } catch (error) {
      console.error(`OpenAI image request failed (attempt ${i + 1}):`, error);
      if (i === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}