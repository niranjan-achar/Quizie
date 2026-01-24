# Prompt Engineering Guide

## Overview

This document explains the sophisticated prompt engineering strategy used to generate high-quality quiz questions from GROK LLM.

---

## Core Principles

1. **Specificity**: Clear, unambiguous instructions
2. **Structure**: Well-defined output format
3. **Quality Control**: Built-in validation criteria
4. **Context Richness**: Difficulty-appropriate guidance
5. **Error Prevention**: Explicit format requirements

---

## Prompt Structure

### 1. Role Definition

```
You are an expert examination question generator for competitive exams 
and professional certifications.
```

**Purpose**: Establishes the AI's persona and expected expertise level.

---

### 2. Task Specification

```
TASK: Generate exactly 20 high-quality, exam-grade multiple-choice 
questions on the topic: "JavaScript ES6 Features"
```

**Purpose**: 
- Defines exact quantity (prevents over/under-generation)
- Sets quality expectation ("exam-grade")
- Specifies topic clearly

---

### 3. Difficulty Instructions

Each difficulty level has tailored guidelines:

#### Easy
```
- Questions should test fundamental concepts and basic understanding
- Use straightforward language and common terminology
- Focus on recall and recognition
- Avoid complex scenarios or multi-step reasoning
- Suitable for beginners or introductory level
```

#### Medium
```
- Questions should require understanding and application of concepts
- Include some scenario-based questions
- Test analytical thinking and problem-solving
- Mix conceptual and practical questions
- Suitable for intermediate learners
```

#### Difficult
```
- Questions should demand deep understanding and critical thinking
- Include complex scenarios requiring multi-step reasoning
- Test synthesis, evaluation, and advanced application
- Use professional/technical terminology
- Suitable for advanced learners or professionals
```

#### Extreme
```
- Questions should challenge expert-level knowledge
- Include edge cases, rare scenarios, and advanced theoretical concepts
- Require comprehensive understanding across multiple domains
- Test mastery, innovation, and expert judgment
- Suitable only for experts and specialists
```

---

### 4. Critical Requirements

```
CRITICAL REQUIREMENTS:
1. Generate EXACTLY 20 questions - no more, no less
2. Each question must have EXACTLY 4 options (A, B, C, D)
3. Each question must have EXACTLY ONE correct answer
4. Questions must be factually accurate and professionally written
5. Avoid ambiguous or trick questions
6. No duplicate or very similar questions
7. Options should be plausible and of similar length
8. Explanations must be clear, educational, and justify the correct answer
```

**Purpose**: Sets non-negotiable constraints that ensure quality and consistency.

---

### 5. Content Quality Standards

```
CONTENT QUALITY STANDARDS:
- Use proper grammar, punctuation, and formatting
- Questions should be clear and unambiguous
- Options should not overlap or be redundant
- Correct answers should be definitively correct
- Wrong options should be plausible but clearly incorrect
- Cover diverse aspects of the topic
- Progressive difficulty within the set
```

**Purpose**: Ensures professional-grade output.

---

### 6. Output Format Specification

```
OUTPUT FORMAT (CRITICAL - FOLLOW EXACTLY):
Return ONLY a valid JSON object with NO additional text, 
explanations, or markdown formatting.

Do NOT wrap the JSON in markdown code blocks (no ```json).
The JSON must be parseable directly.

Schema:
{
  "quizTitle": "string (auto-generate an engaging, descriptive title)",
  "topic": "JavaScript ES6 Features",
  "difficulty": "medium",
  "totalQuestions": 20,
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
      "explanation": "string (why this answer is correct)"
    }
  ]
}
```

**Purpose**:
- Eliminates ambiguity in response format
- Prevents markdown wrapping issues
- Ensures machine-parseable output

---

### 7. Validation Checklist

```
VALIDATION CHECKLIST BEFORE RESPONDING:
✓ Exactly 20 questions generated
✓ Each question has exactly 4 options
✓ Each question has exactly one correctAnswer
✓ All questionId values are sequential (1, 2, 3, ...)
✓ No missing fields in any question
✓ Output is pure JSON with no markdown or extra text
✓ JSON is valid and parseable
```

**Purpose**: Encourages self-verification before response generation.

---

## Sample Prompts

### Easy Difficulty - Python Basics (10 Questions)

```
You are an expert examination question generator for competitive exams and professional certifications.

TASK: Generate exactly 10 high-quality, exam-grade multiple-choice questions on the topic: "Python Basics"

DIFFICULTY LEVEL: EASY
- Questions should test fundamental concepts and basic understanding
- Use straightforward language and common terminology
- Focus on recall and recognition
- Avoid complex scenarios or multi-step reasoning
- Suitable for beginners or introductory level

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 10 questions - no more, no less
2. Each question must have EXACTLY 4 options (A, B, C, D)
3. Each question must have EXACTLY ONE correct answer
4. Questions must be factually accurate and professionally written
5. Avoid ambiguous or trick questions
6. No duplicate or very similar questions
7. Options should be plausible and of similar length
8. Explanations must be clear, educational, and justify the correct answer

OUTPUT FORMAT (CRITICAL - FOLLOW EXACTLY):
Return ONLY a valid JSON object with NO additional text.
Do NOT wrap the JSON in markdown code blocks.

{
  "quizTitle": "string",
  "topic": "Python Basics",
  "difficulty": "easy",
  "totalQuestions": 10,
  "questions": [...]
}

Generate the quiz now:
```

---

### Extreme Difficulty - Machine Learning (30 Questions)

```
You are an expert examination question generator for competitive exams and professional certifications.

TASK: Generate exactly 30 high-quality, exam-grade multiple-choice questions on the topic: "Advanced Machine Learning Algorithms"

