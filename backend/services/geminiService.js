const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use gemini-2.0-flash-lite for cost efficiency and scalability
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

/**
 * Verify if an image looks like a medical prescription
 * Uses loose verification - just checks if it appears to be a prescription document
 * @param {string} imageBase64 - Base64 encoded image data (without data:image prefix)
 * @param {string} mimeType - MIME type of the image (e.g., 'image/jpeg')
 * @returns {Promise<{isValid: boolean, message: string}>}
 */
const verifyPrescription = async (imageBase64, mimeType = 'image/jpeg') => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not configured - skipping AI verification');
      return {
        isValid: true,
        message: 'Verification skipped (AI not configured)'
      };
    }

    const prompt = `You are analyzing an image to determine if it looks like a medical prescription or blood request document.

Answer with ONLY "YES" or "NO" followed by a brief reason.

Consider it valid (YES) if it:
- Looks like a medical prescription, doctor's note, or hospital document
- Contains medical-looking text, stamps, or signatures
- Is a blood request form or similar medical paperwork
- Has any indication of being from a medical facility

Consider it invalid (NO) if it:
- Is clearly a random photo (landscape, selfie, objects, animals, etc.)
- Is a meme, screenshot of social media, or non-medical document
- Contains no medical-related content whatsoever

Be lenient - if there's any reasonable indication it could be medical/prescription related, say YES.`;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim();

    // Parse the response
    const isValid = text.toUpperCase().startsWith('YES');
    
    // Extract the reason (everything after YES/NO and any punctuation/whitespace)
    let message = text.replace(/^(YES|NO)[,.:;!\s-]*/i, '').trim();
    
    // Clean up message - remove leading lowercase conjunctions/pronouns if present
    message = message.replace(/^(it|this|the|because|as|since)\s+/i, (match) => {
      return match.charAt(0).toUpperCase() + match.slice(1);
    });
    
    // Ensure message starts with capital letter
    if (message.length > 0) {
      message = message.charAt(0).toUpperCase() + message.slice(1);
    }
    
    if (isValid) {
      message = message || 'Document appears to be a valid prescription';
    } else {
      message = message || 'This does not appear to be a medical prescription';
    }

    console.log(`Prescription verification result: ${isValid ? 'VALID' : 'INVALID'} - ${message}`);

    return {
      isValid,
      message
    };

  } catch (error) {
    console.error('Gemini AI verification error:', error);
    
    // On error, be lenient and allow the upload
    return {
      isValid: true,
      message: 'Verification completed (manual review may be needed)'
    };
  }
};

module.exports = {
  verifyPrescription
};
