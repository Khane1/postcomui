<!-- src/lib/components/AdBanners.svelte -->
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

  function goSlide(n) {
    currentSlide = ((n % slides.length) + slides.length) % slides.length;
  }

  function handleSlideClick() {
    goSlide(currentSlide + 1);
  }

  function handleCTA(e, coupon) {
    e.stopPropagation();
    onClaimCoupon?.(coupon);
  }

  function handleMoMo(e) {
    e.stopPropagation();
    if (momoActivated) return;
    momoActivated = true;
    onClaimCoupon?.('MOMOSAVE');
    setTimeout(() => { momoActivated = false; }, 2500);
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  $effect(() => {
    if (!browser) return;

    const autoPlay = setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
    }, 4500);

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
    style="background:{slides[currentSlide].bg}"
    role="button"
    tabindex="0"
    onclick={handleSlideClick}
    onkeydown={(e) => e.key === 'Enter' && handleSlideClick()}
    aria-label="Browse deals carousel"
  >
    <!-- Decorative circle bg -->
    <div class="hero-circle"></div>

    {#each slides as slide, i}
      <div class="slide" class:active={i === currentSlide} aria-hidden={i !== currentSlide}>

        <div class="slide-content">
          <span class="eyebrow">{slide.eyebrow}</span>
          <div class="headline">
            {#each slide.headline as line}<div>{line}</div>{/each}
          </div>
          <p class="slide-sub">{slide.sub}</p>
          <button class="slide-cta" onclick={(e) => handleCTA(e, slide.coupon)}>
            {slide.cta} ›
          </button>
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

        <div class="disc-badge" style="background:{slide.badgeBg}">{slide.badge}</div>
        <span class="tctext">T&Cs Apply</span>
      </div>
    {/each}

    <div class="slide-dots">
      {#each slides as _, i}
        <button
          class="dot"
          class:active={i === currentSlide}
          onclick={(e) => { e.stopPropagation(); goSlide(i); }}
          aria-label="Go to slide {i + 1}"
        ></button>
      {/each}
    </div>
  </div>

  <!-- RIGHT COLUMN -->
  <div class="right-col">

    <div class="momo-card">
      <div>
        <div class="momo-label">MTN MoMo · Exclusive</div>
        <div class="momo-headline">Pay MoMo,<br />Get Cash-Back</div>
        <div class="cashback-tag">+1,500 UGX back</div>
        <p class="momo-sub">Instant credit on every order paid with your MTN Mobile Money wallet.</p>
      </div>
      <button class="momo-btn" class:activated={momoActivated} onclick={handleMoMo}>
        {momoActivated ? '✓ MOMOSAVE Activated!' : 'Activate — MOMOSAVE'}
      </button>
    </div>

    <div class="flash-strip">
      <div class="flash-left">
        <div class="flash-icon">⚡</div>
        <div>
          <div class="flash-label">Flash Sale</div>
          <div class="flash-sub">Limited batches left</div>
        </div>
      </div>
      <div class="flash-timer">
        <div class="t-box"><span>{pad(hours)}</span><small>hrs</small></div>
        <div class="t-colon">:</div>
        <div class="t-box"><span>{pad(minutes)}</span><small>min</small></div>
        <div class="t-colon">:</div>
        <div class="t-box"><span>{pad(seconds)}</span><small>sec</small></div>
      </div>
    </div>

  </div>

  <!-- LIVE ACTIVITY BAR -->
  <div class="activity-bar">
    <div class="live-dot"></div>
    <div class="activity-label">Live</div>
    <div class="activity-ticker">
      <div class="ticker-text">{tickerText}</div>
    </div>
    <div class="buyers-live">{buyersCount.toLocaleString()} shopping</div>
  </div>

</div>

<style>
  *, *::before, *::after { box-sizing: border-box; }

  .banners-wrap {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: 12px;
    padding: 4px 0;
    font-family: Arial, Helvetica, sans-serif;
  }

  @media (max-width: 640px) {
    .banners-wrap { grid-template-columns: 1fr; }
  }

  /* HERO */
  .hero {
    position: relative;
    overflow: hidden;
    min-height: 290px;
    border-radius: 20px;
    cursor: pointer;
    transition: background 0.6s ease;
    user-select: none;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.13);
  }

  .hero-circle {
    position: absolute;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.07);
    right: -60px;
    top: -80px;
    pointer-events: none;
  }

  .slide {
    position: absolute;
    inset: 0;
    display: flex;
    opacity: 0;
    transition: opacity 0.55s ease;
    pointer-events: none;
  }

  .slide.active {
    opacity: 1;
    pointer-events: auto;
  }

  .slide-content {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 54%;
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    z-index: 2;
  }

  .eyebrow {
    background: rgba(0, 0, 0, 0.2);
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 20px;
    display: inline-block;
    margin-bottom: 10px;
    width: fit-content;
  }

  .headline {
    font-size: clamp(24px, 3.5vw, 34px);
    font-weight: 900;
    color: #fff;
    line-height: 1;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: -.5px;
    text-shadow: 0 2px 8px rgba(0,0,0,0.18);
  }

  .slide-sub {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.88);
    margin-bottom: 18px;
    line-height: 1.5;
    font-weight: 600;
  }

  .slide-cta {
    background: #fff;
    color: #222;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .06em;
    padding: 9px 20px;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    width: fit-content;
    transition: background .1s, transform .1s;
    box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  }

  .slide-cta:hover { background: #f0f0f0; }
  .slide-cta:active { transform: scale(.97); }

  /* Product images area */
  .slide-imgs {
    position: absolute;
    right: 0; top: 0; bottom: 0;
    width: 50%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 6px;
    padding: 12px 14px 0 0;
    overflow: hidden;
  }

  .slide-imgs img {
    flex-shrink: 0;
    animation: float 3.5s ease-in-out infinite;
    box-shadow: 0 8px 24px rgba(0,0,0,0.22);
  }

  .slide-imgs img:nth-child(2) { animation-delay: .3s; }
  .slide-imgs img:nth-child(3) { animation-delay: .6s; }

  @keyframes float {
    0%, 100% { transform-origin: bottom center; }
    50% { margin-bottom: 8px; }
  }

  .disc-badge {
    position: absolute;
    top: 14px; right: 14px;
    color: #fff;
    font-size: 13px;
    font-weight: 900;
    width: 50px; height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2.5px solid rgba(255, 255, 255, 0.35);
    z-index: 10;
    line-height: 1;
    box-shadow: 0 2px 10px rgba(0,0,0,0.25);
  }

  .tctext {
    position: absolute;
    bottom: 10px; left: 16px;
    font-size: 9px;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 600;
    z-index: 10;
  }

  .slide-dots {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 5px;
    z-index: 20;
  }

  .dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    border: none;
    cursor: pointer;
    padding: 0;
    transition: all .25s;
  }

  .dot.active {
    background: #fff;
    width: 22px;
    border-radius: 4px;
  }

  /* RIGHT COL */
  .right-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* MoMo */
  .momo-card {
    background: #ffcb05;
    border-radius: 20px;
    padding: 18px 16px;
    position: relative;
    overflow: hidden;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 140px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.09);
  }

  .momo-card::before {
    content: '';
    position: absolute;
    right: -28px; top: -28px;
    width: 120px; height: 120px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 50%;
    pointer-events: none;
  }

  .momo-card::after {
    content: '';
    position: absolute;
    right: 20px; bottom: -40px;
    width: 90px; height: 90px;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 50%;
    pointer-events: none;
  }

  .momo-label {
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .1em;
    color: #3d2e00;
    background: rgba(0, 0, 0, 0.1);
    padding: 3px 8px;
    border-radius: 20px;
    width: fit-content;
    margin-bottom: 5px;
  }

  .momo-headline {
    font-size: 17px;
    font-weight: 900;
    color: #1a0e00;
    line-height: 1.15;
    margin-bottom: 6px;
  }

  .cashback-tag {
    background: #1a0e00;
    color: #ffcb05;
    font-size: 13px;
    font-weight: 900;
    padding: 4px 12px;
    border-radius: 20px;
    display: inline-block;
    margin-bottom: 7px;
    width: fit-content;
  }

  .momo-sub {
    font-size: 10px;
    color: #4a3800;
    font-weight: 600;
    line-height: 1.5;
    margin-bottom: 12px;
  }

  .momo-btn {
    background: #1a0e00;
    color: #ffcb05;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .06em;
    padding: 9px 12px;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    width: 100%;
    transition: background .15s, color .15s;
  }

  .momo-btn:hover { background: #2e1e00; }
  .momo-btn.activated { background: #14532d; color: #fff; }

  /* Flash strip */
  .flash-strip {
    background: #c0392b;
    border-radius: 20px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }

  .flash-left { display: flex; align-items: center; gap: 10px; }

  .flash-icon {
    background: #fff;
    color: #c0392b;
    font-size: 14px;
    font-weight: 900;
    width: 30px; height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .flash-label {
    color: #fff;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .06em;
    line-height: 1.3;
  }

  .flash-sub { color: rgba(255, 255, 255, 0.65); font-size: 9px; font-weight: 600; }

  .flash-timer { display: flex; gap: 4px; align-items: center; }

  .t-box {
    background: rgba(0, 0, 0, 0.25);
    border-radius: 8px;
    padding: 4px 7px;
    text-align: center;
    min-width: 34px;
  }

  .t-box span {
    display: block;
    color: #fff;
    font-size: 15px;
    font-weight: 900;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .t-box small {
    display: block;
    color: rgba(255, 255, 255, 0.5);
    font-size: 7px;
    text-transform: uppercase;
    letter-spacing: .06em;
  }

  .t-colon {
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
    font-weight: 900;
    padding-bottom: 9px;
  }

  /* Activity bar */
  .activity-bar {
    grid-column: 1 / -1;
    background: #1e1e1e;
    border-radius: 16px;
    padding: 9px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  .live-dot {
    width: 8px; height: 8px;
    background: #4ade80;
    border-radius: 50%;
    flex-shrink: 0;
    animation: blink 1.4s infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: .2; }
  }

  .activity-label {
    color: #555;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
    flex-shrink: 0;
  }

  .activity-ticker {
    flex: 1;
    overflow: hidden;
    height: 18px;
    position: relative;
  }

  .ticker-text {
    position: absolute;
    white-space: nowrap;
    font-size: 11px;
    color: #aaa;
    font-weight: 500;
    animation: scroll-left 36s linear infinite;
  }

  @keyframes scroll-left {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }

  .buyers-live {
    flex-shrink: 0;
    color: #4ade80;
    font-size: 10px;
    font-weight: 700;
    white-space: nowrap;
  }
</style>