import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Chart, registerables } from 'chart.js';
import { gsap } from 'gsap';
import * as THREE from 'three';
import { AiService } from '../services/ai.service';

Chart.register(...registerables);

@Component({
  selector: 'app-wealth-roadmap',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './wealth-roadmap.component.html',
  styleUrls: ['./wealth-roadmap.component.css']
})
export class WealthRoadmapComponent implements OnInit, AfterViewInit {
  collaborators = [
    { name: 'Sarah Connor', initials: 'SC', role: 'CFO Advisor', color: '#7c3aed', active: false },
    { name: 'Tony Stark', initials: 'TS', role: 'Executive Sponsor', color: '#0d9488', active: false },
    { name: 'Bruce Wayne', initials: 'BW', role: 'Financial Auditor', color: '#f59e0b', active: false }
  ];
  simulatingCfo = false;
  simulatedChatMessage = '';
  simulatedChatSender = '';

  initialReserves = 50000;  // Seed default reserves
  monthlyRevenue = 12000;   // Seed default income
  monthlyExpenses = 15000;  // Seed default spending
  growthRate = 5;            // 5% monthly growth
  durationYears = 3;         // 3 years projection

  runwayMonths = 'Infinite';
  netSavings = 60000;
  terminalWealth = 0;

  // Animated properties for GSAP Rolling Number Tickers
  animatedNetSavings = 60000;
  animatedTerminalWealth = 500000;

  isAnalyzing = false;
  aiInsights = '';
  aiChecklist: string[] = [];

  // Persona configurations
  activePersona = 'corporate';
  pageTitle = 'Startup Wealth & Runway Planner';
  pageSubtitle = 'Interact with our predictive cash flow simulator. Gauge your business runway, compute growth margins, and project net assets over a five-year horizon.';
  reservesLabel = 'Starting Reserves';
  reservesMin = 0;
  reservesMax = 10000000;
  reservesStep = 50000;
  
  revenueLabel = 'Monthly Revenue Base';
  revenueMin = 0;
  revenueMax = 2000000;
  revenueStep = 10000;

  expensesLabel = 'Monthly Expenses';
  expensesMin = 0;
  expensesMax = 2000000;
  expensesStep = 10000;

  durationMin = 1;
  durationMax = 5;
  durationStep = 1;
  durationLabel = 'Years';

  runwayLabel = 'Runway Left';
  netCashLabel = 'Net Monthly Cash';
  terminalWealthLabel = 'Terminal Reserves';
  chartLabel = 'Projected cash reserves (₹)';
  aiAdvisorHeader = 'AI Executive Runway Advisor';
  
  @ViewChild('projectionChart', { static: true }) projectionChartCanvas!: ElementRef<HTMLCanvasElement>;
  private chartInstance: any;

  // Mini-3D WebGL Canvas for roadmap header
  @ViewChild('roadmapHeaderCanvas', { static: false }) roadmapHeaderCanvas!: ElementRef<HTMLCanvasElement>;
  private headerScene!: THREE.Scene;
  private headerCamera!: THREE.PerspectiveCamera;
  private headerRenderer!: THREE.WebGLRenderer;
  private headerCoin!: THREE.Mesh;
  private headerStars!: THREE.Points;
  private headerAnimationFrameId!: number;

  constructor(private ai: AiService) {}

