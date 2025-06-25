const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

const summarizeByAi = async (data) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Can you summarize the following chat messages in Indonesian? \n\n${data}`,
  });

  // console.log(response.text);

  return response.text;
};

module.exports = summarizeByAi;
