import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { gsap } from 'gsap';

interface FAQ {
  question: string;
  answer: string;
  category: string;
  isOpen?: boolean;
}

interface ChatMessage {
  text: string;
  sender: 'user' | 'agent';
  time: string;
}

@Component({
  selector: 'app-help-desk',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './help-desk.component.html',
  styleUrls: ['./help-desk.component.css']
})
export class HelpDeskComponent implements OnInit {
  faqSearch = '';
  
  // Collapsible FAQ list
  faqs: FAQ[] = [
    {
      question: "How does the Multimodal AI Receipt OCR Scanner work?",
      answer: "CashFlow leverages the Google Gemini 1.5 Flash vision model. When you upload a receipt image or PDF, the backend extracts critical data points (the merchant, category, and total amount) and saves the transaction to your databases reactively within milliseconds.",
      category: "AI OCR"
    },
    {
      question: "How do I secure and link a real Plaid bank account?",
      answer: "Navigate to the Bank Sync dashboard and click Connect Bank. Plaid Link launches in a secure sandbox/OAuth challenge window. Once verified, credentials exchange automatically over bank-grade encrypted TLS and fetch depository histories.",
      category: "Plaid Sync"
    },
    {
      question: "What happens when a collaborative workspace invitation is sent?",
      answer: "Inviting a collaborator dispatches a secure email with a verification token. When they accept the invitation link, their profile links to the workspace with Role-Based Access Controls (OWNER, EDITOR, VIEWER) restricting transaction edits.",
      category: "Workspaces"
    },
    {
      question: "Are system audit ledger logs really immutable?",
      answer: "Yes! Every single ledger creation, modification, workspace switch, or settings update automatically records to the database as an immutable AuditEvent under SOC2 compliance parameters, viewable inside the Admin Console.",
      category: "SOC2 Compliance"
    },
    {
      question: "How can I test Stripe simulated checkouts locally?",
      answer: "Use our sandbox webhook simulator inside the dashboard! Click 'Deliver Stripe Webhook Upgrade' to simulate instant checkout notifications, upgrading your account to premium levels via real-time WebSocket broker broadcasts.",
      category: "Stripe Billing"
    }
  ];

  // Ticket Form
  ticketSubject = '';
  ticketDesc = '';
  ticketEmail = '';

  // Help Chat simulator
  chatMessages: ChatMessage[] = [
    { text: "Hello! I'm your CashFlow Support Broker. How can I assist you with your ledger allocations today?", sender: "agent", time: "Just now" }
  ];
  chatInput = '';
  isAgentTyping = false;

  showAlert = false;
  alertMessage = '';

  ngOnInit(): void {
    this.ticketEmail = localStorage.getItem('currentUser') || '';

    // Staggered transitions are driven by robust native CSS staggered keyframes instead of JS staggering
  }

  get filteredFaqs(): FAQ[] {
    if (!this.faqSearch.trim()) return this.faqs;
    const q = this.faqSearch.toLowerCase();
    return this.faqs.filter(faq => 
      faq.question.toLowerCase().includes(q) || 
      faq.answer.toLowerCase().includes(q) ||
      faq.category.toLowerCase().includes(q)
    );
  }

  toggleFaq(faq: FAQ): void {
    faq.isOpen = !faq.isOpen;
    if (faq.isOpen) {
      setTimeout(() => {
        gsap.from('.faq-answer-inner', {
          y: -10,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }, 50);
    }
  }

  submitTicket(): void {
    if (!this.ticketSubject.trim() || !this.ticketDesc.trim()) {
      this.triggerAlert('⚠ Please specify subject and description parameters.', 'warning');
      return;
    }

    this.ticketSubject = '';
    this.ticketDesc = '';
    this.triggerAlert('✓ Trouble ticket submitted! Mainframe will contact you in 2 hours.', 'success');
  }

  sendChatMessage(): void {
    if (!this.chatInput.trim()) return;

    const userText = this.chatInput;
    this.chatMessages.push({
      text: userText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    this.chatInput = '';
    this.isAgentTyping = true;
    this.scrollChat();

    // Generate responsive bot reply based on user keyword searches
    setTimeout(() => {
      let botResponse = "I have logged your request. An enterprise financial representative will follow up soon. Feel free to search the dynamic FAQ database above for quick resolutions!";
      const q = userText.toLowerCase();

      if (q.includes('ocr') || q.includes('receipt') || q.includes('scan')) {
        botResponse = "For Receipt scanning, make sure you drag and drop a valid image file. CashFlow routes the image directly to Gemini 1.5 Flash Vision models which parses categories and amounts securely!";
      } else if (q.includes('plaid') || q.includes('bank') || q.includes('sync')) {
        botResponse = "Plaid Bank syncing operates in Sandbox environment. Simply connect using user: 'user_good' and password: 'evergreen' to test real statements ingesting live!";
      } else if (q.includes('stripe') || q.includes('billing') || q.includes('premium')) {
        botResponse = "To test Stripe payment upgrades, launch the Webhook Sandbox Cockpit on the dashboard home screen and click 'Deliver Stripe Webhook' for simulated preflight completions.";
      } else if (q.includes('workspace') || q.includes('invite') || q.includes('collaborate')) {
        botResponse = "Workspace invitations generate activation tokens. If your SMTP credentials are empty, look at your Spring Boot logs to copy-paste the sandbox verification URL directly!";
      } else if (q.includes('audit') || q.includes('logs') || q.includes('compliance')) {
        botResponse = "Mainframe systems log all entries as immutable database events. If logged in as 'admin', access the Compliance tab inside the Admin Dashboard to review these logs!";
      }

      this.isAgentTyping = false;
      this.chatMessages.push({
        text: botResponse,
        sender: 'agent',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      this.scrollChat();
    }, 1500);
  }

  private scrollChat(): void {
    setTimeout(() => {
      const chatBody = document.querySelector('.chat-body-scroller');
      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }, 50);
  }

  triggerAlert(msg: string, type: 'success' | 'warning' | 'error'): void {
    this.alertMessage = msg;
    this.showAlert = true;

    setTimeout(() => {
      gsap.fromTo('.custom-help-alert', 
        { scale: 0.9, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.5)' }
      );
    }, 0);

    setTimeout(() => {
      gsap.to('.custom-help-alert', {
        opacity: 0,
        y: -10,
        duration: 0.3,
        onComplete: () => { this.showAlert = false; }
      });
    }, 4000);
  }
}
