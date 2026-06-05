import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { gsap } from 'gsap';
import { BillingService } from '../../services/billing.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css'
})
export class PricingComponent implements AfterViewInit {
  isYearly = false;

  constructor(
    private router: Router,
    private billingService: BillingService
  ) {}

  isLoggedIn(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem('loggedIn') === 'true';
  }

  isPremium(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem('isPremium') === 'true';
  }

  async buyPlan(planName: string): Promise<void> {
    if (planName === 'Starter') {
      this.router.navigate([this.isLoggedIn() ? '/dashboard' : '/register']);
      return;
    }
    
    if (planName === 'Enterprise') {
      window.alert('Thank you for your interest in CashFlow Enterprise! Redirecting to contact sales simulation...');
      this.router.navigate(['/home']);
      return;
    }

    if (!this.isLoggedIn()) {
      window.alert('Please register or log in first to purchase a subscription.');
      this.router.navigate(['/register']);
      return;
    }

    const email = localStorage.getItem('currentUser') || 'user@cashflow.corp';

    const choice = window.confirm(
      `Professional Plan Subscription (₹${this.isYearly ? 799 : 999}/mo)!\n\n` +
      `Click [OK] to simulate instant sandbox payment confirmation.\n` +
      `Click [Cancel] to launch real Stripe Checkout Page.`
    );

    if (choice) {
      try {
        await lastValueFrom(this.billingService.simulateSuccess(email));
        localStorage.setItem('isPremium', 'true');
        window.alert('✨ Sandbox payment successful! Professional features unlocked.');
        this.router.navigate(['/dashboard']);
      } catch (err) {
        console.error('Failed to simulate premium upgrade', err);
        window.alert('Simulation failed. Try again.');
      }
    } else {
      try {
        const session = await lastValueFrom(
          this.billingService.createCheckoutSession(
            window.location.origin + '/dashboard?checkout=success',
            window.location.href
          )
        );
        if (session && session.url) {
          window.location.href = session.url;
        }
      } catch (err) {
        console.error('Failed to create Stripe session', err);
        window.alert('Stripe integration expects a valid secret key. Redirecting to sandbox simulator...');
        try {
          await lastValueFrom(this.billingService.simulateSuccess(email));
          localStorage.setItem('isPremium', 'true');
          this.router.navigate(['/dashboard']);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }


  plans = [
    {
      name: 'Starter',
      desc: 'Essential financial ledger for single entrepreneurs.',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        'Sync 1 collaborative workspace',
        'Gemini AI basic receipt parser',
        'Active savings runway simulator',
        'Standard dashboard tracking',
        'Community user support'
      ],
      popular: false,
      btnText: 'Start Free Ledger',
      icon: 'person'
    },
    {
      name: 'Professional',
      desc: 'Advanced tools for collaborative high-growth teams.',
      monthlyPrice: 999,
      yearlyPrice: 799, // 20% discount
      features: [
        'Sync unlimited shared workspaces',
        'Unlimited Gemini Vision receipt OCR scans',
        'Live SockJS-STOMP transaction sync',
        'Plaid banking credentials connection',
        'Advanced visual projection models',
        'Stripe billing integration',
        'Priority email response'
      ],
      popular: true,
      btnText: 'Upgrade to Professional',
      icon: 'bolt'
    },
    {
      name: 'Enterprise',
      desc: 'Robust visual forecasting for scale-stage operations.',
      monthlyPrice: 2999,
      yearlyPrice: 2399, // 20% discount
      features: [
        'Custom isolated database shards',
        'Supabase dedicated ledger brokers',
        'Direct Firebase cloud push notifications',
        'Custom branding & PDF invoice generators',
        'Dedicated account manager',
        'SLA 99.9% reconciliation uptime guarantee',
        '24/7 dedicated support'
      ],
      popular: false,
      btnText: 'Contact Enterprise Sales',
      icon: 'business'
    }
  ];

  ngAfterViewInit(): void {
    // Entrance animations via GSAP
    gsap.from('.pricing-header', { opacity: 0, y: -30, duration: 1, ease: 'power3.out' });
    gsap.from('.pricing-toggle-row', { opacity: 0, scale: 0.9, duration: 0.8, delay: 0.2, ease: 'power2.out' });
    gsap.from('.pricing-card', { opacity: 0, y: 50, duration: 1.1, delay: 0.4, stagger: 0.18, ease: 'power3.out' });
  }

  toggleBillingInterval(): void {
    this.isYearly = !this.isYearly;
    
    // Satisfying pop micro-animation on price display numbers using GSAP
    gsap.from('.price-amount', {
      scale: 0.82,
      opacity: 0.65,
      duration: 0.45,
      ease: 'back.out(2)'
    });
  }

  onCardMove(event: MouseEvent, card: HTMLElement): void {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    gsap.to(card, {
      rotationX: -((y - yc) / yc) * 6,
      rotationY: ((x - xc) / xc) * 6,
      scale: 1.015,
      transformPerspective: 1200,
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
}
