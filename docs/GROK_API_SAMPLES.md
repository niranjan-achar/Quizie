# GROK API - Sample Request & Response

This document provides real-world examples of GROK API interactions for quiz generation.

---

## Example 1: Medium Difficulty - JavaScript (20 Questions)

### Request to GROK API

**Endpoint:** `https://api.x.ai/v1/chat/completions`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_GROK_API_KEY",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "model": "grok-beta",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert quiz generator. You always return valid JSON with no additional text or markdown formatting."
    },
    {
      "role": "user",
      "content": "You are an expert examination question generator for competitive exams and professional certifications.\n\nTASK: Generate exactly 20 high-quality, exam-grade multiple-choice questions on the topic: \"JavaScript ES6 Features\"\n\nDIFFICULTY LEVEL: MEDIUM\n- Questions should require understanding and application of concepts\n- Include some scenario-based questions\n- Test analytical thinking and problem-solving\n- Mix conceptual and practical questions\n- Suitable for intermediate learners\n\nCRITICAL REQUIREMENTS:\n1. Generate EXACTLY 20 questions - no more, no less\n2. Each question must have EXACTLY 4 options (A, B, C, D)\n3. Each question must have EXACTLY ONE correct answer\n4. Questions must be factually accurate and professionally written\n5. Avoid ambiguous or trick questions\n6. No duplicate or very similar questions\n7. Options should be plausible and of similar length\n8. Explanations must be clear, educational, and justify the correct answer\n\nCONTENT QUALITY STANDARDS:\n- Use proper grammar, punctuation, and formatting\n- Questions should be clear and unambiguous\n- Options should not overlap or be redundant\n- Correct answers should be definitively correct\n- Wrong options should be plausible but clearly incorrect\n- Cover diverse aspects of the topic\n- Progressive difficulty within the set\n\nOUTPUT FORMAT (CRITICAL - FOLLOW EXACTLY):\nReturn ONLY a valid JSON object with NO additional text, explanations, or markdown formatting.\nDo NOT wrap the JSON in markdown code blocks (no ```json).\nThe JSON must be parseable directly.\n\nSchema:\n{\n  \"quizTitle\": \"string (auto-generate an engaging, descriptive title)\",\n  \"topic\": \"JavaScript ES6 Features\",\n  \"difficulty\": \"medium\",\n  \"totalQuestions\": 20,\n  \"questions\": [\n    {\n      \"questionId\": 1,\n      \"questionText\": \"string (the question)\",\n      \"options\": {\n        \"A\": \"string (option A)\",\n        \"B\": \"string (option B)\",\n        \"C\": \"string (option C)\",\n        \"D\": \"string (option D)\"\n      },\n      \"correctAnswer\": \"A | B | C | D (single letter only)\",\n      \"explanation\": \"string (why this answer is correct and others are wrong)\"\n    }\n  ]\n}\n\nVALIDATION CHECKLIST BEFORE RESPONDING:\n✓ Exactly 20 questions generated\n✓ Each question has exactly 4 options\n✓ Each question has exactly one correctAnswer\n✓ All questionId values are sequential (1, 2, 3, ...)\n✓ No missing fields in any question\n✓ Output is pure JSON with no markdown or extra text\n✓ JSON is valid and parseable\n\nGenerate the quiz now:"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 8000,
  "response_format": { "type": "json_object" }
}
```

---

### Sample GROK Response

**HTTP Status:** `200 OK`

**Response Body:**
```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1704627600,
  "model": "grok-beta",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "{\"quizTitle\":\"JavaScript ES6 Mastery Challenge\",\"topic\":\"JavaScript ES6 Features\",\"difficulty\":\"medium\",\"totalQuestions\":20,\"questions\":[{\"questionId\":1,\"questionText\":\"What is the primary advantage of arrow functions in JavaScript ES6?\",\"options\":{\"A\":\"They are always faster than regular functions\",\"B\":\"They provide lexical 'this' binding and shorter syntax\",\"C\":\"They can only be used as callbacks\",\"D\":\"They automatically return objects\"},\"correctAnswer\":\"B\",\"explanation\":\"Arrow functions provide two main advantages: a more concise syntax and lexical binding of 'this', meaning they inherit 'this' from the enclosing scope rather than having their own 'this' context.\"},{\"questionId\":2,\"questionText\":\"Which statement correctly uses template literals to display a variable?\",\"options\":{\"A\":\"console.log('Value: ' + value)\",\"B\":\"console.log(`Value: ${value}`)\",\"C\":\"console.log('Value: ${value}')\",\"D\":\"console.log(\\\"Value: $value\\\")\"},\"correctAnswer\":\"B\",\"explanation\":\"Template literals use backticks (`) and ${} syntax for variable interpolation. Option B correctly demonstrates this ES6 feature.\"},{\"questionId\":3,\"questionText\":\"What does the spread operator (...) do when used with arrays?\",\"options\":{\"A\":\"It filters array elements\",\"B\":\"It expands array elements into individual elements\",\"C\":\"It sorts the array\",\"D\":\"It removes duplicates\"},\"correctAnswer\":\"B\",\"explanation\":\"The spread operator (...) expands an array into individual elements, useful for copying arrays, combining arrays, or passing array elements as function arguments.\"},{\"questionId\":4,\"questionText\":\"How do you define a default parameter value in ES6?\",\"options\":{\"A\":\"function greet(name || 'Guest') {}\",\"B\":\"function greet(name = 'Guest') {}\",\"C\":\"function greet(name: 'Guest') {}\",\"D\":\"function greet(name default 'Guest') {}\"},\"correctAnswer\":\"B\",\"explanation\":\"ES6 allows default parameter values using the = operator directly in the function parameter definition. If no value is passed, the default is used.\"},{\"questionId\":5,\"questionText\":\"What is destructuring assignment in ES6?\",\"options\":{\"A\":\"A way to delete object properties\",\"B\":\"A syntax for extracting values from arrays or objects into variables\",\"C\":\"A method to merge objects\",\"D\":\"A way to encrypt data\"},\"correctAnswer\":\"B\",\"explanation\":\"Destructuring assignment allows unpacking values from arrays or properties from objects into distinct variables using a concise syntax.\"},{\"questionId\":6,\"questionText\":\"Which keyword is used to declare a block-scoped variable that cannot be reassigned?\",\"options\":{\"A\":\"var\",\"B\":\"let\",\"C\":\"const\",\"D\":\"static\"},\"correctAnswer\":\"C\",\"explanation\":\"'const' declares a block-scoped constant that cannot be reassigned. Note that for objects and arrays, the reference is constant but the contents can still be modified.\"},{\"questionId\":7,\"questionText\":\"What is the purpose of the Promise object in ES6?\",\"options\":{\"A\":\"To create loops\",\"B\":\"To handle asynchronous operations\",\"C\":\"To declare variables\",\"D\":\"To define classes\"},\"correctAnswer\":\"B\",\"explanation\":\"Promises represent the eventual completion or failure of an asynchronous operation, providing a cleaner way to handle async code compared to callbacks.\"},{\"questionId\":8,\"questionText\":\"How do you create a class in ES6?\",\"options\":{\"A\":\"function ClassName() {}\",\"B\":\"class ClassName {}\",\"C\":\"new Class ClassName {}\",\"D\":\"define class ClassName {}\"},\"correctAnswer\":\"B\",\"explanation\":\"ES6 introduced the 'class' keyword for creating classes with a more intuitive syntax, though classes are still prototype-based under the hood.\"},{\"questionId\":9,\"questionText\":\"What does the 'import' statement do in ES6?\",\"options\":{\"A\":\"It includes CSS files\",\"B\":\"It imports modules from other JavaScript files\",\"C\":\"It downloads external libraries\",\"D\":\"It compiles code\"},\"correctAnswer\":\"B\",\"explanation\":\"The 'import' statement is part of ES6 modules system, allowing you to import functions, objects, or primitives from other JavaScript files.\"},{\"questionId\":10,\"questionText\":\"Which method is used to iterate over an array in ES6?\",\"options\":{\"A\":\"for...of\",\"B\":\"for...in\",\"C\":\"forEach only\",\"D\":\"while\"},\"correctAnswer\":\"A\",\"explanation\":\"The for...of loop is specifically designed for iterating over iterable objects like arrays, providing a cleaner syntax than traditional for loops.\"},{\"questionId\":11,\"questionText\":\"What is the difference between 'let' and 'const'?\",\"options\":{\"A\":\"No difference\",\"B\":\"'let' can be reassigned, 'const' cannot\",\"C\":\"'const' is faster\",\"D\":\"'let' is deprecated\"},\"correctAnswer\":\"B\",\"explanation\":\"'let' allows reassignment of the variable, while 'const' creates a constant reference that cannot be reassigned (though object/array contents can change).\"},{\"questionId\":12,\"questionText\":\"What is a rest parameter in ES6?\",\"options\":{\"A\":\"A parameter that pauses execution\",\"B\":\"A syntax to represent an indefinite number of arguments as an array\",\"C\":\"A deprecated feature\",\"D\":\"A parameter with a default value\"},\"correctAnswer\":\"B\",\"explanation\":\"Rest parameters (...args) allow functions to accept an indefinite number of arguments as an array, replacing the need for the 'arguments' object.\"},{\"questionId\":13,\"questionText\":\"How do you define a method in an ES6 class?\",\"options\":{\"A\":\"methodName: function() {}\",\"B\":\"function methodName() {}\",\"C\":\"methodName() {}\",\"D\":\"def methodName() {}\"},\"correctAnswer\":\"C\",\"explanation\":\"In ES6 classes, methods are defined with concise method syntax: methodName() {} without the 'function' keyword.\"},{\"questionId\":14,\"questionText\":\"What does 'async/await' simplify in JavaScript?\",\"options\":{\"A\":\"Variable declarations\",\"B\":\"Working with Promises and asynchronous code\",\"C\":\"Loop iterations\",\"D\":\"Object creation\"},\"correctAnswer\":\"B\",\"explanation\":\"async/await is syntactic sugar over Promises, making asynchronous code look and behave more like synchronous code, improving readability.\"},{\"questionId\":15,\"questionText\":\"What is a Set in ES6?\",\"options\":{\"A\":\"A function to set variable values\",\"B\":\"A collection of unique values\",\"C\":\"A type of array\",\"D\":\"A class keyword\"},\"correctAnswer\":\"B\",\"explanation\":\"Set is a built-in object that stores unique values of any type, automatically removing duplicates.\"},{\"questionId\":16,\"questionText\":\"What is the purpose of the Map object in ES6?\",\"options\":{\"A\":\"To transform arrays\",\"B\":\"To store key-value pairs where keys can be any type\",\"C\":\"To create graphics\",\"D\":\"To define routes\"},\"correctAnswer\":\"B\",\"explanation\":\"Map is a collection that holds key-value pairs where keys can be any value (including objects), unlike regular objects where keys are strings/symbols.\"},{\"questionId\":17,\"questionText\":\"What does Object.assign() do?\",\"options\":{\"A\":\"Deletes object properties\",\"B\":\"Copies properties from source objects to a target object\",\"C\":\"Creates a new object\",\"D\":\"Validates object structure\"},\"correctAnswer\":\"B\",\"explanation\":\"Object.assign() copies all enumerable own properties from one or more source objects to a target object, useful for object cloning and merging.\"},{\"questionId\":18,\"questionText\":\"What is the 'super' keyword used for in ES6 classes?\",\"options\":{\"A\":\"To create global variables\",\"B\":\"To call parent class constructor and methods\",\"C\":\"To make methods private\",\"D\":\"To delete class properties\"},\"correctAnswer\":\"B\",\"explanation\":\"'super' is used to call the constructor of the parent class and access parent class methods, essential for inheritance in ES6 classes.\"},{\"questionId\":19,\"questionText\":\"What is a generator function in ES6?\",\"options\":{\"A\":\"A function that generates random numbers\",\"B\":\"A function that can pause and resume execution using yield\",\"C\":\"A function that creates other functions\",\"D\":\"A deprecated feature\"},\"correctAnswer\":\"B\",\"explanation\":\"Generator functions (function*) can pause execution with 'yield' and resume later, useful for creating iterators and managing async operations.\"},{\"questionId\":20,\"questionText\":\"What does the 'export' statement do in ES6 modules?\",\"options\":{\"A\":\"It saves files to disk\",\"B\":\"It makes functions/variables available for import in other files\",\"C\":\"It compresses code\",\"D\":\"It removes unused code\"},\"correctAnswer\":\"B\",\"explanation\":\"The 'export' statement makes functions, objects, or variables available for import in other JavaScript files, enabling modular code organization.\"}]}"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 892,
    "completion_tokens": 2145,
    "total_tokens": 3037
  }
}
```

---

## Example 2: Easy Difficulty - Python Basics (10 Questions)

### Request Body (Abbreviated)

```json
{
  "model": "grok-beta",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert quiz generator..."
    },
    {
      "role": "user",
      "content": "Generate exactly 10 high-quality questions on 'Python Basics' with EASY difficulty..."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 8000
}
```

### Sample Response (Truncated)

```json
{
  "choices": [
    {
      "message": {
        "content": "{\"quizTitle\":\"Python Fundamentals Quiz\",\"topic\":\"Python Basics\",\"difficulty\":\"easy\",\"totalQuestions\":10,\"questions\":[{\"questionId\":1,\"questionText\":\"What is the correct way to print 'Hello World' in Python?\",\"options\":{\"A\":\"echo('Hello World')\",\"B\":\"print('Hello World')\",\"C\":\"console.log('Hello World')\",\"D\":\"printf('Hello World')\"},\"correctAnswer\":\"B\",\"explanation\":\"In Python, the print() function is used to output text to the console.\"},{\"questionId\":2,\"questionText\":\"Which symbol is used for comments in Python?\",\"options\":{\"A\":\"//\",\"B\":\"/* */\",\"C\":\"#\",\"D\":\"--\"},\"correctAnswer\":\"C\",\"explanation\":\"Python uses the # symbol for single-line comments.\"}, /* ... more questions ... */]}"
      }
    }
  ]
}
```

---

## Example 3: Extreme Difficulty - Machine Learning (30 Questions)

### Request Highlights

**Key Differences for Extreme Difficulty:**
- More questions (30)
- Additional context about specific subtopics
- Emphasis on advanced concepts
- Mathematical formulas expected
- Expert-level terminology

**Additional Description in Request:**
```json
{
  "additionalDescription": "Focus on: Backpropagation mathematics, Optimization algorithms (Adam, RMSprop), Regularization techniques (L1, L2, Dropout), Hyperparameter tuning strategies, Neural architecture design principles"
}
```

---

## Error Response Examples

### Error 1: Rate Limit Exceeded

```json
{
  "error": {
    "message": "Rate limit exceeded",
    "type": "rate_limit_error",
    "param": null,
    "code": "rate_limit_exceeded"
  }
}
```

**HTTP Status:** `429 Too Many Requests`

**System Handling:**
- Retry with exponential backoff
- Wait 2s, 4s, 8s between attempts
- Display user-friendly message

---

### Error 2: Invalid API Key

```json
{
  "error": {
    "message": "Invalid authentication credentials",
    "type": "invalid_request_error",
    "param": null,
    "code": "invalid_api_key"
  }
}
```

**HTTP Status:** `401 Unauthorized`

**System Handling:**
- Stop retrying immediately
- Log error details
- Return configuration error to user

---

### Error 3: Timeout

**System Error (Not from GROK):**
```
Error: timeout of 60000ms exceeded
```

**System Handling:**
- Retry up to 3 times
- Increase timeout for subsequent attempts
- Inform user of delay

---

## Response Parsing in Application

### Step 1: Extract Content

```javascript
const content = apiResponse.choices[0].message.content;
```

### Step 2: Parse JSON

```javascript
// Try direct parsing
let quizData;
try {
  quizData = JSON.parse(content);
} catch (error) {
  // Fallback: Extract from markdown blocks
  const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (jsonMatch) {
    quizData = JSON.parse(jsonMatch[1]);
  } else {
    throw new Error('Could not parse JSON');
  }
}
```

### Step 3: Validate Structure

```javascript
const validation = validateGrokResponse(quizData, expectedQuestions);
if (!validation.isValid) {
  throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
}
```

### Step 4: Save to Database

```javascript
const quiz = new Quiz({
  quizTitle: quizData.quizTitle,
  topic: quizData.topic,
  difficulty: difficultyLevel,
  totalQuestions: numberOfQuestions,
  timerInMinutes: timerInMinutes,
  questions: quizData.questions
});

