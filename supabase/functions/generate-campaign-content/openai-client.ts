
// Helper function to make OpenAI requests with retry logic
export async function makeOpenAIRequest(url: string, body: any, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.status === 429 && i < retries) {
        // Rate limited - wait longer and retry
        const waitTime = Math.pow(2, i) * 2000; // Increased wait time: 2s, 4s, 8s
        console.log(`Rate limited, waiting ${waitTime}ms before retry ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      return response;
    } catch (error) {
      if (i === retries) throw error;
      console.log(`Request failed, retrying... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Increased retry delay
    }
  }
}
