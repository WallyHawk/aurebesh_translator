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
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: `You are analyzing images for text recognition. Your job is to find and transcribe ANY text-like symbols, characters, or writing you can see in the image.

IMPORTANT: Look for COMPLETE WORDS and PHRASES, not just single characters. Many images contain multiple characters forming words.

What to look for:
- Any symbols that look like writing or text
- Sequences of characters that form words
- Geometric, angular, or unusual letter-like symbols
- Foreign scripts, fictional alphabets, or stylized text
- Even unclear or partially visible text

APPROACH:
1. Scan the entire image carefully
2. Describe what you see - any text-like elements at all
3. If you see symbols that could be letters, try to identify them
4. Look for patterns that suggest words or phrases
5. Even if you're not sure, include your best guess

Be generous in what you consider "text" - include anything that looks remotely like writing.

Respond with JSON in this format:
{
  "text": "any text or letters you can identify (even partial)",
  "confidence": 30,
  "details": "describe everything you see that could be text or symbols"
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