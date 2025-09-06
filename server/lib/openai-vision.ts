import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Aurebesh character reference for the AI
const AUREBESH_CHARACTER_GUIDE = `
AUREBESH CHARACTER MAPPING REFERENCE:
Aurebesh is the written script of the Star Wars universe. Each character maps to an English letter:

A = Aurek (looks like a triangle with a line through it)
B = Besh (looks like a curved line with a hook)
C = Cresh (looks like a crescent moon)
D = Dorn (looks like a backwards C)
E = Esk (looks like three horizontal lines)
F = Fern (looks like a pitchfork)
G = Grek (looks like an oval with a line)
H = Herf (looks like two vertical lines connected)
I = Isk (looks like a single vertical line)
J = Jenth (looks like a hook or J shape)
K = Krill (looks like an angular K)
L = Leth (looks like an L)
M = Mern (looks like an M or double peak)
N = Nern (looks like a zigzag)
O = Osk (looks like a circle or oval)
P = Peth (looks like a P)
Q = Qek (looks like an O with a tail)
R = Resh (looks like an R)
S = Senth (looks like an S curve)
T = Trill (looks like a T)
U = Usk (looks like a U)
V = Vev (looks like a V)
W = Wesk (looks like a W)
X = Xesh (looks like an X)
Y = Yirt (looks like a Y)
Z = Zerek (looks like a Z)

COMMON LIGATURES (two-letter combinations):
CH, SH, TH, AE, EO, KH, OO, NG

RECOGNITION TIPS:
- Aurebesh text is usually written horizontally, left to right
- Characters are distinct angular symbols, not rounded like English
- Look for consistent character heights and spacing
- Context helps - Star Wars words like "JEDI", "SITH", "FORCE" are common
`;

export interface OCRResult {
  text: string;
  confidence: number;
  translation?: string;
}

export async function analyzeAurebeshImage(base64Image: string, mimeType: string): Promise<OCRResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system", 
          content: `You are analyzing images that may contain Aurebesh text (the fictional script from Star Wars). 

TASK: Look at the image and describe any symbols, characters, or text-like elements you can see. Then try to identify them as Aurebesh characters if possible.

Aurebesh characters are angular, geometric symbols that represent English letters A-Z. They look like futuristic or alien writing - not curved like normal letters, but made of straight lines and geometric shapes.

APPROACH:
1. First, describe what visual elements you can see in the image
2. Look for any text-like symbols or characters
3. If you see geometric/angular symbols that could be Aurebesh, try to match them to English letters
4. Be honest about what you can and cannot identify clearly

Respond with JSON in this format:
{
  "text": "any English letters you identified",
  "confidence": 50,
  "details": "describe what symbols/text you see in the image and your analysis"
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this image and transcribe any Aurebesh text you can see into English letters. Be precise and only transcribe what you can clearly identify."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_completion_tokens: 500,
      response_format: { type: "json_object" }
    });

    const rawResponse = response.choices[0].message.content || '{"text":"","confidence":0}';
    console.log('AI Raw Response:', rawResponse);
    
    const result = JSON.parse(rawResponse);
    console.log('Parsed result:', result);
    
    return {
      text: result.text || '',
      confidence: Math.max(0, Math.min(100, result.confidence || 0)),
      translation: result.text || ''
    };

  } catch (error) {
    console.error('OpenAI Vision API error:', error);
    throw new Error(`AI vision analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}