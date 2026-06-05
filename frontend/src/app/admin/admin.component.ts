import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as THREE from 'three';
import { environment } from '../../environments/environment';
import { Chart, registerables } from 'chart.js';
import { WebsocketService } from '../services/websocket.service';

Chart.register(...registerables);

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  isPremium?: boolean;
  suspended?: boolean;
  storedData: {
    expenses: number;
    budgets: number;
    invoices: number;
    goals: number;
  };
}

interface LoginLog {
  email: string;
  time: string;
  role: string;
  status?: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('canvasContainer', { static: false }) canvasContainer!: ElementRef;
  @ViewChild('complianceChart', { static: false }) complianceChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ssoChart', { static: false }) ssoChartCanvas!: ElementRef<HTMLCanvasElement>;

  workspaces: any[] = [];
  metricsSummary: any = null;
  private complianceChartInstance: any;
  private ssoChartInstance: any;

  // Data Stores
  registeredUsers: UserData[] = [];
  loginHistory: LoginLog[] = [];

  // Active Tab & Filters
  activeTab = 'overview'; // 'overview', 'users', 'logs', 'controls'
  userSearchQuery = '';
  logSearchQuery = '';

  // Real Backend System Controls & Statistics
  rateLimitStrategy = 'None';
  announcementMessage = '';
  activeAnnouncement = '';
  requestCount = 0;
  dbStats = {
    users: 0,
    workspaces: 0,
    expenses: 0,
    budgets: 0,
    invoices: 0,
    auditEvents: 0
  };

  // Additional control systems
  aiAdvisorEnabled = true;
  ocrScannerEnabled = true;
  bankSyncEnabled = true;
  emailTo = '';
  emailSubject = '';
  emailBody = '';
  invitations: any[] = [];
  evictedUsersList: string[] = [];
  liveTrafficLogs: any[] = [];

  // Simulation Controls & Admin Actions
  maintenanceMode = false;
  aiComputeTurbo = true;
  syncFrequency = 'realtime';
  isBackingUp = false;
  backupComplete = false;
  alertMessage = '';
  showAlert = false;

  // System Stats (Simulated Live)
  h2MemoryUsage = '24.8 MB';
  apiLatency = '84ms';
  systemCpuLoad = '3.8%';
  activeSockets = 4;

  // Three.js 3D WebGL properties
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private holoOrb!: THREE.Mesh;
  private ringPoints!: THREE.Points;
  private animationId?: number;

  constructor(private router: Router, private http: HttpClient, private wsService: WebsocketService) {}

  ngOnInit(): void {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      this.router.navigate(['/home']);
      return;
    }

    // Load registered users; Seed default mock users if storage is empty
    const loadedUsers = localStorage.getItem('registeredUsers');
    if (loadedUsers) {
      this.registeredUsers = JSON.parse(loadedUsers);
    } else {
      this.registeredUsers = [
        {
          firstName: 'Akarsh',
          lastName: 'Srivastava',
          email: 'akarshsrivastava322@gmail.com',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          isPremium: true,
          storedData: { expenses: 42, budgets: 8, invoices: 15, goals: 5 }
        },
        {
          firstName: 'Tony',
          lastName: 'Stark',
          email: 'tony@starkindustries.com',
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          isPremium: true,
          storedData: { expenses: 1250, budgets: 80, invoices: 250, goals: 25 }
        },
        {
          firstName: 'Bruce',
          lastName: 'Wayne',
          email: 'bruce@waynecorp.com',
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          isPremium: true,
          storedData: { expenses: 890, budgets: 50, invoices: 120, goals: 12 }
        },
        {
          firstName: 'Sarah',
          lastName: 'Connor',
          email: 'sarah.connor@sky.net',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          isPremium: false,
          storedData: { expenses: 124, budgets: 15, invoices: 32, goals: 9 }
        },
        {
          firstName: 'Diana',
          lastName: 'Prince',
          email: 'diana@themyscira.gov',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          isPremium: false,
          storedData: { expenses: 15, budgets: 2, invoices: 5, goals: 4 }
        }
      ];
      localStorage.setItem('registeredUsers', JSON.stringify(this.registeredUsers));
    }

