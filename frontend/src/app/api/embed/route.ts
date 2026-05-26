import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
    }

    // Quy tắc định dạng chuỗi truy vấn bắt buộc của Nomic Embed v1.5
    const formattedInput = `search_query: ${text}`;

    // Gọi trực tiếp đến Local API Server của LM Studio đang mở ở cổng 1234
    const lmStudioResponse = await fetch("http://localhost:1234/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "text-embedding-nomic-embed-text-v1.5",
        input: formattedInput,
      }),
    });

    if (!lmStudioResponse.ok) {
      const errorText = await lmStudioResponse.text();
      throw new Error(`LM Studio API Error: ${errorText}`);
    }

    const result = await lmStudioResponse.json();

    // Trích xuất mảng số thực chứa đúng 768 phần tử từ cấu trúc JSON của LM Studio
    const embedding = result.data[0].embedding;

    return NextResponse.json({ embedding });
  } catch (error: any) {
    console.error("Embedding generation error:", error);
    return NextResponse.json(
      { error: error.message || 'Error generating embedding' },
      { status: 500 }
    );
  }
}