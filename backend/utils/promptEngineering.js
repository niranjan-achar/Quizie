/**
 * Advanced Prompt Engineering for GROK LLM
 * Generates high-quality, exam-grade quiz questions
 */

const generateQuizPrompt = (topic, difficulty, numberOfQuestions, additionalDescription = '') => {
  
  // Difficulty-specific instructions
  const difficultyInstructions = {
    easy: `
- Questions should test fundamental concepts and basic understanding
- Use straightforward language and common terminology
- Focus on recall and recognition
- Avoid complex scenarios or multi-step reasoning
- Suitable for beginners or introductory level`,
    
    medium: `
- Questions should require understanding and application of concepts
- Include some scenario-based questions
- Test analytical thinking and problem-solving
- Mix conceptual and practical questions
- Suitable for intermediate learners`,
    
    difficult: `
- Questions should demand deep understanding and critical thinking
- Include complex scenarios requiring multi-step reasoning
- Test synthesis, evaluation, and advanced application
- Use professional/technical terminology
- Suitable for advanced learners or professionals`,
    
    extreme: `
- Questions should challenge expert-level knowledge
- Include edge cases, rare scenarios, and advanced theoretical concepts
- Require comprehensive understanding across multiple domains
- Test mastery, innovation, and expert judgment
- Suitable only for experts and specialists`
  };

  const prompt = `You are an expert examination question generator for competitive exams and professional certifications.

TASK: Generate exactly ${numberOfQuestions} high-quality, exam-grade multiple-choice questions on the topic: "${topic}"

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
${difficultyInstructions[difficulty]}

CRITICAL REQUIREMENTS:
1. Generate EXACTLY ${numberOfQuestions} questions - no more, no less
2. Each question must have EXACTLY 4 options (A, B, C, D)
3. Each question must have EXACTLY ONE correct answer
4. Questions must be factually accurate and professionally written
5. Avoid ambiguous or trick questions
6. No duplicate or very similar questions
7. Options should be plausible and of similar length
8. Explanations must be clear, educational, and justify the correct answer

CONTENT QUALITY STANDARDS:
- Use proper grammar, punctuation, and formatting
- Questions should be clear and unambiguous
- Options should not overlap or be redundant
- Correct answers should be definitively correct
- Wrong options should be plausible but clearly incorrect
- Cover diverse aspects of the topic
- Progressive difficulty within the set

${additionalDescription ? `ADDITIONAL CONTEXT/REQUIREMENTS:\n${additionalDescription}\n` : ''}

OUTPUT FORMAT (CRITICAL - FOLLOW EXACTLY):
Return ONLY a valid JSON object with NO additional text, explanations, or markdown formatting.
Do NOT wrap the JSON in markdown code blocks (no \`\`\`json).
The JSON must be parseable directly.

Schema:
{
  "quizTitle": "string (auto-generate an engaging, descriptive title)",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "totalQuestions": ${numberOfQuestions},
  "questions": [
    {
      "questionId": 1,
      "questionText": "string (the question)",
      "options": {
        "A": "string (option A)",
        "B": "string (option B)",
        "C": "string (option C)",
        "D": "string (option D)"
      },
      "correctAnswer": "A | B | C | D (single letter only)",
      "explanation": "string (why this answer is correct and others are wrong)"
    }
    // ... continue for all ${numberOfQuestions} questions
  ]
}

VALIDATION CHECKLIST BEFORE RESPONDING:
✓ Exactly ${numberOfQuestions} questions generated
✓ Each question has exactly 4 options
✓ Each question has exactly one correctAnswer
✓ All questionId values are sequential (1, 2, 3, ...)
✓ No missing fields in any question
✓ Output is pure JSON with no markdown or extra text
✓ JSON is valid and parseable

Generate the quiz now:`;

  return prompt;
};

/**
 * Validates GROK API response format
 */
const validateGrokResponse = (response, expectedQuestions) => {
  const errors = [];

  // Check required top-level fields
  if (!response.quizTitle) errors.push('Missing quizTitle');
  if (!response.topic) errors.push('Missing topic');
  if (!response.difficulty) errors.push('Missing difficulty');
  if (!response.totalQuestions) errors.push('Missing totalQuestions');
  if (!response.questions) errors.push('Missing questions array');

  // Check questions array
  if (response.questions) {
    if (!Array.isArray(response.questions)) {
      errors.push('questions is not an array');
    } else {
      // Check question count
      if (response.questions.length !== expectedQuestions) {
        errors.push(`Expected ${expectedQuestions} questions, got ${response.questions.length}`);
      }

      // Validate each question
      response.questions.forEach((question, index) => {
        const qNum = index + 1;

        if (!question.questionId) errors.push(`Q${qNum}: Missing questionId`);
        if (!question.questionText) errors.push(`Q${qNum}: Missing questionText`);
        if (!question.options) errors.push(`Q${qNum}: Missing options`);
        if (!question.correctAnswer) errors.push(`Q${qNum}: Missing correctAnswer`);
        if (!question.explanation) errors.push(`Q${qNum}: Missing explanation`);

        // Check options structure
        if (question.options) {
          const requiredOptions = ['A', 'B', 'C', 'D'];
          requiredOptions.forEach(opt => {
            if (!question.options[opt]) {
              errors.push(`Q${qNum}: Missing option ${opt}`);
            }
          });
        }

        // Check correctAnswer is valid
        if (question.correctAnswer && !['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
          errors.push(`Q${qNum}: correctAnswer must be A, B, C, or D`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Extracts JSON from GROK response (handles cases where LLM includes extra text)
 */
const extractJSON = (text) => {
  // Try to parse directly first
  try {
    return JSON.parse(text);
  } catch (e) {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // Try to find JSON object in text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    throw new Error('Could not extract valid JSON from response');
  }
};

module.exports = {
  generateQuizPrompt,
  validateGrokResponse,
  extractJSON
};
