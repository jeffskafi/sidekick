import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import type { PDFFont } from 'pdf-lib';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


interface Contact {
  location: string;
  phone: string;
  email: string;
  linkedin?: string;
  github?: string;
}

interface Role {
  title: string;
  dates: string;
  location: string;
  responsibilities: string[];
}

interface Experience {
  company: string;
  roles: Role[];
}

interface Education {
  institution: string;
  degree: string;
  dates: string;
}

interface Resume {
  name: string;
  contact: Contact;
  summary: string;
  skills: {
    project_management: string[];
    technical_skills: string[];
    methodologies: string[];
    tools: string[];
    soft_skills: string[];
  };
  professional_experience: Experience[];
  education: Education[];
}

function createPrompt(jobDescription: string, originalResume: Resume, schema: Resume): string {
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

async function tailorResume(jobDescription: string, originalResume: Resume, schema: Resume): Promise<Resume> {
  const prompt = createPrompt(jobDescription, originalResume, schema);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a professional resume writer. Tailor the resume to the job description and output in JSON format only." },
    { role: "user", content: prompt }
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages,
    response_format: { type: "json_object" }
  });

  if (!response?.choices[0]?.message?.content) {
    throw new Error("No content received from OpenAI");
  } else {
    const tailoredResume: Resume = JSON.parse(response.choices[0].message.content) as Resume;

    // Ensure the 'name' key is always 'Jaafar Skafi'
    tailoredResume.name = 'Jaafar Skafi';

    return tailoredResume;
  }
}

async function generatePdfResume(jsonData: Resume, filename: string): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const pageSize: [number, number] = [595.276, 841.890]; // A4 size
  let page = pdfDoc.addPage(pageSize);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let yPos = height - 50;
  const margin = 50;

  // Helper function to add text
  const addText = (text: string, fontSize: number, isBold = false, x: number = margin) => {
    if (yPos < margin) {
      page = pdfDoc.addPage(pageSize);
      yPos = height - 50;
    }
    page.drawText(text, {
      x,
      y: yPos,
      size: fontSize,
      font: isBold ? boldFont : font,
    });
    yPos -= fontSize + 5;
  };

  // Add name
  addText(jsonData.name, 24, true);

  // Add contact information
  addText(`${jsonData.contact.location} | ${jsonData.contact.phone} | ${jsonData.contact.email}`, 10);
  yPos -= 10;

  // Add summary
  addText('Summary', 16, true);
  const summaryLines = splitTextToLines(jsonData.summary, width - 2 * margin, font, 12);
  summaryLines.forEach(line => addText(line, 12));
  yPos -= 10;

  // Add skills
  addText('Skills', 16, true);
  Object.entries(jsonData.skills).forEach(([category, skills]) => {
    addText(`${category}: ${skills.join(', ')}`, 10);
  });
  yPos -= 10;

  // Add professional experience
  addText('Professional Experience', 16, true);
  jsonData.professional_experience.forEach((experience) => {
    addText(experience.company, 14, true);
    experience.roles.forEach((role) => {
      addText(`${role.title} | ${formatDates(role.dates)} | ${role.location}`, 12, true);
      role.responsibilities.forEach((responsibility) => {
        const respLines = splitTextToLines(`• ${responsibility}`, width - 2 * margin - 20, font, 10);
        respLines.forEach(line => addText(line, 10, false, margin + 20));
      });
    });
    yPos -= 10;
  });

  // Add education
  addText('Education', 16, true);
  jsonData.education.forEach((edu) => {
    addText(edu.institution, 14, true);
    addText(`${edu.degree} | ${edu.dates}`, 12);
  });

  const pdfBytes = await pdfDoc.save();
  await fs.promises.writeFile(filename, pdfBytes);
}

function splitTextToLines(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);

    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function formatDates(dates: string): string {
  // Implement date formatting logic here
  return dates;
}

function generateTimestamp(): string {
  const now = new Date();
  return now.toISOString()
    .replace(/[-:]/g, '')  // Remove dashes and colons
    .replace(/\.\d+/, '')  // Remove milliseconds
    .replace('T', '_');    // Replace T with underscore
}

export async function main(jobDescription: string): Promise<void> {
  // Load the original resume and schema
  const originalResume: Resume = JSON.parse(await fs.promises.readFile('files/default/resume.json', 'utf-8')) as Resume
  const schema: Resume = JSON.parse(await fs.promises.readFile('files/default/schema.json', 'utf-8')) as Resume

  // Generate the tailored resume
  const tailoredResume = await tailorResume(jobDescription, originalResume, schema);

  // Generate timestamp
  const timestamp = generateTimestamp();

  // Create a directory for the timestamped folder
  const outputDir = `files/generated/${timestamp}`;
  await fs.promises.mkdir(outputDir, { recursive: true });

  // Save the JSON resume
  const jsonFilename = path.join(outputDir, `${timestamp}resume.json`);
  await fs.promises.writeFile(jsonFilename, JSON.stringify(tailoredResume, null, 2));

  // Generate and save the PDF resume
  const pdfFilename = path.join(outputDir, `${timestamp}resume.pdf`);
  console.log(`Generating PDF resume at ${pdfFilename}`);
  await generatePdfResume(tailoredResume, pdfFilename);
}


// Example usage
const jobDescription = `
We are seeking a skilled Software Engineer with experience in TypeScript, React, and Node.js. 
The ideal candidate should have a strong background in developing scalable web applications, 
working with RESTful APIs, and implementing responsive user interfaces. 
Knowledge of cloud platforms like AWS or Azure is a plus.
`;

main(jobDescription)
  .then(() => console.log('Resume generation completed successfully.'))
  .catch((error) => console.error('An error occurred:', error));