    // Load login history; Seed default mock logs if storage is empty
    const loadedHistory = localStorage.getItem('loginHistory');
    if (loadedHistory) {
      this.loginHistory = JSON.parse(loadedHistory);
    } else {
      this.loginHistory = [
        { email: 'akarshsrivastava322@gmail.com', time: new Date(Date.now() - 120000).toISOString(), role: 'admin', status: 'SUCCESS' },
        { email: 'tony@starkindustries.com', time: new Date(Date.now() - 900000).toISOString(), role: 'user', status: 'SUCCESS' },
        { email: 'bruce@waynecorp.com', time: new Date(Date.now() - 2700000).toISOString(), role: 'user', status: 'SUCCESS' },
        { email: 'sarah.connor@sky.net', time: new Date(Date.now() - 7200000).toISOString(), role: 'user', status: 'SUCCESS' },
        { email: 'diana@themyscira.gov', time: new Date(Date.now() - 18000000).toISOString(), role: 'user', status: 'SUCCESS' }
      ];
      localStorage.setItem('loginHistory', JSON.stringify(this.loginHistory));
    }

    // Connect to live production SOC2 compliance logs
    this.http.get<any[]>(`${environment.apiBaseUrl}/admin/audits`).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const backendLogs = data.map(item => ({
            email: item.username || 'system@cashflow.corp',
            time: item.createdAt || new Date().toISOString(),
            role: item.eventType || 'SYSTEM',
            status: item.details ? item.details.substring(0, 50) : 'VERIFIED'
          }));
          this.loginHistory = [...backendLogs, ...this.loginHistory];
        }
      },
      error: (err) => {
        console.warn('Unable to pull real-time mainframe audits. Retaining local storage logs.', err);
      }
    });

    this.loadWorkspaceLimits();
    this.loadMetricsSummary();
    this.loadSystemControls();
    this.loadFeatureFlags();
    this.loadInvitations();

    // Subscribe to WebSocket live request log streaming
    this.wsService.getMessages().subscribe(msg => {
      if (msg && msg.isLiveTraffic) {
        this.liveTrafficLogs.unshift(msg);
        if (this.liveTrafficLogs.length > 20) {
          this.liveTrafficLogs.pop();
        }
      }
    });
  }

  ngAfterViewInit(): void {
    // Start the 3D WebGL core gear rotating on the admin console
    setTimeout(() => {
      this.initHoloCore();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  // 3D WebGL Rotating Crystalline Core
  private initHoloCore(): void {
    if (!this.canvasContainer) return;
    const width = 180;
    const height = 180;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.z = 4.5;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.canvasContainer.nativeElement.appendChild(this.renderer.domElement);

    // Glowing Holographic Sphere Grid
    const geometry = new THREE.IcosahedronGeometry(1.6, 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0x0d9488,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    this.holoOrb = new THREE.Mesh(geometry, material);
    this.scene.add(this.holoOrb);

    // Orbiting particles representing user data synchronization stubs
    const particleCount = 60;
    const pGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.7 + Math.random() * 0.4;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    pGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMaterial = new THREE.PointsMaterial({
      color: 0x7c3aed,
      size: 0.08,
      transparent: true,
      opacity: 0.8
    });
    this.ringPoints = new THREE.Points(pGeometry, pMaterial);
    this.scene.add(this.ringPoints);

    // Animation Loop
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.holoOrb.rotation.y += 0.008;
      this.holoOrb.rotation.x += 0.004;
      this.ringPoints.rotation.y -= 0.012;
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  // Live Metric Getters
  get totalUsers(): number {
    return this.registeredUsers.length;
  }

  get totalLogins(): number {
    return this.loginHistory.length;
  }

  get totalDataNodes(): number {
    return this.registeredUsers.reduce((sum, u) => {
      const data = u.storedData || { expenses: 0, budgets: 0, invoices: 0, goals: 0 };
      return sum + (data.expenses || 0) + (data.budgets || 0) + (data.invoices || 0) + (data.goals || 0);
    }, 0);
  }

  get premiumRate(): number {
    if (this.totalUsers === 0) return 0;
    const premiumCount = this.registeredUsers.filter(u => u.isPremium).length;
    return Math.round((premiumCount / this.totalUsers) * 100);
  }

  // Active Lists Filters
  get filteredUsers(): UserData[] {
    if (!this.userSearchQuery.trim()) return this.registeredUsers;
    const q = this.userSearchQuery.toLowerCase();
    return this.registeredUsers.filter(u =>
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }

  get filteredLogs(): LoginLog[] {
    const sortedLogs = [...this.loginHistory].reverse();
    if (!this.logSearchQuery.trim()) return sortedLogs;
    const q = this.logSearchQuery.toLowerCase();
    return sortedLogs.filter(log =>
      log.email.toLowerCase().includes(q) ||
      (log.role && log.role.toLowerCase().includes(q))
    );
  }

  get recentLogins(): LoginLog[] {
    return this.loginHistory.slice(-6).reverse();
  }

  // Simulated Action Toggles
  switchTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'overview') {
      setTimeout(() => this.initCharts(), 100);
    }
  }

  togglePremium(user: UserData): void {
    user.isPremium = !user.isPremium;
    this.syncUsersToStorage();
    this.triggerCustomAlert(`✨ Premium status toggled successfully for ${user.email}!`);
  }

  toggleSuspension(user: UserData): void {
    user.suspended = !user.suspended;
    this.syncUsersToStorage();
    const action = user.suspended ? 'SUSPENDED' : 'REINSTATED';
    this.triggerCustomAlert(`🛡️ User Account ${user.email} was successfully ${action}!`);
  }

  pushSecurityAlert(user: UserData): void {
    this.triggerCustomAlert(`🚀 Simulated Security Challenge pushed to ${user.email} successfully!`);
  }

  triggerBackup(): void {
    if (this.isBackingUp) return;
    this.isBackingUp = true;
    this.backupComplete = false;
    setTimeout(() => {
      this.isBackingUp = false;
      this.backupComplete = true;
      this.triggerCustomAlert('💾 System ledger backup compiled & verified successfully.');

      try {
        const backupData = {
          exportTimestamp: new Date().toISOString(),
          systemMeta: {
            host: window.location.host,
            environment: 'Local Sandbox Development',
            maintenanceMode: this.maintenanceMode,
            aiTurboTensors: this.aiComputeTurbo,
            syncStrategy: this.syncFrequency
          },
          metrics: {
            registeredUsersCount: this.totalUsers,
            totalSessionLoginsCount: this.totalLogins,
            totalActiveDataNodes: this.totalDataNodes
          },
          databases: {
            users: this.registeredUsers,
            sessionHistory: this.loginHistory
          }
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cashflow_system_backup_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error('Simulated backup export error', e);
      }
    }, 1800);
  }

  loadSystemControls(): void {
    this.http.get<any>(`${environment.apiBaseUrl}/admin/system-controls`).subscribe({
      next: (data) => {
        if (data) {
          this.maintenanceMode = data.maintenanceMode;
          this.rateLimitStrategy = data.rateLimitStrategy;
          this.activeAnnouncement = data.activeAnnouncement;
          this.announcementMessage = data.activeAnnouncement; // Prefill input
          this.requestCount = data.requestCount;
          if (data.stats) {
            this.dbStats = data.stats;
          }
        }
      },
      error: (err) => {
        console.error('Failed to load system controls state from backend', err);
      }
    });
  }

  loadFeatureFlags(): void {
    this.http.get<any>(`${environment.apiBaseUrl}/admin/features`).subscribe({
      next: (data) => {
        if (data) {
          this.aiAdvisorEnabled = data.aiAdvisorEnabled !== false;
          this.ocrScannerEnabled = data.ocrScannerEnabled !== false;
          this.bankSyncEnabled = data.bankSyncEnabled !== false;
        }
      },
      error: (err) => {
        console.error('Failed to load feature flags', err);
      }
    });
  }

  toggleFeatureFlag(feature: string, enabled: boolean): void {
    this.http.post(`${environment.apiBaseUrl}/admin/features/update`, { feature, enabled }).subscribe({
      next: () => {
        this.triggerCustomAlert(`⚙️ Feature flag [${feature}] updated to: ${enabled ? 'ENABLED' : 'DISABLED'}`);
        this.loadFeatureFlags();
      },
      error: (err) => {
        console.error('Failed to update feature flag', err);
        this.triggerCustomAlert('❌ Error updating feature flag.');
      }
    });
  }

  evictUser(userEmail: string): void {
    this.http.post(`${environment.apiBaseUrl}/admin/users/evict`, { username: userEmail }).subscribe({
      next: () => {
        this.evictedUsersList.push(userEmail);
        this.triggerCustomAlert(`🛡️ Active session evicted successfully for ${userEmail}.`);
      },
      error: (err) => {
        console.error('Failed to evict user', err);
        this.triggerCustomAlert('❌ Error evicting user session.');
      }
    });
  }

  reinstateUser(userEmail: string): void {
    this.http.post(`${environment.apiBaseUrl}/admin/users/reinstate`, { username: userEmail }).subscribe({
      next: () => {
        this.evictedUsersList = this.evictedUsersList.filter(e => e !== userEmail);
        this.triggerCustomAlert(`🛡️ Session access reinstated for ${userEmail}.`);
      },
      error: (err) => {
        console.error('Failed to reinstate user', err);
        this.triggerCustomAlert('❌ Error reinstating user session.');
      }
    });
  }

  isUserEvicted(userEmail: string): boolean {
    return this.evictedUsersList.includes(userEmail);
  }

  sendEmail(): void {
    if (!this.emailTo || !this.emailSubject || !this.emailBody) {
      this.triggerCustomAlert('⚠ All email composer fields are required.');
      return;
    }

    this.http.post(`${environment.apiBaseUrl}/admin/email/send`, {
      to: this.emailTo,
      subject: this.emailSubject,
      body: this.emailBody
    }).subscribe({
      next: (res: any) => {
        this.triggerCustomAlert(`✉️ Email notification logged: ${res.message}`);
        this.emailTo = '';
        this.emailSubject = '';
        this.emailBody = '';
      },
      error: (err) => {
        console.error('Failed to send system email', err);
        this.triggerCustomAlert('❌ Error sending system email.');
      }
    });
  }

  loadInvitations(): void {
    this.http.get<any[]>(`${environment.apiBaseUrl}/admin/invitations`).subscribe({
      next: (data) => {
        this.invitations = data || [];
      },
      error: (err) => {
        console.error('Failed to load pending workspace invites', err);
      }
    });
  }

  cancelInvitation(inviteId: number): void {
    this.http.post(`${environment.apiBaseUrl}/admin/invitations/cancel`, { id: inviteId }).subscribe({
      next: () => {
        this.triggerCustomAlert('🗑️ Pending invite cancelled successfully.');
        this.loadInvitations();
      },
      error: (err) => {
        console.error('Failed to cancel invite', err);
        this.triggerCustomAlert('❌ Error cancelling workspace invite.');
      }
    });
  }

  exportAuditLogs(): void {
    window.open(`${environment.apiBaseUrl}/admin/audits/export`);
    this.triggerCustomAlert('📥 SOC2 Compliance Audit CSV download triggered.');
  }

  broadcastAnnouncement(): void {
    this.http.post(`${environment.apiBaseUrl}/admin/broadcast`, { message: this.announcementMessage }).subscribe({
      next: () => {
        this.triggerCustomAlert(`📢 Global announcement broadcasted successfully: "${this.announcementMessage}"`);
        this.loadSystemControls();
      },
      error: (err) => {
        console.error('Failed to broadcast announcement', err);
        this.triggerCustomAlert('❌ Error broadcasting announcement.');
      }
    });
  }

  clearAnnouncement(): void {
    this.announcementMessage = '';
    this.http.post(`${environment.apiBaseUrl}/admin/broadcast`, { message: '' }).subscribe({
      next: () => {
        this.triggerCustomAlert('📢 System announcement cleared successfully.');
        this.loadSystemControls();
      },
      error: (err) => {
        console.error('Failed to clear announcement', err);
        this.triggerCustomAlert('❌ Error clearing announcement.');
      }
    });
  }

  toggleMaintenance(): void {
    this.http.post(`${environment.apiBaseUrl}/admin/maintenance`, { enabled: this.maintenanceMode }).subscribe({
      next: () => {
        const msg = this.maintenanceMode 
          ? '🔒 Global read-only maintenance lock activated successfully.' 
          : '🔓 Maintenance lock released. Read-write access restored.';
        this.triggerCustomAlert(msg);
        this.loadSystemControls();
      },
      error: (err) => {
        console.error('Failed to update maintenance mode', err);
        this.triggerCustomAlert('❌ Error setting maintenance state.');
      }
    });
  }

  updateRateLimit(strategy: string): void {
    this.rateLimitStrategy = strategy;
    this.http.post(`${environment.apiBaseUrl}/admin/rate-limit`, { strategy: strategy }).subscribe({
      next: () => {
        this.triggerCustomAlert(`⚡ API throttling strategy re-configured to: ${strategy.toUpperCase()}`);
        this.loadSystemControls();
      },
      error: (err) => {
        console.error('Failed to update rate limit policy', err);
        this.triggerCustomAlert('❌ Error re-configuring rate limits.');
      }
    });
  }

  seedDatabase(): void {
    this.triggerCustomAlert('⏳ Seeding sandbox ledger database rows...');
    this.http.post(`${environment.apiBaseUrl}/admin/db/seed`, {}).subscribe({
      next: (res: any) => {
        this.triggerCustomAlert(`🌱 Seeding complete: ${res.message || 'database entries added.'}`);
        this.loadSystemControls();
      },
      error: (err) => {
        console.error('Failed to seed sandbox database', err);
        this.triggerCustomAlert('❌ Error seeding sandbox database.');
      }
    });
  }

  purgeDatabase(): void {
    if (confirm('Are you sure you want to purge all sandbox records? This is irreversible.')) {
      this.triggerCustomAlert('⏳ Purging database sandbox entries...');
      this.http.post(`${environment.apiBaseUrl}/admin/db/purge`, {}).subscribe({
        next: (res: any) => {
          this.triggerCustomAlert(`🗑️ Purge complete: ${res.message || 'records deleted.'}`);
          this.loadSystemControls();
        },
        error: (err) => {
          console.error('Failed to purge database data', err);
          this.triggerCustomAlert('❌ Error purging database data.');
        }
      });
    }
  }

  toggleAiTurbo(): void {
    const power = this.aiComputeTurbo ? 'TURBO GPU TENSORS ALLOCATED' : 'STANDARD COMPUTE RESTORED';
    this.triggerCustomAlert(`🤖 AI Predictive Model configured: ${power}`);
  }

  onSyncFrequencyChange(): void {
    this.triggerCustomAlert(`🔄 Bank sync frequency re-tuned to: ${this.syncFrequency.toUpperCase()}`);
  }

  private syncUsersToStorage(): void {
    localStorage.setItem('registeredUsers', JSON.stringify(this.registeredUsers));
  }

  private triggerCustomAlert(msg: string): void {
    this.alertMessage = msg;
    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, 4500);
  }

  loadWorkspaceLimits(): void {
    this.http.get<any[]>(`${environment.apiBaseUrl}/admin/workspace-limits`).subscribe({
      next: (data) => {
        this.workspaces = data;
      },
      error: (err) => {
        console.error('Failed to load workspace limits', err);
      }
    });
  }

  updateWorkspaceLimit(w: any): void {
    this.http.post(`${environment.apiBaseUrl}/admin/workspace-limits/update`, {
      id: w.id,
      storageCapacityGb: w.storageCapacityGb,
      isFrozen: w.isFrozen
    }).subscribe({
      next: () => {
        this.triggerCustomAlert(`💾 Workspace limits scaled successfully for ${w.name}!`);
        this.loadWorkspaceLimits();
      },
      error: (err) => {
        console.error('Failed to update workspace limits', err);
        this.triggerCustomAlert('❌ Error updating workspace bounds.');
      }
    });
  }

  loadMetricsSummary(): void {
    this.http.get<any>(`${environment.apiBaseUrl}/admin/metrics-summary`).subscribe({
      next: (data) => {
        this.metricsSummary = data;
        setTimeout(() => {
          this.initCharts();
        }, 100);
      },
      error: (err) => {
        console.error('Failed to load metrics summary', err);
      }
    });
  }

  initCharts(): void {
    if (!this.metricsSummary) return;

    // 1. Compliance Chart
    if (this.complianceChartCanvas) {
      if (this.complianceChartInstance) {
        this.complianceChartInstance.destroy();
      }
      const ctx = this.complianceChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const labels = this.metricsSummary.complianceTimeline.map((p: any) => p.day);
        const dataEvents = this.metricsSummary.complianceTimeline.map((p: any) => p.eventCount);
        const dataCritical = this.metricsSummary.complianceTimeline.map((p: any) => p.criticalEvents);

        this.complianceChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'SOC2 Activity Logs',
                data: dataEvents,
                borderColor: '#0d9488',
                backgroundColor: 'rgba(13, 148, 136, 0.15)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
              },
              {
                label: 'Critical Actions',
                data: dataCritical,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8' }
              },
              x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8' }
              }
            },
            plugins: {
              legend: {
                labels: { color: '#e2e8f0' }
              }
            }
          }
        });
      }
    }

    // 2. SSO Chart
    if (this.ssoChartCanvas) {
      if (this.ssoChartInstance) {
        this.ssoChartInstance.destroy();
      }
      const ctx = this.ssoChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const sso = this.metricsSummary.ssoBreakdown;
        const labels = Object.keys(sso);
        const data = Object.values(sso);

        this.ssoChartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: ['#7c3aed', '#0d9488', '#f59e0b'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#e2e8f0' }
              }
            }
          }
        });
      }
    }
  }
}

