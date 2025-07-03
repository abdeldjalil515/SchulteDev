---
layout: page
css: /assets/index.css
---

<div class="hero-section">
  <h1>Markus Schulte: Cloud Architect & Software Engineer</h1>
  <p>
    With 18+ years of experience (11+ freelance), I specialize in enterprise modernization and cloud-native transformations.<br/>
    Currently, I serve as a Cloud Architect at LBBW, contributing to the IT modernization for Germany's major state bank.
  </p>
  <p class="slogan">"Crafting solutions that thrive today and tomorrow"</p>
</div>

<div class="cta-section">
  <a href="/#lets-connect" class="cta-button">Let's Connect</a>
</div>

# About me

## Core Expertise

- **Enterprise Architecture:** Legacy-to-cloud migrations, experience with AWS, Azure and GCP,
  cloud strategies, cloud (native) system design
- **Technical Leadership:** Led teams of 5-9 developers, served as Product Owner and technical
  mentor
- **Backend Engineering:** Java (18y), Golang (4y), TypeScript - from monoliths to microservices
- **Cloud-Native Design:** Event-driven architecture, Self-contained Systems (SCS), distributed
  systems
- **DevOps Excellence:** Infrastructure-as-Code, automated CI/CD, comprehensive testing strategies

## My values

<div class="values-section">
  <div class="value-item">
    <img src="/assets/img/service-icons/programming.jpeg" alt="Proven IT Principles Icon" class="value-icon"/>
    <h3>Proven IT Principles</h3>
    <p>
      I believe in applying well-known principles like Clean Code and Clean Architecture.
      These foundational practices ensure a healthy and sustainable IT system landscape in the long term.
    </p>
  </div>
  <div class="value-item">
    <img src="/assets/img/service-icons/leadership.jpeg" alt="Team Collaboration Icon" class="value-icon"/>
    <h3>Effective Collaboration</h3>
    <p>
      Beyond technical excellence, I emphasize the human element in software development.
      Empowering the right people with the right responsibilities fosters successful development and highlights the immense potential of a cohesive team.
    </p>
  </div>
</div>

## What clients say

<div class="testimonials-section">
  <div class="testimonial">
    <blockquote>
      "Markus Schulte has in his multi-year engagement in the web portals domain successfully deployed his outstanding technical expertise and pronounced communicative talent across multiple teams as an architect. His work approach was consistently characterized by professionalism, reliability, and high quality."
    </blockquote>
    <cite>— Senior Colleague, Union Investment (2024)</cite>
  </div>
  <div class="testimonial">
    <blockquote>
      "His structured approach and ability to analyze complex architectures, share knowledge with the team, and develop them to the 'next level' have greatly advanced the entire project."
    </blockquote>
    <cite>— Team Member, Union Investment (2024)</cite>
  </div>
  <div class="testimonial">
    <blockquote>
      "Mr. Schulte further advanced the technological environment with his outstanding expertise. Thanks to his very quick comprehension, he brought added value to the project at an early stage."
    </blockquote>
    <cite>— Sebastian Mancke, tarent solutions GmbH (2017)</cite>
  </div>
</div>

<div class="cta-section">
  <a href="/#lets-connect" class="cta-button">Let's Connect</a>
</div>

# My Skillset

<div class="skillset-categories">
  <div class="skill-category">
    <h3>Cloud & DevOps</h3>
    <div class="tags-group">
      <span class="tag">#CloudArchitecture</span>
      <span class="tag">#AWS</span>
      <span class="tag">#Azure</span>
      <span class="tag">#GCP</span>
      <span class="tag">#Kubernetes</span>
      <span class="tag">#Docker</span>
      <span class="tag">#Terraform</span>
      <span class="tag">#CI/CD</span>
      <span class="tag">#DevOps</span>
    </div>
  </div>
  <div class="skill-category">
    <h3>Languages & Engineering</h3>
    <div class="tags-group">
      <span class="tag">#SoftwareEngineering</span>
      <span class="tag">#Java</span>
      <span class="tag">#Golang</span>
      <span class="tag">#TypeScript</span>
    </div>
  </div>
  <div class="skill-category">
    <h3>Architecture & Design</h3>
    <div class="tags-group">
      <span class="tag">#Microservices</span>
      <span class="tag">#EventDriven</span>
      <span class="tag">#CleanCode</span>
      <span class="tag">#Architecture</span>
      <span class="tag">#API_Design</span>
      <span class="tag">#Monorepo</span>
    </div>
  </div>
  <div class="skill-category">
    <h3>Methodologies & Practices</h3>
    <div class="tags-group">
      <span class="tag">#Agile</span>
      <span class="tag">#Leadership</span>
      <span class="tag">#ContractTesting</span>
    </div>
  </div>
</div>

<div class="cta-section">
  <a href="/#lets-connect" class="cta-button">Let's Connect</a>
</div>

# My Career

<div class="page-section">
{% for company in site.data.portfolio %}
  <div class="box">
    <a href="{{ company.url }}">
      <img src="/assets/img/logos/{{ company.img }}" alt="{{ company.title }} logo"/>
      <div class="box-title">{{ company.title }}</div>
      <div class="box-desc">{{ company.description }}</div>
    </a>
  </div>
{% endfor %}
</div>

<div class="cta-section">
  <a href="/#lets-connect" class="cta-button">Let's Connect</a>
</div>

# My Services

<div class="page-section">
{% for app in site.data.services %}
  <div class="box">
    <img src="/assets/img/service-icons/{{ app.img }}"  alt="{{ app.title }} icon"/>
    <div class="box-title">{{ app.title }}</div>
    <div class="box-desc">{{ app.description }}</div>
    <div class="box-desc">{{ app.skills }}</div>
  </div>
{% endfor %}
</div>

<div class="cta-section">
  <a href="/#lets-connect" class="cta-button">Let's Connect</a>
</div>

# My Contributions

<div class="page-section">
  <div class="box">
    <a href="/github-contributions">
      <img src="/assets/img/logos/github.svg" alt="GitHub logo"/>
      <div class="box-title">GitHub</div>
      <div class="box-desc">Open source projects and code contributions</div>
    </a>
  </div>
  <div class="box">
    <a href="/stackoverflow-contributions">
      <img src="/assets/img/logos/stackoverflow.svg" alt="StackOverflow logo"/>
      <div class="box-title">StackOverflow</div>
      <div class="box-desc">Community answers and technical discussions</div>
    </a>
  </div>
</div>

# Let's connect

<div class="contact-section">
  <div class="contact-box">
    <a href="https://outlook.office365.com/owa/calendar/Schultedevelopment1@schulte-development.de/bookings/">
      <img src="/assets/img/logos/microsoft_bookings_logo.png" alt="Outlook logo"/>
      <div class="contact-box-desc">Book appointment online</div>
    </a>
  </div>
  <div class="contact-box">
    <a href="mailto:mail@schulte-development.de">
      <img src="/assets/img/logos/mail.png" alt="Logo of email"/>
      <div class="contact-box-desc">mail@schulte-development.de</div>
    </a>
  </div>
  <div class="contact-box">
    <a href="https://www.linkedin.com/in/markus-schulte">
      <img src="/assets/img/logos/linkedin.png"  alt="LinkedIn logo"/>
      <div class="contact-box-desc">markus-schulte@LinkedIn</div>
    </a>
  </div>
</div>
