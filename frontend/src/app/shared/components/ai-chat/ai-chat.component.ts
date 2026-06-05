import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../../services/ai.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.css'
})
export class AiChatComponent {
  isOpen = false;
  messages: { text: string; sender: 'user' | 'ai' }[] = [
    { text: "Hello! I'm your CashFlow AI Assistant. Ask me anything about your finances!", sender: 'ai' }
  ];
  userInput = '';
  isLoading = false;

  suggestedPrompts = [
    'What is my monthly burn rate?',
    'Any duplicate transaction alerts?',
    'Check my active subscriptions'
  ];

  @ViewChild('chatBody') chatBody!: ElementRef;

  constructor(private aiService: AiService) {}

  selectPrompt(prompt: string) {
    this.userInput = prompt;
    this.sendMessage();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.scrollToBottom();
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userText = this.userInput;
    this.messages.push({ text: userText, sender: 'user' });
    this.userInput = '';
    this.isLoading = true;
    this.scrollToBottom();

    this.aiService.chat({ prompt: userText }).subscribe({
      next: (res) => {
        this.messages.push({ text: res.response || "I couldn't process that.", sender: 'ai' });
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: () => {
        this.messages.push({ text: "Error connecting to AI.", sender: 'ai' });
        this.isLoading = false;
        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatBody) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
