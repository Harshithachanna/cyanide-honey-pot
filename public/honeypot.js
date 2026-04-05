/**
 * THE RADIOACTIVE HONEYPOT: CORE INTELLIGENCE SCRIPT
 * Version: 2.1 (Production-Ready Secure Stealth)
 * (c) 2024 The Radioactive Honeypot. All rights reserved.
 */
(function() {
  'use strict';

  // 1. SELF-EXTRACTION & SECURITY
  const currentScript = document.currentScript;
  const apiKey = currentScript ? currentScript.getAttribute('data-api-key') : null;

  if (!apiKey) {
    if (window.console) console.warn('Honeypot: Passive monitoring active (No Key)');
    return;
  }

  // Determine endpoint relative to script source
  const scriptBase = currentScript ? currentScript.src : window.location.origin;
  const endpoint = new URL('/api/detonate', scriptBase).href;

  const metadata = {
    key: apiKey,
    ua: navigator.userAgent,
    ver: '2.1'
  };

  // 2. DETONATION ENGINE (Stealthy reporting)
  function trigger(vector) {
    // Avoid re-triggering within short window
    const now = Date.now();
    if (window._rh_last && (now - window._rh_last < 5000)) return;
    window._rh_last = now;

    const payload = JSON.stringify({
      apiKey: metadata.key,
      trapType: vector,
      userAgent: metadata.ua
    });

    // Use sendBeacon if available (more reliable on unload)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, payload);
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(() => {});
    }
  }

  // 3. STEALTH VECTORS
  function deploy() {
    // A. Ghost Link (Crawler/Scanner Trap)
    // We use a less obvious name and a common-looking deep path
    const ghost = document.createElement('a');
    ghost.href = "/api/v2/auth/internal_provisioning_config";
    Object.assign(ghost.style, {
      position: 'absolute',
      left: '-999px',
      top: '-999px',
      opacity: '0.001',
      pointerEvents: 'none',
      width: '1px', height: '1px', overflow: 'hidden'
    });
    ghost.setAttribute('aria-hidden', 'true');
    ghost.textContent = 'INTERNAL_ADMIN_OVERRIDE';
    document.body.appendChild(ghost);

    ghost.addEventListener('click', (e) => {
      e.preventDefault();
      trigger('HIDDEN_URL');
    });

    // B. Clipboard Poisoning (Credential Theft Trap)
    // We insert a decoy in the DOM that looks like documentation but is off-screen
    const decoy = document.createElement('div');
    decoy.style.cssText = 'position:fixed;top:-1000px;left:-1000px;';
    decoy.innerHTML = `
      <!-- INTERNAL DEPLOYMENT SECRETS -->
      AWS_PROD_DEPLOY_KEY=AKIAIOSFODNN7EXAMPLE
      AWS_PROD_DEPLOY_SECRET=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
      STRIPE_SECRET_PROD=sk_live_51MabcDefGhiJklMnoPqrStu
    `;
    document.body.appendChild(decoy);

    document.addEventListener('copy', () => {
      const selection = window.getSelection().toString();
      if (selection.includes('AKIAIOS') || selection.includes('_live_')) {
        trigger('API_KEY');
      }
    });

    // C. Binary Bait (Document Extraction Trap)
    // Hidden bait that looks like a PDF search result
    const bait = document.createElement('a');
    bait.href = '#';
    bait.style.cssText = 'display:none;';
    bait.textContent = 'Q4_Financial_Audit_Report.pdf';
    document.body.appendChild(bait);

    bait.addEventListener('click', (e) => {
      e.preventDefault();
      trigger('TOXIC_PDF');
    });
  }

  // 4. ANTI-DETECTION (Delayed Injection)
  if (document.readyState === 'complete') {
    setTimeout(deploy, 1200);
  } else {
    window.addEventListener('load', () => setTimeout(deploy, 1200));
  }

  // 5. ANTI-TAMPER (Naive approach)
  Object.freeze(metadata);

})();
