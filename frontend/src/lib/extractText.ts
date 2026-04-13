

export const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]

const MAX_SIZE_MB = 10

export function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only PDF and image files (JPEG, PNG, WebP) are supported.'
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `File must be under ${MAX_SIZE_MB}MB.`
  }
  return null
}



export async function extractPdfText(file: File): Promise<string> {

  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()

    text += content.items.map((item: any) => item.str as string).join(' ') + '\n'
  }

  return text.trim()
}



const CLAUDE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export async function extractImageText(file: File, apiKey: string): Promise<string> {
  if (!CLAUDE_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      'HEIC/HEIF images aren\u2019t supported by the API. Take a screenshot and upload as PNG instead.',
    )
  }

  const base64 = await fileToBase64(file)
  const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.replace(/[^\x20-\x7E]/g, '')}`,
    },
    body: JSON.stringify({
      model: 'llama-3.2-90b-vision-preview',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mediaType};base64,${base64}` },
            },
            {
              type: 'text',
              text: 'Extract all assignment text from this image. Return only the raw text, no commentary.',
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(
      (err as { error?: { message?: string } })?.error?.message ?? `API error ${response.status}`,
    )
  }

  const data = await response.json()
  return (data.choices?.[0]?.message?.content as string | undefined) ?? ''
}
