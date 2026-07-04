<!-- src/lib/components/FilterSidebar.svelte -->
<script>
  import { appState } from '$lib/state.svelte.js';

  /**
   * Props (all bindable so the parent can two-way bind)
   * ─────────────────────────────────────────────────
   * selectedCategories  string[]   — active category selections
   * maxPrice            number     — current price ceiling
   * onlyInStock         boolean    — stock-only toggle
   * activeFilterCount   number     — read-only, computed by parent
   *
   * Events
   * ──────
   * onReset   () => void           — parent handles full reset
   */

  let {
    selectedCategories = $bindable([]),
    maxPrice           = $bindable(150000),
    onlyInStock        = $bindable(false),
    activeFilterCount  = 0,
    onReset,
  } = $props();

  const categoriesList = [
    "Agro Products",
    "Food & Beverages",
    "Arts & Crafts",
    "Health & Beauty",
  ];

  const categoryIcons = {
    "Agro Products":    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 2c0 0-6 4-6 9a6 6 0 0012 0c0-5-6-9-6-9z"/><path d="M10 11V2"/></svg>`,
    "Food & Beverages": `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 2v6a3 3 0 006 0V2"/><path d="M10 8v10"/></svg>`,
    "Arts & Crafts":    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="3"/><path d="M10 2v3M10 15v3M2 10h3M15 10h3"/></svg>`,
    "Health & Beauty":  `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 17s-7-4.5-7-9a4 4 0 018 0 4 4 0 018 0c0 4.5-7 9-7 9z"/></svg>`,
  };

  function toggleCategory(cat) {
    if (selectedCategories.includes(cat)) {
      selectedCategories = selectedCategories.filter(c => c !== cat);
    } else {
      selectedCategories = [...selectedCategories, cat];
    }
  }

  function clearCategories() {
    selectedCategories = [];
  }
</script>

<!-- Categories -->
<div class="fs-section">
  <div class="fs-head">
    <span class="fs-title">Categories</span>
    {#if selectedCategories.length > 0}
      <button class="fs-clear" onclick={clearCategories}>Clear</button>
    {/if}
  </div>
  <div class="cat-list">
    {#each categoriesList as cat}
      {@const active = selectedCategories.includes(cat) || appState.selectedCategory === cat}
      <button
        class="cat-item"
        class:cat-active={active}
        onclick={() => toggleCategory(cat)}
      >
        <span class="cat-icon">{@html categoryIcons[cat]}</span>
        <span class="cat-label">{cat}</span>
        {#if active}
          <svg class="cat-check" width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M4 10l4.5 4.5L16 6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {/if}
      </button>
    {/each}
  </div>
</div>

<!-- Price -->
<div class="fs-section">
  <div class="fs-head">
    <span class="fs-title">Price Limit</span>
    <span class="price-val">{maxPrice.toLocaleString()} <small>UGX</small></span>
  </div>
  <div class="slider-wrap">
    <input
      type="range"
      min="9500"
      max="150000"
      step="500"
      bind:value={maxPrice}
      class="price-slider"
    />
    <div class="slider-labels">
      <span>9,500</span>
      <span>150,000</span>
    </div>
  </div>
</div>

<!-- Availability -->
<div class="fs-section">
  <div class="fs-head">
    <span class="fs-title">Availability</span>
  </div>
  <button class="toggle-row" onclick={() => onlyInStock = !onlyInStock}>
    <span class="toggle-label">In Stock Only</span>
    <span class="toggle-switch" class:on={onlyInStock}>
      <span class="toggle-thumb"></span>
    </span>
  </button>
</div>

<!-- Reset -->
{#if activeFilterCount > 0}
  <button class="reset-btn" onclick={onReset}>
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 4l12 12M16 4L4 16" stroke-linecap="round"/>
    </svg>
    Reset all filters
  </button>
{/if}

<div class="fs-note">Results update live as you adjust filters.</div>

<style>
  /* ── Section shell ─────────────────────────── */
  .fs-section {
    padding: 18px 0;
    border-bottom: 1px solid var(--line);
  }
  .fs-section:first-child { padding-top: 4px; }
  .fs-section:last-of-type { border-bottom: none; }

  .fs-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .fs-title {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--ink-3);
  }
  .fs-clear {
    font-size: 10px;
    font-weight: 700;
    color: var(--brand);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
  }
  .fs-clear:hover { text-decoration: underline; }

  /* ── Category list ─────────────────────────── */
  .cat-list { display: flex; flex-direction: column; gap: 2px; }

  .cat-item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    transition: background 0.12s;
    color: var(--ink-2);
    font-size: 13px;
    font-weight: 500;
    width: 100%;
  }
  .cat-item:hover { background: var(--surface); }
  .cat-item.cat-active {
    background: var(--brand-dim);
    color: var(--brand);
    font-weight: 700;
  }

  .cat-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.55;
  }
  .cat-item.cat-active .cat-icon { opacity: 1; }
  .cat-icon :global(svg) { width: 100%; height: 100%; }

  .cat-label { flex: 1; }
  .cat-check { margin-left: auto; flex-shrink: 0; color: var(--brand); }

  /* ── Price slider ──────────────────────────── */
  .slider-wrap { display: flex; flex-direction: column; gap: 8px; }

  .price-val {
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
  }
  .price-val small {
    font-size: 10px;
    font-weight: 600;
    color: var(--ink-3);
    margin-left: 2px;
  }

  .price-slider {
    width: 100%;
    height: 3px;
    appearance: none;
    background: linear-gradient(
      to right,
      var(--brand) 0%,
      var(--brand) calc((var(--maxPrice, 150000) - 9500) / (150000 - 9500) * 100%),
      var(--line)  calc((var(--maxPrice, 150000) - 9500) / (150000 - 9500) * 100%)
    );
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }
  .price-slider::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--white);
    border: 2px solid var(--brand);
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
    cursor: pointer;
    transition: transform 0.15s;
  }
  .price-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
  .price-slider::-moz-range-thumb {
    width: 16px; height: 16px;
    border-radius: 50%;
    background: var(--white);
    border: 2px solid var(--brand);
    cursor: pointer;
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: var(--ink-4);
    font-weight: 600;
  }

  /* ── Toggle ────────────────────────────────── */
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: none;
    border: none;
    font-family: inherit;
    cursor: pointer;
    width: 100%;
    padding: 4px 0;
  }
  .toggle-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--ink-2);
  }
  .toggle-switch {
    width: 36px;
    height: 20px;
    border-radius: 10px;
    background: var(--line);
    position: relative;
    flex-shrink: 0;
    transition: background 0.2s;
  }
  .toggle-switch.on { background: var(--brand); }
  .toggle-thumb {
    position: absolute;
    top: 3px; left: 3px;
    width: 14px; height: 14px;
    border-radius: 50%;
    background: var(--white);
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    transition: transform 0.2s cubic-bezier(0.4,0,0.2,1);
  }
  .toggle-switch.on .toggle-thumb { transform: translateX(16px); }

  /* ── Reset btn ─────────────────────────────── */
  .reset-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 16px;
    background: none;
    border: 1px solid var(--line);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    font-size: 11px;
    font-weight: 700;
    font-family: inherit;
    color: var(--ink-3);
    cursor: pointer;
    width: 100%;
    justify-content: center;
    transition: border-color 0.15s, color 0.15s;
  }
  .reset-btn:hover { border-color: var(--brand); color: var(--brand); }

  /* ── Footer note ───────────────────────────── */
  .fs-note {
    margin-top: 20px;
    font-size: 10px;
    color: var(--ink-4);
    line-height: 1.6;
  }
</style>