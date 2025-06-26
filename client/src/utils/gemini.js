import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyDmBfXE_omi8F8u3vBCd00S_35cH68_IEg",
});

const summarizeByAi = async (data) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Can you summarize the following chat messages in Indonesian? \n\n${data}`,
  });

  console.log(response.text);

  return response.text;
};

export default summarizeByAi;
