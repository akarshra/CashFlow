import { AfterViewInit, Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { gsap } from 'gsap';
import * as THREE from 'three';

@Component({
  selector: 'home',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  
  @ViewChild('threeHomeContainer', { static: true }) threeHomeContainer!: ElementRef<HTMLDivElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  
  // 3D Core Gem & Swirling Ledger Node Particles
  private glassGem!: THREE.Mesh;
  private particleSystem!: THREE.Points;
  private backgroundDust!: THREE.Points;
  
  private orbitRadii: number[] = [];
  private orbitSpeeds: number[] = [];
  private orbitAngles: number[] = [];
  private orbitPhases: number[] = [];
  private particlesGeometry!: THREE.BufferGeometry;

  private animationFrameId!: number;
  private intersectionObserver!: IntersectionObserver;

  // Track mouse coordinates for interactive WebGL 3D parallax
  private targetX = 0;
  private targetY = 0;

  ngAfterViewInit(): void {
    // 1. Entrance micro-animations for Hero fold immediately
    gsap.fromTo('.hero-copy', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.4, ease: 'power4.out' });
    gsap.fromTo('.three-home-canvas', { opacity: 0, scale: 0.75 }, { opacity: 1, scale: 1, duration: 1.6, delay: 0.25, ease: 'power3.out' });

    // 2. GSAP Viewport Scroll reveals via Intersection Observer for premium feel
    try {
      this.initScrollReveals();
    } catch (e) {
      console.warn('Scroll reveal initialization skipped:', e);
    }

    // 3. Initialize Three.js 3D center piece
    try {
      this.initThree();
    } catch (e) {
      console.warn('Three.js failed to initialize in landing page', e);
    }
  }

  private initScrollReveals(): void {
    const observerOptions = {
      root: null,
      threshold: 0.15
    };

    this.intersectionObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          if (target.classList.contains('features-section')) {
            gsap.fromTo('.feature-card-glass', 
              {
                opacity: 0,
                y: 45,
                scale: 0.95,
                rotationX: 8,
                rotationY: -4
              },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                rotationX: 0,
                rotationY: 0,
                duration: 1.2,
                stagger: 0.18,
                ease: 'power3.out'
              }
            );
          } else if (target.classList.contains('planner-callout-section')) {
            gsap.fromTo('.planner-banner-card', 
              {
                opacity: 0,
                y: 40,
                scale: 0.96
              },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.2,
                ease: 'power3.out'
              }
            );
          } else if (target.classList.contains('cta-bottom-glass')) {
            gsap.fromTo('.cta-bottom-glass', 
              {
                opacity: 0,
                y: 40
              },
              {
                opacity: 1,
                y: 0,
                duration: 1.3,
                ease: 'power3.out'
              }
            );
          }
          obs.unobserve(target); // Trigger exactly once
        }
      });
    }, observerOptions);

    // Observe landing page sections
    document.querySelectorAll('.features-section, .planner-callout-section, .cta-bottom-glass').forEach(section => {
      this.intersectionObserver.observe(section);
    });
  }

  private initThree(): void {
    const container = this.threeHomeContainer.nativeElement;
    const width = container.clientWidth || 550;
    const height = container.clientHeight || 520;

    // Create scene, camera, and transparent WebGL renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.z = 24;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // 1. Create a beautiful Glass Icosahedron Gem core
    const gemGeometry = new THREE.IcosahedronGeometry(4.8, 1);
    const gemMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0d9488,       // Elegant mint teal
      emissive: 0x03211e,
      roughness: 0.05,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85,
      transmission: 0.65,    // Glass transparency level
      ior: 1.55,             // Index of refraction for glass reflections
      thickness: 1.8,        // Material physical thickness
      side: THREE.DoubleSide,
      flatShading: true      // Gives gem faceted reflections
    });
    
    this.glassGem = new THREE.Mesh(gemGeometry, gemMaterial);
    this.scene.add(this.glassGem);

    // 2. Create the Swirling 3D Particle Ring (350+ glowing nodes)
    const particleCount = 380;
    this.particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 7.5 + Math.random() * 6.5; // Orbiting spacing outside gem
      const speed = 0.006 + Math.random() * 0.012;
      const angle = Math.random() * Math.PI * 2;
      const phase = Math.random() * Math.PI;

      this.orbitRadii.push(radius);
      this.orbitSpeeds.push(speed);
      this.orbitAngles.push(angle);
      this.orbitPhases.push(phase);

      particlePositions[i * 3] = radius * Math.cos(angle);
      particlePositions[i * 3 + 1] = Math.sin(phase) * 1.5;
      particlePositions[i * 3 + 2] = radius * Math.sin(angle);
    }

    this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Circular glowing particle point style
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x4f46e5,       // Electric purple-indigo node streams
      size: 0.28,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particleSystem = new THREE.Points(this.particlesGeometry, particleMaterial);
    this.scene.add(this.particleSystem);

    // 3. Create ambient background stars dust (120+ points drifting)
    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = 140;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 45;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 45;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = new THREE.PointsMaterial({
      color: 0x06b6d4,       // Soft teal stellar glow
      size: 0.15,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    this.backgroundDust = new THREE.Points(dustGeometry, dustMaterial);
    this.scene.add(this.backgroundDust);

    // Setup high-end ambient and point lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x4f46e5, 3.0); // Electric purple glow
    pointLight1.position.set(20, 25, 20);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0d9488, 2.5); // Elegant teal glow
    pointLight2.position.set(-20, -25, 20);
    this.scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xf59e0b, 1.8); // Amber reflections
    pointLight3.position.set(0, 30, -10);
    this.scene.add(pointLight3);

    // Bind mouse move and window resize listeners
    window.addEventListener('mousemove', this.onWindowMouseMove);
    window.addEventListener('resize', this.onResize);

    // Run WebGL render loop
    this.animate();
  }

  private onWindowMouseMove = (event: MouseEvent) => {
    // Standardize mouse values between -0.5 and 0.5
    this.targetX = (event.clientX / window.innerWidth) - 0.5;
    this.targetY = (event.clientY / window.innerHeight) - 0.5;
  };

  private onResize = () => {
    if (!this.threeHomeContainer || !this.renderer || !this.camera) return;
    const container = this.threeHomeContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const time = Date.now() * 0.0006;
    
    // Rotate glass core gem
    if (this.glassGem) {
      this.glassGem.rotation.x = time * 0.28;
      this.glassGem.rotation.y = time * 0.38;
      
      // Floating animation
      this.glassGem.position.y = Math.sin(time * 2.5) * 0.6;
      
      // Drag rotation towards mouse parallax
      this.glassGem.rotation.x += (this.targetY * 0.4 - this.glassGem.rotation.x) * 0.08;
      this.glassGem.rotation.y += (this.targetX * 0.4 - this.glassGem.rotation.y) * 0.08;
    }

    // Swirl orbiting particles with mouse attraction/repulsion feedback
    if (this.particleSystem && this.particlesGeometry) {
      const positions = this.particlesGeometry.attributes['position'].array as Float32Array;
      const mouseDist = Math.sqrt(this.targetX * this.targetX + this.targetY * this.targetY);
      
      // Particles swirl tighter and faster when the mouse moves closer
      const speedModifier = 1 + mouseDist * 2.2;
      const radiusModifier = 1 - mouseDist * 0.28;

      for (let i = 0; i < this.orbitRadii.length; i++) {
        this.orbitAngles[i] += this.orbitSpeeds[i] * speedModifier;
        const currentRadius = this.orbitRadii[i] * radiusModifier;
        
        positions[i * 3] = currentRadius * Math.cos(this.orbitAngles[i]);
        positions[i * 3 + 1] = Math.sin(this.orbitPhases[i] + time) * 1.8;
        positions[i * 3 + 2] = currentRadius * Math.sin(this.orbitAngles[i]);
      }
      this.particlesGeometry.attributes['position'].needsUpdate = true;
      this.particleSystem.rotation.y = -time * 0.15;
    }

    // Drifting ambient dust particles
    if (this.backgroundDust) {
      this.backgroundDust.rotation.y = time * 0.05;
      this.backgroundDust.rotation.x = time * 0.03;
    }

    this.renderer.render(this.scene, this.camera);
  };

  // 3. Apple/Stripe-style 3D Card Hover Tilts & Spotlight Border Coordinates
  onCardMove(event: MouseEvent, card: HTMLElement): void {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Assign CSS variables for spotlight radial glow
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    // Tilt the card up to 10 degrees in 3D matrix space
    gsap.to(card, {
      rotationX: -((y - yc) / yc) * 10,
      rotationY: ((x - xc) / xc) * 10,
      scale: 1.025,
      transformPerspective: 1200,
      ease: 'power2.out',
      duration: 0.3
    });
  }

  onCardLeave(card: HTMLElement): void {
    // Smoothly transition card back to flat state and reset spotlight coords
    gsap.to(card, {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      ease: 'power3.out',
      duration: 0.6
    });
  }

  ngOnDestroy(): void {
    // Prevent memory leaks on page navigation
    window.removeEventListener('mousemove', this.onWindowMouseMove);
    window.removeEventListener('resize', this.onResize);
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
