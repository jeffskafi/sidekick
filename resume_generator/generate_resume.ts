import * as fs from 'fs';
import * as path from 'path';
import { DateTime } from 'luxon';
import { Configuration, OpenAIApi } from 'openai';
import { jsPDF } from 'jspdf';
import dotenv from 'dotenv';

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

interface Resume {
  name: string;
  summary: string;
  skills: {
    [key: string]: string[];
  };
  professional_experience: {
    company: string;
    roles: {
      title: string;
      dates: string;
      location: string;
      responsibilities: string[];
    }[];
  }[];
  education: {
    institution: string;
    degree: string;
    dates: string;
  }[];
}

interface Schema {
  // Define the schema structure here
}

function createPrompt(jobDescription: string, originalResume: Resume, schema: Schema): string {
  return `
    Given the following:
    1. Job Description: ${jobDescription}

    -------------------------------------
    2. Original Resume: ${JSON.stringify(originalResume, null, 2)}

    -------------------------------------

    3. Resume Schema: ${JSON.stringify(schema, null, 2)}

    -------------------------------------

    Please create a tailored resume that conforms to the provided schema. Modify the fields to best match the job description, role, responsibilities, and required skills. The output should be in JSON format only and conform to the provided json schema.
  `;
}

async function tailorResume(jobDescription: string, originalResume: Resume, schema: Schema): Promise<Resume> {
  const prompt = createPrompt(jobDescription, originalResume, schema);
  
  const response = await openai.createChatCompletion({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a professional resume writer. Tailor the resume to the job description and output in JSON format only." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });
  
  const tailoredResume: Resume = JSON.parse(response.data.choices[0].message.content);
  
  // Ensure the 'name' key is always 'Jaafar Skafi'
  tailoredResume.name = 'Jaafar Skafi';
  
  return tailoredResume;
}

function getStyles(): any {
  // This function would need to be implemented differently in TypeScript
  // as ReportLab is a Python library. You might want to use a different PDF generation library for TypeScript.
  throw new Error('Not implemented');
}

function addBackground(doc: any): void {
  // This function would need to be implemented differently in TypeScript
  // as it depends on the PDF library you choose to use.
  throw new Error('Not implemented');
}

function formatDates(dates: string): string {
  try {
    const [startDate, endDate] = dates.split(' - ');
    const formattedStartDate = DateTime.fromFormat(startDate, 'MMMM yyyy').toFormat('MMM yyyy');
    const formattedEndDate = endDate.toLowerCase() === 'present' ? 'Present' : DateTime.fromFormat(endDate, 'MMMM yyyy').toFormat('MMM yyyy');
    return `${formattedStartDate} - ${formattedEndDate}`;
  } catch (error) {
    return dates;
  }
}

function generatePdfResume(jsonData: Resume, filename: string): void {
  // This function would need to be implemented differently in TypeScript
  // as ReportLab is a Python library. You might want to use a different PDF generation library for TypeScript.
  throw new Error('Not implemented');
}

async function main(): Promise<void> {
  // Load the original resume and schema
  const originalResume: Resume = JSON.parse(fs.readFileSync('controller/morty/resume_generator/files/default/resume.json', 'utf-8'));
  const schema: Schema = JSON.parse(fs.readFileSync('controller/morty/resume_generator/files/default/schema.json', 'utf-8'));
  
  // Get the job description from the user
  const jobDescription = await new Promise<string>((resolve) => {
    process.stdout.write("Please paste the job description here: ");
    process.stdin.once('data', (data) => resolve(data.toString().trim()));
  });
  
  // Generate the tailored resume
  const tailoredResume = await tailorResume(jobDescription, originalResume, schema);
  
  // Generate timestamp
  const timestamp = DateTime.now().toFormat('yyyyMMdd_HHmmss');
  
  // Create a directory for the timestamped folder
  const outputDir = `controller/morty/resume_generator/files/generated/${timestamp}`;
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Save the JSON resume
  const jsonFilename = path.join(outputDir, `${timestamp}resume.json`);
  fs.writeFileSync(jsonFilename, JSON.stringify(tailoredResume, null, 2));
  
  // Generate and save the PDF resume
  const pdfFilename = path.join(outputDir, `${timestamp}resume.pdf`);
  generatePdfResume(tailoredResume, pdfFilename);
  
  console.log(`Tailored resume JSON saved to: ${jsonFilename}`);
  console.log(`Tailored resume PDF saved to: ${pdfFilename}`);
}

main().catch(console.error);
