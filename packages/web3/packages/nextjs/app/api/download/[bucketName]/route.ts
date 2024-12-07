import { NextResponse } from "next/server";
import axios from "axios";
import fs from "fs";
import path from "path";

const API_BASE_URL = "http://localhost:8000";

export async function GET(
  request: Request,
  { params }: { params: { bucketName: string } }
) {
  try {
    const bucketName = params.bucketName;
    const fileName = "questions.json";
    const outputDir = path.join(process.cwd(), "temp");

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Download the file
    const response = await axios.get(`${API_BASE_URL}/buckets/${bucketName}/files/${fileName}/download`, {
      responseType: 'blob',
    });

    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, response.data);

    // Read the JSON file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const jsonContent = JSON.parse(fileContent);

    // Clean up: delete the temporary file
    fs.unlinkSync(filePath);

    return NextResponse.json(jsonContent);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || 'Failed to download file' },
      { status: 500 }
    );
  }
}