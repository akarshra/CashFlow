import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Budget } from '../models/budget.model';
import { BudgetService } from '../services/budget.service';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'workspaces',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule],
  templateUrl: './workspaces.component.html',
  styleUrl: './workspaces.component.css'
})
export class WorkspacesComponent implements OnInit, OnDestroy {
  budgets: Budget[] = [];
  selectedBudgetId: number | null = null;
  collaboratorEmail = '';

  activePresence = [
    { email: 'sarah@cashflow.corp', initials: 'SA' },
    { email: 'rahul@cashflow.corp', initials: 'RA' }
  ];

  // WebRTC Sandbox States
  voiceConnected = false;
  voiceMuted = false;
  simulatedLatency = 0;
  activeSpeakers: string[] = [];
  waveBars: number[] = Array(15).fill(4);
  private simulationInterval: any = null;

  constructor(
    private budgetService: BudgetService,
    private ws: WebsocketService
  ) {}

  ngOnInit(): void {
    this.loadBudgets();
    
    // Listen for collaborative user presence broadcasts
    this.ws.getMessages().subscribe({
      next: (msg) => {
        if (msg && msg.isPresenceUpdate) {
          const initials = msg.username.substring(0, 2).toUpperCase();
          const exists = this.activePresence.some(p => p.email === msg.username);
          if (!exists) {
            this.activePresence.push({ email: msg.username, initials: initials });
          }
        }
      }
    });

    // Broadcast our presence on init
    setTimeout(() => {
      const me = localStorage.getItem('currentUser') || 'me@cashflow.corp';
      this.ws.sendPresence(me, 'workspaces-cockpit');
    }, 2000);
  }

  ngOnDestroy(): void {
    this.disconnectVoice();
  }

  loadBudgets(): void {
    this.budgetService.getBudgets().subscribe((budgets) => {
      this.budgets = budgets;
    });
  }

  shareBudget(): void {
    if (!this.selectedBudgetId || !this.collaboratorEmail.trim()) {
      return;
    }
    this.budgetService.shareBudget(this.selectedBudgetId, this.collaboratorEmail.trim()).subscribe(() => {
      this.collaboratorEmail = '';
      this.loadBudgets();
    });
  }

  // WebRTC Voice Simulation Handlers
  connectVoice(): void {
    this.voiceConnected = true;
    this.voiceMuted = false;
    this.simulatedLatency = Math.floor(12 + Math.random() * 15);
    
    // Start WebRTC simulated event loop
    this.simulationInterval = setInterval(() => {
      // 1. Simulating active speakers
      const speakers: string[] = [];
      if (!this.voiceMuted && Math.random() > 0.3) {
        speakers.push('You (Host)');
      }
      if (Math.random() > 0.5) {
        speakers.push('Sarah (Advisory)');
      }
      if (Math.random() > 0.7) {
        speakers.push('Rahul (Dev Ops)');
      }
      this.activeSpeakers = speakers;

      // 2. Simulating network latency jitter
      this.simulatedLatency = Math.floor(10 + Math.random() * 25);

      // 3. Simulating pulsating voice wave
      if (this.activeSpeakers.length > 0) {
        this.waveBars = this.waveBars.map(() => Math.floor(4 + Math.random() * 28));
      } else {
        this.waveBars = Array(15).fill(4);
      }
    }, 180);
  }

  toggleMute(): void {
    this.voiceMuted = !this.voiceMuted;
    if (this.voiceMuted) {
      this.activeSpeakers = this.activeSpeakers.filter(s => s !== 'You (Host)');
      this.waveBars = Array(15).fill(4);
    }
  }

  disconnectVoice(): void {
    this.voiceConnected = false;
    this.voiceMuted = false;
    this.activeSpeakers = [];
    this.waveBars = Array(15).fill(4);
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }
}