DIFFICULTY LEVEL: EXTREME
- Questions should challenge expert-level knowledge
- Include edge cases, rare scenarios, and advanced theoretical concepts
- Require comprehensive understanding across multiple domains
- Test mastery, innovation, and expert judgment
- Suitable only for experts and specialists

ADDITIONAL CONTEXT/REQUIREMENTS:
Focus on:
- Backpropagation mathematics
- Optimization algorithms (Adam, RMSprop, etc.)
- Regularization techniques
- Hyperparameter tuning strategies
- Neural architecture design principles

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 30 questions - no more, no less
2. Each question must have EXACTLY 4 options (A, B, C, D)
3. Each question must have EXACTLY ONE correct answer
4. Questions must be factually accurate and professionally written
5. Include mathematical concepts and formulas where appropriate
6. Options should reflect expert-level distinctions
7. Explanations must include theoretical justifications

OUTPUT FORMAT (CRITICAL - FOLLOW EXACTLY):
Return ONLY a valid JSON object with NO additional text.
Do NOT wrap the JSON in markdown code blocks.

Generate the quiz now:
```

---

## Response Validation

### Client-Side Validation

```javascript
const validateGrokResponse = (response, expectedQuestions) => {
  const errors = [];
  
  // Check required fields
  if (!response.quizTitle) errors.push('Missing quizTitle');
  if (!response.questions) errors.push('Missing questions array');
  
  // Check question count
  if (response.questions.length !== expectedQuestions) {
    errors.push(`Expected ${expectedQuestions}, got ${response.questions.length}`);
  }
  
  // Validate each question
  response.questions.forEach((q, index) => {
    if (!q.questionText) errors.push(`Q${index + 1}: Missing questionText`);
    if (!q.options || !q.options.A || !q.options.B || !q.options.C || !q.options.D) {
      errors.push(`Q${index + 1}: Missing options`);
    }
    if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
      errors.push(`Q${index + 1}: Invalid correctAnswer`);
    }
    if (!q.explanation) errors.push(`Q${index + 1}: Missing explanation`);
  });
  
  return { isValid: errors.length === 0, errors };
};
```

---

## Error Handling

### Common Issues and Solutions

#### Issue 1: Markdown Wrapping
**Problem**: LLM wraps JSON in ```json``` blocks

**Solution**:
```javascript
const extractJSON = (text) => {
  // Remove markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  return JSON.parse(text);
};
```

---

#### Issue 2: Incorrect Question Count
**Problem**: LLM generates more/fewer questions than requested

**Solution**:
- Emphasized "EXACTLY X questions" in prompt
- Included validation checklist
- Server-side validation rejects mismatched counts

---

#### Issue 3: Invalid correctAnswer
**Problem**: LLM uses full option text instead of letter

**Solution**:
- Explicitly specify: "single letter only"
- Schema example shows: "A | B | C | D"
- Validation rejects non-letter values

---

## Retry Strategy

```javascript
async generateQuiz(params) {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const response = await this.callGrokAPI(prompt);
      const validated = this.validateResponse(response);
      
      if (validated.isValid) {
        return validated.data;
      }
      
      // Log validation errors for debugging
      console.error(`Validation failed: ${validated.errors}`);
      
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
    }
    
    attempt++;
    await this.sleep(attempt * 2000); // Exponential backoff
  }
  
  throw new Error('Failed after maximum retries');
}
```

---

## Best Practices

### 1. Temperature Setting
```javascript
{
  temperature: 0.7  // Balance between creativity and consistency
}
```

- **0.3-0.5**: More deterministic, less creative
- **0.7-0.8**: Balanced (recommended)
- **0.9-1.0**: More creative, less consistent

---

### 2. Max Tokens
```javascript
{
  max_tokens: 8000  // Sufficient for 100-question quizzes
}
```

**Calculation**:
- Average question: ~300 tokens
- 100 questions: ~30,000 tokens
- Safety margin: 8000 tokens handles up to 25 questions comfortably

---

### 3. System Message
```javascript
{
  role: "system",
  content: "You are an expert quiz generator. Always return valid JSON."
}
```

Sets consistent behavior across all requests.

---

## Performance Optimization

### 1. Caching
```javascript
// Cache frequently requested quiz types
const cacheKey = `${topic}_${difficulty}_${count}`;
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

---

### 2. Parallel Generation
```javascript
// For multiple quizzes
const promises = topics.map(topic => generateQuiz({ topic, ... }));
const results = await Promise.all(promises);
```

---

### 3. Streaming (Future Enhancement)
```javascript
// For real-time question delivery
const stream = await grokAPI.createStream(prompt);
for await (const chunk of stream) {
  // Process each question as it arrives
}
```

---

## Testing Prompts

### Unit Test Example

```javascript
describe('Prompt Engineering', () => {
  it('should generate correct number of questions', async () => {
    const result = await generateQuiz({
      topic: 'Testing',
      numberOfQuestions: 15,
      difficultyLevel: 'medium'
    });
    
    expect(result.questions).toHaveLength(15);
  });
  
  it('should include all required fields', async () => {
    const result = await generateQuiz({ /* ... */ });
    
    result.questions.forEach(q => {
      expect(q).toHaveProperty('questionId');
      expect(q).toHaveProperty('questionText');
      expect(q).toHaveProperty('options');
      expect(q).toHaveProperty('correctAnswer');
      expect(q).toHaveProperty('explanation');
    });
  });
});
```

---

## Conclusion

This prompt engineering approach ensures:
- ✅ Consistent, high-quality quiz generation
- ✅ Predictable JSON output format
- ✅ Difficulty-appropriate question complexity
- ✅ Comprehensive error handling
- ✅ Scalable and maintainable system

The combination of clear instructions, structured output requirements, and robust validation creates a reliable AI-powered quiz generation system.
