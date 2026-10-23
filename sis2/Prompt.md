# Prompt

## Tool

- **Tool:** Claude (Anthropic), in the Claude app, agent mode (it can read files, write code and run commands in a sandbox)
- **Model:** Claude Opus 5.5 (`claude-opus-5-5`)
- **Attachment:** `Week_6_Masters_ST.pptx` (the lecture slides)

## Prompt (exactly as sent)

```
SIS 2 
Test Automation with Playwright 
DEADLINE - Oct 23
LINK to Site to be tested 
https://practicesoftwaretesting.com/

1. At least 5 AT suits mentioned in the Pres - use any language you want with the Playwright framework. 
2.  Description.md - file: explain what you want to do 
   1. List of TCs to be automated 
3. [Prompt.md](http://prompt.md) file save exactly the prompt you used for the AI tool; mark exactly which tool you gonna use, like Claude Opus 5 Max efforts, etc 
4. [Review.md](http://review.md): explain what the AI results were about, how you reviewed and modified them, and justify your decisions 
5. Screenshots - AI response, Run results or whatever you think matters 
6. Link to public GitHub repository. 


You are an expert QA Automation Engineer specialized in Playwright. Your task is to create a robust, production-ready End-to-End test suite for the public practice web application based on this requirements: https://practicesoftwaretesting.com/ Please implement at least 5 distinct Automated Test (AT) suites/scenarios using TypeScript and the Playwright framework.
For your information I have attached the presentation of the lecture.
```

## Why this prompt

- It names the role, the framework, the language and the application.
- It attaches the lecture slides, so the model follows the course rules: the five test cases from slide 28, the folder structure from slide 20, `testIdAttribute: 'data-test'`, no `waitForTimeout`, no CSS or XPath locators, tests independent and parallel.
- It includes the full assignment text, so the model also produces the Markdown files the assignment asks for.
