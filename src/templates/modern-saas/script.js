// Modern SaaS Landing Page JavaScript
{{CONFIG}}

document.addEventListener('DOMContentLoaded', function() {
  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Navbar on scroll
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const answer = question.nextElementSibling;
      const isOpen = question.getAttribute('aria-expanded') === 'true';
      
      document.querySelectorAll('.faq-question').forEach(q => {
        q.setAttribute('aria-expanded', 'false');
        const a = q.nextElementSibling;
        if (a) a.style.display = 'none';
      });
      
      if (!isOpen && answer) {
        question.setAttribute('aria-expanded', 'true');
        answer.style.display = 'block';
      }
    });
  });

  // Analytics tracking
  if (lpConfig.analytics) {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.lpAnalytics?.track('cta_click', {
          text: btn.textContent,
          location: btn.closest('section')?.id
        });
      });
    });
  }
});