// app/api/process-dual-images/route.js
import { NextResponse } from "next/server";

// Environment variables required for this API route
const REQUIRED_ENV_VARS = [
  "AZURE_OPENAI_API_KEY",
  "AZURE_OPENAI_DEPLOYMENT",
  "NEXT_PUBLIC_AZURE_ENDPOINT",
];

// Maximum file size (10MB in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Helper function to check for missing environment variables
function checkEnvironmentVariables() {
  const missingVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
  if (missingVars.length > 0) {
    console.error(`Missing environment variables: ${missingVars.join(", ")}`);
    return {
      isValid: false,
      errorResponse: NextResponse.json(
        {
          error: `Server configuration error: Missing environment variables: ${missingVars.join(
            ", "
          )}.`,
        },
        { status: 500 }
      ),
    };
  }
  return { isValid: true };
}

// Helper function to validate uploaded files
function validateFiles(image1, image2) {
  const errors = [];

  if (!image1 || !image2) {
    errors.push("Exactly 2 images are required");
    return { isValid: false, errors };
  }

  const files = [
    { file: image1, name: "image1" },
    { file: image2, name: "image2" }
  ];

  for (const { file, name } of files) {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${name} exceeds maximum file size of 10MB`);
    }

    // Check file type
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      errors.push(`${name} must be a JPEG, PNG, or GIF image`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to convert file to base64
async function fileToBase64(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString('base64');
}

// Helper function to get image dimensions and validate
async function validateAndProcessImage(file, imageName) {
  try {
    const base64 = await fileToBase64(file);
    const dataUrl = `data:${file.type};base64,${base64}`;
    
    return {
      name: imageName,
      type: file.type,
      size: file.size,
      base64,
      dataUrl
    };
  } catch (error) {
    throw new Error(`Failed to process ${imageName}: ${error.message}`);
  }
}

// Main function to process dual images with Azure OpenAI
async function processDualImagesWithAzure(image1Data, image2Data, prompt, style) {
  const azureApiUrl = `${process.env.NEXT_PUBLIC_AZURE_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-01`;

  // Construct the detailed prompt for dual image processing
  const systemPrompt = `You are an expert AI image processor. You will receive two images and a transformation prompt. 
  Your task is to analyze both images and provide detailed instructions for how they should be transformed or combined 
  based on the user's request and the specified style: ${style}.`;

  const userPrompt = `Please analyze these two images and describe how to transform them according to this request: "${prompt}"
  
  Style to apply: ${style}
  
  Provide a detailed description of the transformation process, including:
  1. What elements from each image should be preserved or modified
  2. How the images should be combined or blended
  3. What style effects should be applied
  4. The final composition and aesthetic goals`;

  try {
    const response = await fetch(azureApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_OPENAI_API_KEY,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: {
                  url: image1Data.dataUrl,
                  detail: "high"
                }
              },
              {
                type: "image_url",
                image_url: {
                  url: image2Data.dataUrl,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(`Azure API error: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.error?.message || "Failed to process images with Azure API");
    }

    const responseData = await response.json();
    return responseData.choices[0]?.message?.content || "Processing completed";

  } catch (error) {
    console.error("Azure API processing error:", error);
    throw error;
  }
}

export async function POST(request) {
  const envCheck = checkEnvironmentVariables();
  if (!envCheck.isValid) {
    return envCheck.errorResponse;
  }

  let formData;
  try {
    formData = await request.formData();
  } catch (e) {
    console.error("Invalid form data:", e);
    return NextResponse.json(
      { error: "Invalid request body: Expected form data with images." },
      { status: 400 }
    );
  }

  // Extract form data
  const image1 = formData.get('image1');
  const image2 = formData.get('image2');
  const prompt = formData.get('prompt');
  const style = formData.get('style');

  // Validate required fields
  if (!prompt || !style) {
    return NextResponse.json(
      { error: "Prompt and style are required." },
      { status: 400 }
    );
  }

  // Validate files
  const fileValidation = validateFiles(image1, image2);
  if (!fileValidation.isValid) {
    return NextResponse.json(
      { error: fileValidation.errors.join("; ") },
      { status: 400 }
    );
  }

  try {
    // Process both images
    const [image1Data, image2Data] = await Promise.all([
      validateAndProcessImage(image1, "image1"),
      validateAndProcessImage(image2, "image2")
    ]);

    console.log(`Processing dual images: ${image1Data.name} (${image1Data.size} bytes), ${image2Data.name} (${image2Data.size} bytes)`);
    console.log(`Prompt: ${prompt}`);
    console.log(`Style: ${style}`);

    // Process images with Azure OpenAI Vision
    const processingResult = await processDualImagesWithAzure(
      image1Data, 
      image2Data, 
      prompt, 
      style
    );

    // For now, return the original images as processed images
    // In a real implementation, you would use the processing result to generate new images
    // This could involve calling DALL-E with the analysis, or using other image processing services
    const processedImages = [
      image1Data.dataUrl, // Placeholder - would be actual processed image
      image2Data.dataUrl  // Placeholder - would be actual processed image
    ];

    return NextResponse.json({
      success: true,
      processedImages,
      analysis: processingResult,
      metadata: {
        originalImages: [
          {
            name: image1Data.name,
            size: image1Data.size,
            type: image1Data.type
          },
          {
            name: image2Data.name,
            size: image2Data.size,
            type: image2Data.type
          }
        ],
        prompt,
        style,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error during dual image processing:", error);
    
    if (error.message.includes("file size") || error.message.includes("image format")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    if (error.message.includes("Azure API")) {
      return NextResponse.json(
        { error: "Image processing service temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || "An internal server error occurred while processing images.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      error: "Method Not Allowed. Please use POST.",
      endpoint: "/api/process-dual-images",
      description: "This endpoint processes two images with AI transformation prompts.",
      requiredFields: {
        image1: "File - First image to process",
        image2: "File - Second image to process", 
        prompt: "String - Description of the transformation",
        style: "String - Style to apply to the images"
      }
    },
    { status: 405 }
  );
}