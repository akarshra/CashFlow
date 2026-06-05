import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { gsap } from 'gsap';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.css'
})
export class PrivacyComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    // Fade-in entry animations
    gsap.from('.document-header', { opacity: 0, y: -20, duration: 0.9, ease: 'power3.out' });
    gsap.from('.document-sidebar', { opacity: 0, x: -30, duration: 1.1, delay: 0.15, ease: 'power3.out' });
    gsap.from('.document-content-pane', { opacity: 0, x: 30, duration: 1.1, delay: 0.25, ease: 'power3.out' });
  }

  scrollToSection(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Apple/Stripe spotlight cursor assignments
  onCardMove(event: MouseEvent, card: HTMLElement): void {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  }
}