  setPersonaDefaults(): void {
    if (this.activePersona === 'student') {
      this.pageTitle = 'Student College Savings & Runway Planner';
      this.pageSubtitle = 'Interact with our academic predictive planner. Project your semester allowance, track study expenditures, and estimate term-end savings.';
      this.reservesLabel = 'Starting Student Savings / Funds';
      this.reservesMin = 0;
      this.reservesMax = 500000;
      this.reservesStep = 5000;
      this.initialReserves = 15000;

      this.revenueLabel = 'Monthly Allowance / Part-time Income';
      this.revenueMin = 0;
      this.revenueMax = 100000;
      this.revenueStep = 1000;
      this.monthlyRevenue = 10000;

      this.expensesLabel = 'Monthly Living & College Costs';
      this.expensesMin = 0;
      this.expensesMax = 100000;
      this.expensesStep = 1000;
      this.monthlyExpenses = 8000;

      this.growthRate = 4;
      this.durationYears = 3;
      this.durationMin = 1;
      this.durationMax = 5;
      this.durationLabel = 'Years';

      this.runwayLabel = 'Semester Runway Left';
      this.netCashLabel = 'Net Monthly Pocket Money';
      this.terminalWealthLabel = 'Graduation Savings Target';
      this.chartLabel = 'Projected Student Savings Trajectory (₹)';
      this.aiAdvisorHeader = 'AI Academic Budget Advisor';
    } else if (this.activePersona === 'professional') {
      this.pageTitle = 'Job Holder Salary & SIP Wealth Planner';
      this.pageSubtitle = 'Model your salary trajectories, configure monthly SIP mutual fund contributions, and compute multi-year wealth accumulation.';
      this.reservesLabel = 'Starting Emergency Fund';
      this.reservesMin = 0;
      this.reservesMax = 2500000;
      this.reservesStep = 10000;
      this.initialReserves = 150000;

      this.revenueLabel = 'Monthly Salary / Income';
      this.revenueMin = 0;
      this.revenueMax = 800000;
      this.revenueStep = 5000;
      this.monthlyRevenue = 80000;

      this.expensesLabel = 'Monthly Rent & Living Expenses';
      this.expensesMin = 0;
      this.expensesMax = 800000;
      this.expensesStep = 5000;
      this.monthlyExpenses = 50000;

      this.growthRate = 8;
      this.durationYears = 5;
      this.durationMin = 1;
      this.durationMax = 10;
      this.durationLabel = 'Years';

      this.runwayLabel = 'Emergency Buffer Runway';
      this.netCashLabel = 'Net Monthly Investable Surplus';
      this.terminalWealthLabel = 'Terminal Net Worth Target';
      this.chartLabel = 'Projected Invested Wealth Trajectory (₹)';
      this.aiAdvisorHeader = 'AI Personal Finance Advisor';
    } else {
      // corporate
      this.pageTitle = 'Startup Wealth & Runway Planner';
      this.pageSubtitle = 'Interact with our predictive cash flow simulator. Gauge your business runway, compute growth margins, and project net assets over a five-year horizon.';
      this.reservesLabel = 'Starting Capital Reserves';
      this.reservesMin = 0;
      this.reservesMax = 25000000;
      this.reservesStep = 100000;
      this.initialReserves = 1000000;

      this.revenueLabel = 'Monthly Sales / Business Revenue';
      this.revenueMin = 0;
      this.revenueMax = 5000000;
      this.revenueStep = 50000;
      this.monthlyRevenue = 400000;

      this.expensesLabel = 'Monthly Operational Burn Rate';
      this.expensesMin = 0;
      this.expensesMax = 5000000;
      this.expensesStep = 50000;
      this.monthlyExpenses = 300000;

      this.growthRate = 10;
      this.durationYears = 3;
      this.durationMin = 1;
      this.durationMax = 5;
      this.durationLabel = 'Years';

      this.runwayLabel = 'Operational Runway Left';
      this.netCashLabel = 'Net Monthly Operating Profit';
      this.terminalWealthLabel = 'Corporate Retained Earnings';
      this.chartLabel = 'Projected Corporate Capital Trajectory (₹)';
      this.aiAdvisorHeader = 'AI Executive Corporate Advisor';
    }
  }

  ngOnInit(): void {
    this.activePersona = localStorage.getItem('appPersona') || 'corporate';
    this.setPersonaDefaults();

    this.ai.getRunwayProjection().subscribe({
      next: (res) => {
        if (res && res.totalIncome !== undefined) {
          this.monthlyRevenue = Math.round(res.totalIncome);
          this.monthlyExpenses = Math.round(res.totalExpenses);
          if (this.monthlyRevenue > this.revenueMax) this.monthlyRevenue = this.revenueMax;
          if (this.monthlyExpenses > this.expensesMax) this.monthlyExpenses = this.expensesMax;
          this.calculateProjections();
          if (this.chartInstance) {
            this.onSliderChange();
          }
        }
      },
      error: () => {
        this.calculateProjections();
      }
    });
  }

  ngAfterViewInit(): void {
    this.renderChart();

    // Staggered entry transitions via GSAP for high-end feel
    gsap.from('.back-home-btn', { opacity: 0, x: -20, duration: 0.8, ease: 'power2.out' });
    gsap.from('.page-title', { opacity: 0, y: -25, duration: 0.9, ease: 'power3.out' });
    gsap.from('.page-subtitle', { opacity: 0, y: -10, duration: 0.9, delay: 0.15, ease: 'power3.out' });
    gsap.from('.controls-card', { opacity: 0, x: -40, duration: 1.1, delay: 0.25, ease: 'power3.out' });
    gsap.from('.metric-card', { opacity: 0, y: 30, duration: 0.8, delay: 0.45, stagger: 0.15, ease: 'power2.out' });
    gsap.from('.chart-card', { opacity: 0, x: 40, duration: 1.1, delay: 0.65, ease: 'power3.out' });
    gsap.from('.roadmap-cta', { opacity: 0, y: 30, duration: 1, delay: 0.95, ease: 'power3.out' });

    // Initialize 3D Mini-Coin Scene
    try {
      this.initHeaderThree();
    } catch (e) {
      console.warn('Mini 3D scene failed to load in runway planner:', e);
    }
  }

