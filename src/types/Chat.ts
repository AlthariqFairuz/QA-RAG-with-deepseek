export interface Message {
    role: 'user' | 'ai';
    content: string;
}

export interface ChatRequest {
    messages: Message[];
    model: string;
}

export interface ChatResponse {
    response: string;
}

export interface UploadResponse {
    message: string;
}

export type ModelType = 'deepseek-r1:1.5b' | 'deepseek-r1:3b';