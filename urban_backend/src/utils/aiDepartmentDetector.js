const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const detectDepartment = async (title, description) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
    You are a smart city complaint classifier.
    
    Analyze this complaint and return ONLY ONE WORD from this list:
    water, electricity, garbage, roads, health, streetlight, drainage, other
    
    Complaint Title: ${title}
    Complaint Description: ${description}
    
    Rules:
    - If complaint is about water supply, pipeline, tank = water
    - If complaint is about power cut, electric pole, wiring = electricity
    - If complaint is about garbage, dustbin, cleaning = garbage
    - If complaint is about road damage, pothole = roads
    - If complaint is about hospital, medicine, disease = health
    - If complaint is about street light not working = streetlight
    - If complaint is about drain blocked, sewage = drainage
    - If none match = other
    
    Return ONLY the department name in lowercase. No explanation.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let dept = response.text().trim().toLowerCase();
    
    // Clean the response
    dept = dept.replace(/[^a-z]/g, '');

    const validDepts = ['water', 'electricity', 'garbage', 'roads', 'health', 'streetlight', 'drainage', 'other'];
    
    if (validDepts.includes(dept)) {
      console.log(`✅ AI Detected Department: ${dept}`);
      return dept;
    } else {
      console.log(`⚠️ AI returned invalid: ${dept}, using 'other'`);
      return 'other';
    }
    
  } catch (error) {
    console.log("❌ AI Department Detection Failed:", error.message);
    return 'other';
  }
};

module.exports = { detectDepartment };