await quiz.save();
```

---

## Performance Metrics

### Typical Response Times

| Question Count | Difficulty | Avg Response Time |
|---------------|-----------|-------------------|
| 10            | Easy      | 15-20 seconds     |
| 15            | Medium    | 20-25 seconds     |
| 20            | Medium    | 25-30 seconds     |
| 30            | Difficult | 35-45 seconds     |
| 50            | Extreme   | 50-70 seconds     |
| 100           | Any       | 90-120 seconds    |

### Token Usage

| Question Count | Avg Prompt Tokens | Avg Completion Tokens | Total |
|---------------|------------------|----------------------|-------|
| 10            | ~900             | ~1,200              | 2,100 |
| 20            | ~900             | ~2,400              | 3,300 |
| 30            | ~900             | ~3,600              | 4,500 |
| 50            | ~900             | ~6,000              | 6,900 |
| 100           | ~900             | ~12,000             | 12,900|

---

## Best Practices

### 1. Timeout Configuration
```javascript
timeout: 60000  // 60 seconds for most quizzes
timeout: 120000 // 120 seconds for 50+ questions
```

### 2. Retry Logic
```javascript
maxRetries: 3
backoffMultiplier: 2  // 2s, 4s, 8s
```

### 3. Error Logging
```javascript
console.error({
  timestamp: new Date(),
  attempt: attemptNumber,
  error: error.message,
  topic: topic,
  questionCount: numberOfQuestions
});
```

### 4. User Feedback
```javascript
// During generation
"🤖 GROK AI is generating your quiz..."
"This may take 20-40 seconds"

// On error
"Failed to generate quiz. Please try again."
"If the problem persists, check your API key."
```

---

## Testing GROK Integration

### Manual Test with cURL

```bash
curl -X POST https://api.x.ai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-beta",
    "messages": [
      {
        "role": "system",
        "content": "You are an expert quiz generator."
      },
      {
        "role": "user",
        "content": "Generate 5 easy questions about JavaScript"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 2000
  }'
```

---

## Conclusion

This sample demonstrates:
- ✅ Real-world GROK API request structure
- ✅ Complete prompt engineering approach
- ✅ Actual response format and parsing
- ✅ Error handling scenarios
- ✅ Performance characteristics
- ✅ Best practices for production use

**Key Takeaway:** The combination of detailed prompts, structured output requirements, and robust validation ensures high-quality quiz generation consistently.