  private initHeaderThree(): void {
    const canvas = this.roadmapHeaderCanvas.nativeElement;
    const width = 120;
    const height = 120;

    this.headerScene = new THREE.Scene();
    this.headerCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.headerCamera.position.z = 12;

    this.headerRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    this.headerRenderer.setSize(width, height);
    this.headerRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create a glossy Gold-mint Cylindrical Coin representation
    const coinGeometry = new THREE.CylinderGeometry(2.5, 2.5, 0.4, 32);
    const coinMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd97706,      // Vivid Amber Gold
      emissive: 0x3d1d00,
      metalness: 0.95,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      flatShading: false
    });

    this.headerCoin = new THREE.Mesh(coinGeometry, coinMaterial);
    this.headerCoin.rotation.x = Math.PI / 2; // Face forward
    this.headerCoin.rotation.y = Math.PI / 6;
    this.headerScene.add(this.headerCoin);

    // Create 15 tiny floating rising stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 20;
    const positions = new Float32Array(starCount * 3);
    const speeds: number[] = [];

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      speeds.push(0.015 + Math.random() * 0.02);
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0x0d9488,      // Mint teal particles
      size: 0.16,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.headerStars = new THREE.Points(starGeometry, starMaterial);
    this.headerScene.add(this.headerStars);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.headerScene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2.8);
    pointLight.position.set(10, 10, 10);
    this.headerScene.add(pointLight);

    const secondaryLight = new THREE.PointLight(0x06b6d4, 2.0);
    secondaryLight.position.set(-10, -10, 10);
    this.headerScene.add(secondaryLight);

    // Animate mini coin
    const animateHeader = () => {
      this.headerAnimationFrameId = requestAnimationFrame(animateHeader);
      
      const time = Date.now() * 0.001;
      
      // Spin and tilt coin
      if (this.headerCoin) {
        this.headerCoin.rotation.y = time * 1.2;
        this.headerCoin.rotation.x = (Math.PI / 2) + Math.sin(time * 1.5) * 0.2;
      }

      // Rise and reset stars
      if (this.headerStars) {
        const arr = this.headerStars.geometry.attributes['position'].array as Float32Array;
        for (let i = 0; i < starCount; i++) {
          arr[i * 3 + 1] += speeds[i]; // Rise upwards
          if (arr[i * 3 + 1] > 4) {
            arr[i * 3 + 1] = -4; // Reset to bottom
            arr[i * 3] = (Math.random() - 0.5) * 6;
          }
        }
        this.headerStars.geometry.attributes['position'].needsUpdate = true;
      }

      this.headerRenderer.render(this.headerScene, this.headerCamera);
    };

    animateHeader();
  }

  calculateProjections(): number[] {
    const initRes = Number(this.initialReserves);
    const monRev = Number(this.monthlyRevenue);
    const monExp = Number(this.monthlyExpenses);
    const growRt = Number(this.growthRate);
    const durYrs = Number(this.durationYears);

    this.netSavings = monRev - monExp;
    
    // Calculate Runway Months
    if (this.netSavings >= 0) {
      this.runwayMonths = 'Infinite';
    } else {
      const months = Math.floor(initRes / Math.abs(this.netSavings));
      this.runwayMonths = `${months} Months`;
    }

    // Build values over time
    const dataPoints: number[] = [];
    let currentCash = initRes;
    let rev = monRev;
    
    dataPoints.push(currentCash);

    const totalMonths = durYrs * 12;
    for (let m = 1; m <= totalMonths; m++) {
      rev = rev * (1 + (growRt / 100));
      const profit = rev - monExp;
      currentCash += profit;
      if (currentCash < 0) currentCash = 0;
      dataPoints.push(Math.round(currentCash));
    }

    this.terminalWealth = Math.round(currentCash);

    // Trigger dynamic GSAP rolling counter tickers
    gsap.to(this, {
      animatedNetSavings: this.netSavings,
      animatedTerminalWealth: this.terminalWealth,
      duration: 0.75,
      ease: 'power2.out'
    });

    return dataPoints;
  }

  onSliderChange(): void {
    const data = this.calculateProjections();
    this.updateChart(data);
  }

  renderChart(): void {
    const context = this.projectionChartCanvas.nativeElement.getContext('2d');
    if (!context) return;

    const data = this.calculateProjections();
    const labels = Array.from({ length: data.length }, (_, i) => i === 0 ? 'Start' : `Month ${i}`);

    this.chartInstance = new Chart(context, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: this.chartLabel,
          data: data,
          borderColor: '#0d9488', // Premium light-mode teal
          backgroundColor: 'rgba(13,148,136,0.08)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', maxTicksLimit: 12 }
          },
          y: {
            grid: { color: 'rgba(148, 163, 184, 0.06)' },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }

  updateChart(data: number[]): void {
    if (!this.chartInstance) return;
    const labels = Array.from({ length: data.length }, (_, i) => i === 0 ? 'Start' : `Month ${i}`);
    this.chartInstance.data.labels = labels;
    this.chartInstance.data.datasets[0].data = data;
    this.chartInstance.data.datasets[0].label = this.chartLabel;
    this.chartInstance.update();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  }

  // Lightweight spotlight handlers specifically for card containers with slider inputs
  // to avoid 3D transform matrices interfering with cursor drag projections.
  onControlsCardMove(event: MouseEvent, card: HTMLElement): void {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  }

  onControlsCardLeave(card: HTMLElement): void {
    card.style.setProperty('--mouse-x', `0px`);
    card.style.setProperty('--mouse-y', `0px`);
  }

  // 3D Apple/Stripe-style Hover Tilts & Spotlight Border Coordinates
  onCardMove(event: MouseEvent, card: HTMLElement): void {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Assign spotlight coords
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    gsap.to(card, {
      rotationX: -((y - yc) / yc) * 8,
      rotationY: ((x - xc) / xc) * 8,
      scale: 1.015,
      transformPerspective: 1000,
      ease: 'power2.out',
      duration: 0.3
    });
  }

  onCardLeave(card: HTMLElement): void {
    gsap.to(card, {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      ease: 'power3.out',
      duration: 0.6
    });
  }

  generateAiBrief(): void {
    if (this.isAnalyzing) return;
    this.isAnalyzing = true;
    this.aiInsights = '';
    this.aiChecklist = [];

    // Simulate real AI scanning progress ticker
    setTimeout(() => {
      this.isAnalyzing = false;
      
      const monRev = Number(this.monthlyRevenue);
      const monExp = Number(this.monthlyExpenses);
      
      if (this.activePersona === 'student') {
        if (this.netSavings < 0) {
          this.aiInsights = `⚠️ STUDENT BUDGET CRITICAL DEFICIT:\n\nYour net student savings rate is negative (-${this.formatCurrency(Math.abs(this.netSavings))}/month). Your starting savings of ${this.formatCurrency(this.initialReserves)} will be empty in ${this.runwayMonths}.\n\nRecommendations:\n1. Audit active recreation plans. Avail of student discount plans like Spotify Student, Notion Premium, and cheaper campus meals.\n2. Secure student bursaries, university scholarships, or safe part-time weekend coaching jobs to lift your allowance inflow.`;
          this.aiChecklist = ['Student Runway Deficit Flagged', 'Campus Allowance Audit Approved'];
        } else {
          this.aiInsights = `🎉 ACADEMIC BUDGET EXCELLENCE:\n\nYour pocket savings are highly positive (+${this.formatCurrency(this.netSavings)}/month), creating an infinite semester runway!\n\nAt a ${this.growthRate}% target growth rate, your graduation savings will scale to ${this.formatCurrency(this.terminalWealth)} over a ${this.durationYears}-year horizon. Remarkable discipline!\n\nRecommendations:\n1. Move 20% of semester savings to safe recurring deposits or index tracking mutual funds.\n2. Leverage student credentials to secure cheap premium software and training licenses.`;
          this.aiChecklist = ['Student Savings Audited', 'Academic Compound Matrix Confirmed'];
        }
      } else if (this.activePersona === 'professional') {
        if (this.netSavings < 0) {
          this.aiInsights = `⚠️ PERSONAL BUDGET DEFICIT WARNING:\n\nYour net monthly professional savings is in a deficit (-${this.formatCurrency(Math.abs(this.netSavings))}). Your starting emergency buffer of ${this.formatCurrency(this.initialReserves)} will be depleted in ${this.runwayMonths}.\n\nRecommendations:\n1. Restructure subscription contracts and limit restaurant dining / weekend travel overhead immediately.\n2. Audit credit card statements, cancel unused gym slot accounts, and establish a 6-month living cost cash vault.`;
          this.aiChecklist = ['Overage Warning Flagged', 'Living Cost Overage Audited'];
        } else {
          this.aiInsights = `🎉 WEALTH CREATION ENGINE SUCCESS:\n\nYour investable monthly surplus is positive (+${this.formatCurrency(this.netSavings)}), securing your emergency buffer runway!\n\nWith a ${this.growthRate}% salary growth projection, your terminal net worth will grow to ${this.formatCurrency(this.terminalWealth)} over a ${this.durationYears}-year horizon. Outstanding asset construction!\n\nRecommendations:\n1. Automate an index mutual fund SIP (Systematic Investment Plan) to secure continuous wealth compounding.\n2. Allocate 25% of extra savings to tax-saving ELSS funds under Section 80C.`;
          this.aiChecklist = ['Investable Surplus Verified', 'SIP Allocation Matrix Approved'];
        }
      } else {
        if (this.netSavings < 0) {
          this.aiInsights = `⚠️ CRITICAL DEFICIT AUDIT:\n\nYour net monthly savings is negative (-${this.formatCurrency(Math.abs(this.netSavings))}). At this active burn rate, your starting reserves of ${this.formatCurrency(this.initialReserves)} will be entirely depleted in ${this.runwayMonths}.\n\nRecommendations:\n1. Restructure subscription plans and trim SaaS overheads immediately to improve runway buffer.\n2. Utilize invoice factoring stubs to secure immediate business capital.`;
          this.aiChecklist = ['Runway Deficit Warning Flagged', 'Burn-Rate Optimization Check Approved'];
        } else {
          this.aiInsights = `🎉 EXPANSION AUDIT SUCCESS:\n\nYour net monthly savings is positive (+${this.formatCurrency(this.netSavings)}), creating an infinite cash runway!\n\nConfigured at a ${this.growthRate}% monthly revenue growth rate, your cash reserves will scale to ${this.formatCurrency(this.terminalWealth)} over a ${this.durationYears}-year horizon. Excellent resource allocation!\n\nRecommendations:\n1. Deploy 20% of consolidated reserves into low-risk capital indices.\n2. Setup collaborator workspaces to invite budget owners for subsidiary consolidation.`;
          this.aiChecklist = ['Allocation Reserves Audited', 'Multi-Year Growth Matrix Confirmed'];
        }
      }
      
      // Dynamic GSAP entry for text
      setTimeout(() => {
        gsap.from('.ai-insights-content', { opacity: 0, y: 15, duration: 0.5, ease: 'power2.out' });
      }, 50);
    }, 1800);
  }

  ngOnDestroy(): void {
    if (this.headerAnimationFrameId) {
      cancelAnimationFrame(this.headerAnimationFrameId);
    }
  }

  toggleCfoSimulation(): void {
    if (this.simulatingCfo) return;
    this.simulatingCfo = true;

    // Activate SC
    setTimeout(() => {
      this.collaborators[0].active = true;
      this.simulatedChatSender = 'Sarah Connor';
      this.simulatedChatMessage = 'Checking current runway bounds... scaling starting reserves projection up by 150,000.';

      // Animate initialReserves using GSAP
      const targetReserves = this.initialReserves + 150000;
      gsap.to(this, {
        initialReserves: targetReserves,
        duration: 1.5,
        onUpdate: () => this.onSliderChange()
      });
    }, 1000);

    // Activate TS
    setTimeout(() => {
      this.collaborators[1].active = true;
      this.simulatedChatSender = 'Tony Stark';
      this.simulatedChatMessage = 'Let us boost monthly revenue targets base. I expect corporate SaaS yields to double.';

      // Animate monthlyRevenue
      const targetRevenue = this.monthlyRevenue + 120000;
      gsap.to(this, {
        monthlyRevenue: targetRevenue,
        duration: 1.5,
        onUpdate: () => this.onSliderChange()
      });
    }, 3500);

    // Activate BW
    setTimeout(() => {
      this.collaborators[2].active = true;
      this.simulatedChatSender = 'Bruce Wayne';
      this.simulatedChatMessage = 'Calculations verified. Retaining 96% confidence score.';
      this.onSliderChange();
    }, 6000);

    setTimeout(() => {
      this.simulatingCfo = false;
      this.simulatedChatMessage = '';
      this.collaborators.forEach(c => c.active = false);
      window.alert('✔ CFO Collaborative Presence Session Simulation Complete.');
    }, 9000);
  }
}
