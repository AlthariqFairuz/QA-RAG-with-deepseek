"use client"

import { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, Upload } from 'lucide-react';
import { Message, ModelType, ChatResponse } from '@/types/Chat';

const ChatApp : React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [model, setModel] = useState<ModelType>('deepseek-r1:1.5b');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! How can I help you today? 💻' },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileUpload = async ( event : ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Origin': 'http://localhost:3000',
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      toast({
        title: "Success",
        description: "Document uploaded successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage : Message = { role: 'user', content: inputMessage };
    setMessages([...messages, userMessage]);
    setInputMessage('');

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: model,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data : ChatResponse = await response.json();
      setMessages( prev => [...prev, { role: 'ai', content: data.response } ]);

    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
    finally {
      setIsLoading(false);
    }
  }

  const handleKeyPress = (event : KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }

  return (
    <div className='flex h-screen bg-dark-bg'>
            <div className="w-64 bg-neutral-800 p-4 flex flex-col">
        <h2 className="text-xl font-bold text-heading mb-4">⚙️ Configuration</h2>
        
        <Select value={model} onValueChange={(value: ModelType) => setModel(value)}>
          <SelectTrigger className="bg-neutral-700 border-neutral-600 text-neutral-100">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-700 text-neutral-100">
            <SelectItem value="deepseek-r1:1.5b">Deepseek-R1:1.5b</SelectItem>
            <SelectItem value="deepseek-r1:7b">Deepseek-R1:7b</SelectItem>
          </SelectContent>
        </Select>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-heading mb-2">Features</h3>
          <ul className="space-y-2 text-neutral-100">
            <li className="flex items-center gap-2">More features coming soon!</li>
          </ul>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-neutral-800 p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-heading">🐋 QA-RAG with Deepseek-R1</h1>
            <p className="text-neutral-400">An implementation of QA-RAG using Deepseek-R1 </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-chat-bg-user hover:bg-upload-bg-hover"
            disabled={isLoading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload PDF
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-bot-bg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-neutral-900" />
                </div>
              )}
              <Card className={`max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-chat-bg-user text-white' 
                  : 'bg-neutral-800 text-neutral-100'
              }`}>
                <CardContent className="p-3">
                  {message.content}
                </CardContent>
              </Card>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
                  <div className="w-4 h-4 bg-neutral-400 rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 bg-neutral-800 border-t border-neutral-700">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your coding question here..."
              className="bg-neutral-700 border-neutral-600 text-neutral-100"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              className="bg-chat-bg-user hover:bg-chat-bg-user-hover"
              disabled={isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ChatApp;
