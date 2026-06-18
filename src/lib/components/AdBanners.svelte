<script>
  import { browser } from '$app/environment';

  let { onClaimCoupon } = $props();

  const slides = [
    {
      bg: '#2d6a2d',
      eyebrow: 'Agro Products · Harvest Week',
      headline: ['Farm', 'Fresh', 'Deals'],
      sub: 'Up to 40% off · Direct from Luweero, Kumi & Kasese farms',
      cta: 'Shop Agro',
      badge: '-40%',
      badgeBg: '#e60000',
      coupon: 'HARVEST40',
      images: [
        {
          src: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=220&q=80',
          alt: 'Fresh matooke bananas',
          style: 'width:110px;height:130px;object-fit:cover;border-radius:16px;transform:rotate(-4deg) translateY(10px);border:3px solid rgba(255,255,255,0.25)'
        },
        {
          src: 'https://images.unsplash.com/photo-1471194402529-8e0f5a675de6?w=160&q=80',
          alt: 'Fresh tomatoes',
          style: 'width:90px;height:110px;object-fit:cover;border-radius:16px;transform:rotate(5deg) translateY(18px);border:3px solid rgba(255,255,255,0.25)'
        },
        {
          src: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=140&q=80',
          alt: 'Avocados',
          style: 'width:80px;height:95px;object-fit:cover;border-radius:16px;transform:rotate(-2deg) translateY(24px);border:3px solid rgba(255,255,255,0.25)'
        },
      ],
    },
    {
      bg: '#7c3d8f',
      eyebrow: 'Art & Crafts · Made in Uganda',
      headline: ['Local', 'Art &', 'Crafts'],
      sub: 'Authentic handmade goods from Ugandan artisans — shipped nationwide',
      cta: 'Shop Crafts',
      badge: '-25%',
      badgeBg: '#f7a600',
      coupon: 'CRAFT25',
      images: [
        {
          src: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=160&q=80',
          alt: 'African woven basket',
          style: 'width:115px;height:135px;object-fit:cover;border-radius:16px;transform:rotate(-3deg) translateY(8px);border:3px solid rgba(255,255,255,0.25)'
        },
        {
          src: 'https://images.unsplash.com/photo-1688241319043-ea3220c8e7eb?q=80&w=1064&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          alt: 'Handmade pottery',
          style: 'width:90px;height:110px;object-fit:cover;border-radius:16px;transform:rotate(4deg) translateY(20px);border:3px solid rgba(255,255,255,0.25)'
        },
        {
          src: 'https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=140&q=80',
          alt: 'African print fabric',
          style: 'width:80px;height:100px;object-fit:cover;border-radius:16px;transform:rotate(-5deg) translateY(28px);border:3px solid rgba(255,255,255,0.25)'
        },
      ],
    },
    {
      bg: '#b5451b',
      eyebrow: 'Fashion · New Arrivals',
      headline: ['Style', 'Up', 'Big'],
      sub: 'Bags, shoes & African print clothing — top local brands delivered',
      cta: 'Shop Fashion',
      badge: '-35%',
      badgeBg: '#ffcb05',
      coupon: 'STYLE35',
      images: [
        {
          src: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200&q=80',
          alt: 'African print dress',
          style: 'width:110px;height:140px;object-fit:cover;border-radius:16px;transform:rotate(-4deg) translateY(6px);border:3px solid rgba(255,255,255,0.25)'
        },
        {
          src: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=160&q=80',
          alt: 'Fashion handbag',
          style: 'width:95px;height:110px;object-fit:cover;border-radius:16px;transform:rotate(5deg) translateY(20px);border:3px solid rgba(255,255,255,0.25)'
        },
        {
          src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=140&q=80',
          alt: 'Sneakers',
          style: 'width:85px;height:90px;object-fit:cover;border-radius:16px;transform:rotate(-3deg) translateY(30px);border:3px solid rgba(255,255,255,0.25)'
        },
      ],
    },
    {
      bg: '#1a5fa8',
      eyebrow: 'Food & Beverages · Local Brands',
      headline: ['Local', 'Food &', 'Drinks'],
      sub: 'Authentic Ugandan food, drinks & snacks delivered to your door',
      cta: 'Shop Food',
      badge: '-20%',
      badgeBg: '#e60000',
      coupon: 'FOOD20',
      images: [
        {
          src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80',
          alt: 'Local food spread',
          style: 'width:115px;height:130px;object-fit:cover;border-radius:16px;transform:rotate(-3deg) translateY(10px);border:3px solid rgba(255,255,255,0.25)'
        },
        {
          src: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=160&q=80',
          alt: 'Juice drinks',
          style: 'width:85px;height:115px;object-fit:cover;border-radius:16px;transform:rotate(4deg) translateY(18px);border:3px solid rgba(255,255,255,0.25)'
        },
        {
          src: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=140&q=80',
          alt: 'Packaged snacks',
          style: 'width:80px;height:95px;object-fit:cover;border-radius:16px;transform:rotate(-4deg) translateY(28px);border:3px solid rgba(255,255,255,0.25)'
        },
      ],
    },
  ];

  const activityItems = [
    'Aisha K. (Ntinda) saved UGX 12,400 on matooke',
    'Francis O. (Jinja) added 5kg tomatoes — free delivery',
    'Grace M. clipped HARVEST40 — 2 mins ago',
    'Samuel L. (Kawempe) checked out with MoMo',
    'Brenda N. (Mukono) rated her delivery 5 stars',
    'David T. saved UGX 8,000 on a cassava bulk order',
    'Ruth A. (Entebbe) claimed the flash sale discount',
    'Moses K. (Mbarara) activated MOMOSAVE cashback',
    'Lydia N. (Lira) ordered handwoven baskets — Art & Crafts',
    'Peter M. (Gulu) bought African print fabric — Fashion',
  ];

  const tickerText = [...activityItems, ...activityItems].join('   ·   ');

  let currentSlide = $state(0);
  let hours = $state(3);
  let minutes = $state(44);
  let seconds = $state(18);
  let buyersCount = $state(1204);
  let momoActivated = $state(false);
  let confettiPieces = $state([]);
  let rippleStyle = $state('');

  function goSlide(n) {
    currentSlide = ((n % slides.length) + slides.length) % slides.length;
  }

  function handleSlideClick() {
    goSlide(currentSlide + 1);
  }

  function spawnConfetti(x, y) {
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bcb', '#a66cff'];
    const pieces = [];
    for (let i = 0; i < 30; i++) {
      pieces.push({
        id: i,
        x: x + (Math.random() - 0.5) * 60,
        y: y + (Math.random() - 0.5) * 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 720 - 360,
        scale: 0.4 + Math.random() * 0.8,
        delay: Math.random() * 0.15,
      });
    }
    confettiPieces = pieces;
    setTimeout(() => { confettiPieces = []; }, 1500);
  }

  function handleCTA(e, coupon) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    onClaimCoupon?.(coupon);
  }

  function handleMoMo(e) {
    e.stopPropagation();
    if (momoActivated) return;
    const rect = e.currentTarget.getBoundingClientRect();
    spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    momoActivated = true;
    onClaimCoupon?.('MOMOSAVE');
    setTimeout(() => { momoActivated = false; }, 2500);
  }

  function handleRipple(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    rippleStyle = `left:${x}px;top:${y}px`;
    setTimeout(() => { rippleStyle = ''; }, 600);
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  $effect(() => {
    if (!browser) return;

    const autoPlay = setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
    }, 5000);

    const clock = setInterval(() => {
      seconds--;
      if (seconds < 0) { seconds = 59; minutes--; }
      if (minutes < 0) { minutes = 59; hours--; }
      if (hours < 0) hours = 11;
    }, 1000);

    const crowd = setInterval(() => {
      buyersCount += Math.floor(Math.random() * 5) - 1;
      if (buyersCount < 1100) buyersCount = 1150;
    }, 2200);

    return () => {
      clearInterval(autoPlay);
      clearInterval(clock);
      clearInterval(crowd);
    };
  });
