import { NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

const API_BASE_URL = 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const { bucketName, questions } = await request.json();
    
    // Create a temporary JSON file content
    const jsonContent = JSON.stringify(questions, null, 2);
    
    // Create form data
    const form = new FormData();
    form.append('file', Buffer.from(jsonContent), {
      filename: 'questions.json',
      contentType: 'application/json',
    });

    // Upload to Akave Link
    const response = await axios.post(
      `${API_BASE_URL}/buckets/${bucketName}/files`,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
      }
    );

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
