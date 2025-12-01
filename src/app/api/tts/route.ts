import { NextRequest, NextResponse } from 'next/server';

// Voice ID do ElevenLabs fornecido pelo usuário
const ELEVENLABS_VOICE_ID = 'aTTiK3YzK3dXETpuDE2h';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Texto é obrigatório' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API do ElevenLabs não configurada' }, { status: 500 });
    }

    // Limpar o texto de markdown e emojis para melhor pronúncia
    const cleanText = text
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '')   // Remove italic markdown
      .replace(/`/g, '')    // Remove code markdown
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\[ACTION\][\s\S]*?\[\/ACTION\]/g, '') // Remove action blocks
      .trim();

    if (!cleanText) {
      return NextResponse.json({ error: 'Texto vazio após limpeza' }, { status: 400 });
    }

    // Chamar a API do ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_multilingual_v2', // Melhor para português
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TTS] Erro ElevenLabs:', errorText);
      
      if (response.status === 401) {
        return NextResponse.json({ error: 'API key do ElevenLabs inválida' }, { status: 401 });
      }
      if (response.status === 429) {
        return NextResponse.json({ error: 'Limite de uso do ElevenLabs atingido' }, { status: 429 });
      }
      
      return NextResponse.json({ error: 'Erro ao gerar áudio' }, { status: 500 });
    }

    // Retornar o áudio como stream
    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error: any) {
    console.error('[TTS] Erro:', error);
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}

