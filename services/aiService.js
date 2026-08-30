require("dotenv").config({
    path: "./config.env"
});

const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


exports.reviewCode = async (code, language, filePath) => {

    const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",

        reasoning_effort: "low",
        include_reasoning: false,

        max_completion_tokens: 1800,

        response_format: {
            type: "json_object"
        },

        messages: [

            {
                role: "system",

                content: `
You are an expert code reviewer and security engineer.

Your task is to analyze the source code provided by the user.

The provided input may be:
- A small code snippet
- A function
- A complete source file
- Any other valid source-code content

Analyze ONLY the code that is provided.

Focus on finding real and important issues related to:

- Security vulnerabilities
- Bugs and logical errors
- Input validation
- Authentication and authorization
- Error handling
- Performance
- Maintainability
- Unsafe or dangerous coding practices

Rules:

- Analyze the provided code carefully.
- Report ALL meaningful issues that are directly supported by the provided code.
- Do not invent behavior or assumptions that are not visible in the code.
- Avoid false positives.
- Do not report issues from code that was not provided.
- Every issue must describe the actual problem.
- Use the actual source-code line number when it can be determined.
- If the line number cannot be determined, use null.
- Severity must be exactly one of:
  low, medium, high, critical.
- Do not report trivial style issues unless they can cause a real problem.
- Keep descriptions and suggestions concise but useful.
- Do not limit the review to a fixed number of issues if there are more meaningful issues.
- Do not return duplicate issues.

The score should represent the overall quality and security of the provided code:

0-2 = Very poor / critical problems
3-4 = Poor
5-6 = Needs improvement
7-8 = Good with some issues
9 = Very good
10 = Excellent

Return ONLY valid JSON.

Return exactly this structure:

{
    "summary": "Short overall assessment of the provided code",
    "score": 0,
    "issues": [
        {
            "line": 1,
            "severity": "high",
            "title": "Short issue title",
            "description": "Clear explanation of the actual problem",
            "suggestion": "Clear recommendation to fix the problem"
        }
    ]
}

If there are no meaningful issues, return:

{
    "summary": "No significant issues were found in the provided code.",
    "score": 10,
    "issues": []
}
`
            },

            {
                role: "user",

                content: `
Language: ${language || "unknown"}

Source code:

${code}
`
            }

        ]
    });

    const result = response.choices?.[0]?.message?.content;

    if (!result || !result.trim()) {
        throw new Error("AI returned an empty response");
    }

    try {

        return JSON.parse(result);

    } catch (error) {

        console.error("Invalid AI JSON:");
        console.error(result);

        throw new Error("AI returned invalid JSON");
    }
};

exports.reviewRepository = async (fileReviews) => {

    const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",

        reasoning_effort: "low",
        include_reasoning: false,

        max_completion_tokens: 1800,

        response_format: {
            type: "json_object"
        },

        messages: [
            {
                role: "system",

                content: `
You are an expert senior software engineer, security engineer, and code reviewer.

You are reviewing a software repository based on individual reviews that were
already performed on its source files.

The input contains multiple file reviews. Each review represents one source
file and contains:
- The file path
- A summary
- A score
- A list of identified issues

Your task is to produce ONE FINAL repository-level code review.

Analyze all provided file reviews together.

Focus on:

- Security vulnerabilities
- Bugs and logical errors
- Authentication and authorization
- Input validation
- Error handling
- Performance
- Maintainability
- Architecture problems
- Repeated problems across files
- Related issues between different files

Rules:

- Use ONLY the information provided in the individual file reviews.
- Do not invent issues.
- Do not assume behavior that is not supported by the provided reviews.
- Preserve every meaningful issue identified by the individual reviews.
- Do not remove an issue just because it appears in another file.
- If the same issue exists in multiple files, keep the issue associated with each affected file.
- You may combine issues only when they are truly duplicates and represent the
  same problem in the same file.
- Every issue MUST contain the original file path.
- Preserve the original source-code line number when available.
- If the line number is unknown, use null.
- Severity must be exactly one of:
  low, medium, high, critical.
- Do not add trivial issues.
- Do not limit the number of issues. Return all meaningful issues supported by
  the provided reviews.
- The final score should represent the overall quality and security of the
  repository.

IMPORTANT:

The file path is required for every issue because the final review may contain
issues from multiple source files.

Return ONLY valid JSON.
Do not return markdown.
Do not include explanations outside the JSON.

Return exactly this structure:

{
    "summary": "Overall assessment of the repository",
    "score": 0,
    "issues": [
        {
            "file": "path/to/file.js",
            "line": 10,
            "severity": "high",
            "title": "Short issue title",
            "description": "Clear explanation of the actual problem",
            "suggestion": "Clear recommendation to fix the problem"
        }
    ]
}

Score:

0-2 = Very poor / critical problems
3-4 = Poor
5-6 = Needs improvement
7-8 = Good with some issues
9 = Very good
10 = Excellent

If no meaningful issues are found, return:

{
    "summary": "No significant issues were found in the provided repository reviews.",
    "score": 10,
    "issues": []
}
`
            },

            {
                role: "user",

                content: `
Here are the individual reviews of the repository files:

${JSON.stringify(fileReviews, null, 2)}
`
            }
        ]
    });

    const result = response.choices?.[0]?.message?.content;

    if (!result || !result.trim()) {
        throw new Error("AI returned an empty response");
    }

    try {
        return JSON.parse(result);

    } catch (error) {

        console.error("Invalid AI JSON:");
        console.error(result);

        throw new Error("AI returned invalid JSON");
    }
};