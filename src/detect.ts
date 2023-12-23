import type {
  ModelResult,
  ModelOperations,
} from "@vscode/vscode-languagedetection";

const languageDetection = require("@vscode/vscode-languagedetection");

const modelOperations: ModelOperations =
  new languageDetection.ModelOperations();

export async function detectLanguage(
  id: string,
  content: string,
): Promise<ModelResult[]> {
  const start = Date.now();
  try {
    const result = await modelOperations.runModel(content);
    return result.slice(0, 5);
  } finally {
    console.log(`Processed ${id} in ${Date.now() - start}ms`);
  }
}