</script>

<div class="banners-wrap">

  <!-- HERO CAROUSEL -->
  <div
    class="hero"
    style="--slide-bg:{slides[currentSlide].bg}"
    role="button"
    tabindex="0"
    onclick={handleSlideClick}
    onkeydown={(e) => e.key === 'Enter' && handleSlideClick()}
    aria-label="Browse deals carousel"
  >
    <div class="geo geo-1"></div>
    <div class="geo geo-2"></div>
    <div class="geo geo-3"></div>

    <div class="slide-counter">
      <span class="slide-current">{String(currentSlide + 1).padStart(2,'0')}</span>
      <span class="slide-sep"></span>
      <span class="slide-total">{String(slides.length).padStart(2,'0')}</span>
    </div>

    {#each slides as slide, i}
      <div class="slide" class:active={i === currentSlide} class:prev={i === currentSlide - 1 || (currentSlide === 0 && i === slides.length - 1)} aria-hidden={i !== currentSlide}>

        <div class="slide-content">
          <div class="eyebrow-row">
            <span class="eyebrow-pill">{slide.eyebrow}</span>
          </div>

          <div class="headline">
            {#each slide.headline as line}<div class="headline-line">{line}</div>{/each}
          </div>

          <p class="slide-sub">{slide.sub}</p>

          <div class="slide-actions">
            <button class="slide-cta" onclick={(e) => { handleRipple(e); handleCTA(e, slide.coupon); }}>
              <span class="ripple" class:active={!!rippleStyle} style={rippleStyle}></span>
              {slide.cta}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="coupon-chip">
              <span class="coupon-label">CODE</span>
              <span class="coupon-code">{slide.coupon}</span>
            </div>
          </div>
        </div>

        <div class="slide-imgs">
          {#each slide.images as img}
            <img
              src={img.src}
              alt={img.alt}
              style={img.style}
              loading="lazy"
            />
          {/each}
        </div>

        <div class="disc-badge" style="--badge-bg:{slide.badgeBg}">
          <span class="badge-num">{slide.badge}</span>
          <span class="badge-off">OFF</span>
        </div>

        <span class="tctext">T&Cs Apply</span>
      </div>
    {/each}

    <div class="slide-nav">
      {#each slides as _, i}
        <button
          class="nav-bar"
          class:active={i === currentSlide}
          class:past={i < currentSlide}
          onclick={(e) => { e.stopPropagation(); goSlide(i); }}
          aria-label="Go to slide {i + 1}"
        >
          <span class="nav-fill"></span>
        </button>
      {/each}
    </div>

    {#if confettiPieces.length > 0}
      <div class="confetti-layer">
        {#each confettiPieces as piece (piece.id)}
          <span
            class="confetti-piece"
            style="--x:{piece.x}px;--y:{piece.y}px;--color:{piece.color};--r:{piece.rotation}deg;--s:{piece.scale};--d:{piece.delay}s"
          ></span>
        {/each}
      </div>
    {/if}
  </div>

  <!-- RIGHT COLUMN -->
  <div class="right-col">

    <div class="momo-card">
      <div class="momo-header">
        <div class="momo-brand">
          <span class="momo-dot"></span>
          <span class="momo-label">MTN MoMo · Exclusive</span>
        </div>
        <div class="cashback-tag">+1,500 UGX</div>
      </div>

      <div class="momo-body">
        <div class="momo-headline">Pay MoMo,<br />Get Cash-Back</div>
        <p class="momo-sub">Instant credit on every order paid with your MTN Mobile Money wallet.</p>
      </div>

      <button class="momo-btn" class:activated={momoActivated} onclick={handleMoMo}>
        {#if momoActivated}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          MOMOSAVE Activated!
        {:else}
          Activate — MOMOSAVE
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {/if}
      </button>
    </div>

    <div class="flash-strip">
      <div class="flash-header">
        <div class="flash-eyebrow">
          <span class="flash-pulse"></span>
          Flash Sale
        </div>
        <span class="flash-sub">Limited stock left</span>
      </div>

      <div class="flash-timer">
        <div class="t-unit">
          <span class="t-num">{pad(hours)}</span>
          <span class="t-label">hrs</span>
        </div>
        <span class="t-sep">:</span>
        <div class="t-unit">
          <span class="t-num">{pad(minutes)}</span>
          <span class="t-label">min</span>
        </div>
        <span class="t-sep">:</span>
        <div class="t-unit">
          <span class="t-num">{pad(seconds)}</span>
          <span class="t-label">sec</span>
        </div>
      </div>
    </div>

  </div>

  <div class="activity-bar">
    <div class="live-badge">
      <span class="live-dot"></span>
      Live
    </div>
    <div class="activity-ticker">
      <div class="ticker-text">{tickerText}</div>
    </div>
    <div class="buyers-live">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <circle cx="5" cy="5" r="4" fill="#4ade80" opacity="0.25"/>
        <circle cx="5" cy="5" r="2.5" fill="#4ade80"/>
      </svg>
      {buyersCount.toLocaleString()} shopping
    </div>
  </div>

</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .banners-wrap {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: 10px;
    font-family: 'DM Sans', system-ui, sans-serif;
  }

  @media (max-width: 640px) {
    .banners-wrap { grid-template-columns: 1fr; }
  }

  .hero {
    position: relative;
    overflow: hidden;
    min-height: 300px;
    border-radius: 24px;
    cursor: pointer;
    background: var(--slide-bg, #2d6a2d);
    transition: background 0.7s cubic-bezier(0.4,0,0.2,1);
    user-select: none;
  }

  .geo {
    position: absolute;
    border-radius: 4px;
    pointer-events: none;
  }
  .geo-1 {
    width: 200px; height: 200px;
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 50%;
    right: -50px; top: -60px;
    animation: geo-float 8s ease-in-out infinite;
  }
  .geo-2 {
    width: 120px; height: 120px;
    border: 1.5px solid rgba(255,255,255,0.07);
    border-radius: 50%;
    right: 30px; top: 20px;
    animation: geo-float 6s ease-in-out infinite reverse;
  }
  .geo-3 {
    width: 60px; height: 60px;
    background: rgba(255,255,255,0.05);
    border-radius: 12px;
    transform: rotate(22deg);
    right: 140px; top: -20px;
    animation: geo-spin 12s linear infinite;
  }

  @keyframes geo-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-12px); }
  }
  @keyframes geo-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .slide-counter {
    position: absolute;
    top: 18px; left: 20px;
    display: flex;
    align-items: center;
    gap: 6px;
    z-index: 20;
  }
  .slide-current {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 800;
    color: rgba(255,255,255,0.95);
    letter-spacing: 0.04em;
  }
  .slide-sep {
    display: block;
    width: 18px;
    height: 1px;
    background: rgba(255,255,255,0.35);
  }
  .slide-total {
    font-size: 11px;
    font-weight: 500;
    color: rgba(255,255,255,0.4);
    letter-spacing: 0.04em;
  }

  .slide {
    position: absolute;
    inset: 0;
    display: flex;
    opacity: 0;
    transform: translateX(30px) scale(0.97);
    transition: opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1);
    pointer-events: none;
  }
  .slide.active {
    opacity: 1;
    transform: translateX(0) scale(1);
    pointer-events: auto;
  }
  .slide.prev {
    opacity: 0;
    transform: translateX(-30px) scale(0.97);
  }

  .slide-content {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 56%;
    padding: 52px 22px 28px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    z-index: 2;
  }

  .eyebrow-row { margin-bottom: 12px; }

  .eyebrow-pill {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.7);
    border: 1px solid rgba(255,255,255,0.2);
    padding: 4px 10px;
    border-radius: 100px;
    display: inline-block;
    backdrop-filter: blur(4px);
    background: rgba(255,255,255,0.08);
  }

  .headline {
    font-family: 'Syne', sans-serif;
    font-size: clamp(28px, 3.8vw, 40px);
    font-weight: 800;
    color: #fff;
    line-height: 0.95;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: -0.02em;
  }

  .headline-line {
    overflow: hidden;
  }
  .slide.active .headline-line {
    animation: headline-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  .slide.active .headline-line:nth-child(2) { animation-delay: 0.08s; }
  .slide.active .headline-line:nth-child(3) { animation-delay: 0.16s; }

  @keyframes headline-bounce {
    0% { opacity: 0; transform: translateY(20px) scale(0.9); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  .slide-sub {
    font-size: 11px;
    color: rgba(255,255,255,0.72);
    margin-bottom: 20px;
    line-height: 1.6;
    font-weight: 400;
    max-width: 220px;
  }
  .slide.active .slide-sub {
    animation: fade-up 0.5s ease 0.2s both;
  }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .slide-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .slide.active .slide-actions {
    animation: fade-up 0.5s ease 0.3s both;
  }

  .slide-cta {
    background: #fff;
    color: #111;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 9px 16px;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: transform 0.15s ease, background 0.15s ease;
    position: relative;
    overflow: hidden;
  }
  .slide-cta:hover { background: #f2f2f2; transform: translateY(-2px) scale(1.02); }
  .slide-cta:active { transform: scale(0.95); }

  .ripple {
    position: absolute;
    width: 0; height: 0;
    border-radius: 50%;
    background: rgba(0,0,0,0.15);
    pointer-events: none;
    transform: translate(-50%, -50%);
  }
  .ripple.active {
    animation: ripple-effect 0.6s ease-out forwards;
  }
  @keyframes ripple-effect {
    0% { width: 0; height: 0; opacity: 1; }
    100% { width: 300px; height: 300px; opacity: 0; }
  }

  .coupon-chip {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(255,255,255,0.12);
    border: 1px dashed rgba(255,255,255,0.3);
    border-radius: 6px;
    padding: 5px 10px;
  }
  .coupon-label {
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
  }
  .coupon-code {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: rgba(255,255,255,0.9);
    font-family: monospace;
  }

  .slide-imgs {
    position: absolute;
    right: 0; top: 0; bottom: 0;
    width: 48%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 6px;
    padding: 14px 12px 0 0;
    overflow: hidden;
  }
  .slide-imgs img {
    flex-shrink: 0;
    animation: float 3.8s ease-in-out infinite;
    box-shadow: 0 12px 32px rgba(0,0,0,0.28);
  }
  .slide-imgs img:nth-child(2) { animation-delay: 0.35s; animation-duration: 4.2s; }
  .slide-imgs img:nth-child(3) { animation-delay: 0.7s; animation-duration: 3.4s; }

  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(var(--float-rotate, 0deg)); }
    50% { transform: translateY(-10px) rotate(var(--float-rotate, 0deg)); }
  }

  .slide-imgs img:nth-child(1) { --float-rotate: -1deg; }
  .slide-imgs img:nth-child(2) { --float-rotate: 1deg; }
  .slide-imgs img:nth-child(3) { --float-rotate: -0.5deg; }

  .disc-badge {
    position: absolute;
    top: 16px; right: 16px;
    background: var(--badge-bg, #e60000);
    color: #fff;
    width: 52px; height: 52px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    gap: 0;
    overflow: hidden;
  }
  .disc-badge::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%);
    animation: shimmer 3s ease-in-out infinite;
  }
  @keyframes shimmer {
    0% { transform: translateX(-100%) rotate(25deg); }
    20% { transform: translateX(100%) rotate(25deg); }
    100% { transform: translateX(100%) rotate(25deg); }
  }

  .badge-num {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.02em;
    position: relative;
    z-index: 1;
  }
  .badge-off {
    font-size: 7px;
    font-weight: 700;
    letter-spacing: 0.1em;
    opacity: 0.8;
    text-transform: uppercase;
    line-height: 1.2;
    position: relative;
    z-index: 1;
  }

  .tctext {
    position: absolute;
    bottom: 8px; left: 16px;
    font-size: 8px;
    color: rgba(255,255,255,0.28);
    font-weight: 500;
    letter-spacing: 0.04em;
    z-index: 10;
  }

  .slide-nav {
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 4px;
    z-index: 20;
  }
  .nav-bar {
    width: 28px;
    height: 3px;
    background: rgba(255,255,255,0.2);
    border: none;
    cursor: pointer;
    padding: 0;
    border-radius: 2px;
    overflow: hidden;
    transition: width 0.3s ease, background 0.3s ease;
    position: relative;
  }
  .nav-bar:hover {
    background: rgba(255,255,255,0.35);
  }
  .nav-bar.active {
    width: 52px;
  }
  .nav-bar.past {
    background: rgba(255,255,255,0.5);
  }
  .nav-fill {
    position: absolute;
    inset: 0;
    background: #fff;
    transform: scaleX(0);
    transform-origin: left;
    border-radius: 2px;
  }
  .nav-bar.active .nav-fill {
    animation: fill-bar 5s linear forwards;
  }
  @keyframes fill-bar {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }

  .confetti-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 50;
    overflow: hidden;
  }
  .confetti-piece {
    position: absolute;
    width: 8px;
    height: 8px;
    background: var(--color);
    border-radius: 2px;
    left: var(--x);
    top: var(--y);
    transform: scale(var(--s)) rotate(var(--r));
    animation: confetti-fall 1.2s ease-out var(--d) forwards;
    opacity: 0;
  }
  @keyframes confetti-fall {
    0% { opacity: 1; transform: scale(var(--s)) rotate(0deg) translateY(0); }
    100% { opacity: 0; transform: scale(0) rotate(var(--r)) translateY(80px); }
  }

  .right-col {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .momo-card {
    background: #ffcb05;
    border-radius: 24px;
    padding: 18px 18px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    min-height: 150px;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .momo-card:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 8px 24px rgba(255,203,5,0.3);
  }
  .momo-card::after {
    content: '';
    position: absolute;
    right: -36px; bottom: -36px;
    width: 130px; height: 130px;
    border: 28px solid rgba(0,0,0,0.05);
    border-radius: 50%;
    pointer-events: none;
    animation: decor-spin 20s linear infinite;
  }
  @keyframes decor-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .momo-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .momo-brand {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .momo-dot {
    width: 6px; height: 6px;
    background: #1a0e00;
    border-radius: 50%;
    opacity: 0.5;
    animation: pulse-dot 2s ease-in-out infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.3); }
  }
  .momo-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(26,14,0,0.55);
  }
  .cashback-tag {
    background: #1a0e00;
    color: #ffcb05;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 100px;
    letter-spacing: 0.02em;
  }

  .momo-body { flex: 1; }

  .momo-headline {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: #1a0e00;
    line-height: 1.1;
    margin-bottom: 7px;
    letter-spacing: -0.02em;
  }
  .momo-sub {
    font-size: 10px;
    color: rgba(26,14,0,0.55);
    font-weight: 400;
    line-height: 1.55;
  }

  .momo-btn {
    background: #1a0e00;
    color: #ffcb05;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 10px 14px;
    border: none;
    border-radius: 100px;
    cursor: pointer;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
    position: relative;
    overflow: hidden;
  }
  .momo-btn:hover { background: #2e1e00; transform: translateY(-1px); }
  .momo-btn:active { transform: scale(0.97); }
  .momo-btn.activated {
    background: #14532d;
    color: #fff;
    animation: success-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes success-pop {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  .flash-strip {
    background: #111;
    border-radius: 20px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    transition: transform 0.3s ease;
  }
  .flash-strip:hover {
    transform: scale(1.01);
  }

  .flash-header {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .flash-eyebrow {
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 800;
    color: #fff;
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    gap: 6px;
    text-transform: uppercase;
  }
  .flash-pulse {
    display: inline-block;
    width: 7px; height: 7px;
    background: #f43f5e;
    border-radius: 50%;
    animation: flash-blink 1.2s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes flash-blink {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }

  .flash-sub {
    font-size: 9px;
    color: rgba(255,255,255,0.35);
    font-weight: 500;
    letter-spacing: 0.04em;
  }

  .flash-timer {
    display: flex;
    align-items: center;
    gap: 3px;
  }
  .t-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 5px 8px;
    min-width: 36px;
  }
  .t-num {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 800;
    color: #fff;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
  }
  .t-label {
    font-size: 7px;
    color: rgba(255,255,255,0.3);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-top: 2px;
  }
  .t-sep {
    color: rgba(255,255,255,0.2);
    font-size: 14px;
    font-weight: 700;
    padding-bottom: 10px;
    margin: 0 1px;
  }

  .activity-bar {
    grid-column: 1 / -1;
    background: #f5f4f0;
    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 14px;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    overflow: hidden;
  }

  .live-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    background: #fff;
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 100px;
    padding: 3px 8px 3px 6px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #111;
    flex-shrink: 0;
  }
  .live-dot {
    width: 6px; height: 6px;
    background: #4ade80;
    border-radius: 50%;
    animation: blink 1.4s ease-in-out infinite;
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.25; }
  }

  .activity-ticker {
    flex: 1;
    overflow: hidden;
    height: 16px;
    position: relative;
  }
  .ticker-text {
    position: absolute;
    white-space: nowrap;
    font-size: 11px;
    color: #666;
    font-weight: 400;
    animation: scroll-left 36s linear infinite;
  }
  @keyframes scroll-left {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }

  .buyers-live {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    font-weight: 600;
    color: #2d6a2d;
    white-space: nowrap;
  }
</style>
