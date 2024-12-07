import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST() {
  console.log('Creating room');
  console.log(process.env.HUDDLE01_API_KEY);
  try {
    const { data } = await axios.post(
      'https://api.huddle01.com/api/v1/create-room',
      {
        title: 'Verification Call',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.HUDDLE01_API_KEY as string,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}