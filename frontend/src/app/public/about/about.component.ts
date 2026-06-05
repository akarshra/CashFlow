import { AfterViewInit, Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { gsap } from 'gsap';
import * as THREE from 'three';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  
  @ViewChild('threeAboutContainer', { static: true }) threeAboutContainer!: ElementRef<HTMLDivElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private torusRing!: THREE.Mesh;
  private particles!: THREE.Points;
  private animationFrameId!: number;

  // Track mouse coordinates for interactive WebGL 3D parallax
  private targetX = 0;
  private targetY = 0;

  ngAfterViewInit(): void {
    // Entrance animations via GSAP for high-end feel
    gsap.from('.about-copy', { opacity: 0, y: 40, duration: 1.2, ease: 'power3.out' });
    gsap.from('.about-canvas-container', { opacity: 0, scale: 0.8, duration: 1.4, delay: 0.2, ease: 'power3.out' });
    gsap.from('.value-card', { opacity: 0, y: 35, duration: 1, delay: 0.5, stagger: 0.15, ease: 'power3.out' });
    gsap.from('.about-cta', { opacity: 0, y: 30, duration: 1.2, delay: 0.8, ease: 'power3.out' });

    // Initialize Three.js 3D ring centerpiece
    try {
      this.initThree();
    } catch (e) {
      console.warn('Three.js failed to initialize in about component', e);
    }
  }

  private initThree(): void {
    const container = this.threeAboutContainer.nativeElement;
    const width = container.clientWidth || 450;
    const height = container.clientHeight || 450;

    // Create scene, camera, and transparent WebGL renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.z = 20;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Create a beautiful, shiny metallic Torus Knot representing collaborative unity
    const geometry = new THREE.TorusGeometry(5, 1.2, 16, 100);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x4f46e5,       // Electric purple-indigo
      emissive: 0x0f0b3b,
      metalness: 0.95,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.9,
      transmission: 0.35,
      ior: 1.45
    });
    
    this.torusRing = new THREE.Mesh(geometry, material);
    this.scene.add(this.torusRing);

    // Spawn 80 swirling light particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 6.8 + Math.random() * 2.5;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = radius * Math.cos(angle);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 2] = radius * Math.sin(angle);
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x06b6d4,       // Cyan stardust
      size: 0.16,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    this.particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particles);

    // Setup high-end ambient and point lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x4f46e5, 3.5); // Electric indigo glow
    pointLight1.position.set(15, 15, 15);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0d9488, 3.0); // Mint teal glow
    pointLight2.position.set(-15, -15, 15);
    this.scene.add(pointLight2);

    // Bind mouse move and window resize listeners
    window.addEventListener('mousemove', this.onWindowMouseMove);
    window.addEventListener('resize', this.onResize);

    // Run WebGL render loop
    this.animate();
  }

  private onWindowMouseMove = (event: MouseEvent) => {
    this.targetX = (event.clientX / window.innerWidth) - 0.5;
    this.targetY = (event.clientY / window.innerHeight) - 0.5;
  };

  private onResize = () => {
    if (!this.threeAboutContainer || !this.renderer || !this.camera) return;
    const container = this.threeAboutContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const time = Date.now() * 0.0006;
    
    // Rotate ring
    if (this.torusRing) {
      this.torusRing.rotation.x = time * 0.28;
      this.torusRing.rotation.y = time * 0.38;
      
      // Floating animation
      this.torusRing.position.y = Math.sin(time * 2.2) * 0.5;
      
      // Mouse dragging parallax
      this.torusRing.rotation.x += (this.targetY * 0.4 - this.torusRing.rotation.x) * 0.08;
      this.torusRing.rotation.y += (this.targetX * 0.4 - this.torusRing.rotation.y) * 0.08;
    }

    if (this.particles) {
      this.particles.rotation.y = -time * 0.2;
    }

    this.renderer.render(this.scene, this.camera);
  };

  // 3D Hover tilts & Spotlight coordinates
  onCardMove(event: MouseEvent, card: HTMLElement): void {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    gsap.to(card, {
      rotationX: -((y - yc) / yc) * 8,
      rotationY: ((x - xc) / xc) * 8,
      scale: 1.02,
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

  ngOnDestroy(): void {
    window.removeEventListener('mousemove', this.onWindowMouseMove);
    window.removeEventListener('resize', this.onResize);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
