<!-- routes/refund-and-return-policy/+page.svelte -->
<script>
  import { goto } from "$app/navigation";
</script>

<svelte:head>
  <title>Refund and Return Policy - Postcom</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet" />
</svelte:head>

<div 
  class="max-w-3xl mx-auto py-10 px-4 sm:px-6 select-none text-slate-800"
  style="font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;"
>
  <!-- Navigation Header -->
  <nav class="flex items-center justify-between gap-y-2.5 text-xs font-semibold text-slate-400 border-b border-slate-100 pb-4 mb-8">
    <div class="flex items-center gap-2">
      <a href="/" class="hover:text-slate-900 transition-colors">Catalog</a>
      <svg class="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
      </svg>
      <span class="text-slate-800 font-semibold">Refund & Return Policy</span>
    </div>
    
    <button 
      onclick={() => goto("/")}
      class="flex items-center gap-1.5 text-red-600 hover:text-red-700 transition-colors focus:outline-none cursor-pointer"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
      <span class="font-semibold text-xs">Back to Home</span>
    </button>
  </nav>

  <!-- Content Card -->
  <div class="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs leading-relaxed">
    <div class="space-y-1">
      <span class="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
        SLA Protected
      </span>
      <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-2">Refund & Return Policy</h1>
      <p class="text-xs text-slate-400 font-medium">Last updated: February 2026</p>
    </div>

    <!-- Section 1 -->
    <div class="space-y-2.5">
      <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">1. Purpose & Scope</h3>
      <p class="text-[13px] text-slate-600 font-light">
        This policy establishes a structured and compliant framework for handling product returns, refunds, cancellations, and dispute resolution within the Postcom platform. It complies with applicable laws of the Republic of Uganda including the Consumer Protection Act, Electronic Transactions Act, and Data Protection and Privacy Act (2019). This policy applies to all registered clients and onboarded marketplace vendors.
      </p>
    </div>

    <!-- Section 2 -->
    <div class="space-y-2.5 border-t border-slate-100 pt-4">
      <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">2. Return Eligibility Criteria</h3>
      <p class="text-[13px] text-slate-600 font-light">
        Clients must initiate a return request within <strong>48 hours to 7 days</strong> of delivery, depending on the product category. Items are eligible for return under the following approved conditions:
      </p>
      <ul class="list-disc pl-5 text-[13px] text-slate-600 font-light space-y-1">
        <li>The item arrived damaged at delivery (supported by photo/video evidence).</li>
        <li>Incorrect specifications, model, size, or incorrect product delivered.</li>
        <li>Defective product discovered within the return eligibility window.</li>
        <li>Incomplete orders or missing items.</li>
        <li>Change-of-mind (only if the Vendor listing expressly permits and the item is completely unused, sealed, and in its original intact packaging).</li>
      </ul>
    </div>

    <!-- Section 3 -->
    <div class="space-y-2.5 border-t border-slate-100 pt-4">
      <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">3. Non-Returnable Items</h3>
      <p class="text-[13px] text-slate-600 font-light">
        The following categories are strictly excluded from returns and refunds due to safety and health regulations:
      </p>
      <ul class="list-disc pl-5 text-[13px] text-slate-600 font-light space-y-1">
        <li>Perishable agricultural produce and fresh goods.</li>
        <li>Opened personal care, cosmetics, or wellness products.</li>
        <li>Custom-made, tailored, or personalized items.</li>
        <li>Digital vouchers, tokens, and virtual goods.</li>
        <li>Items clearly marked as <strong>Final Sale</strong> at the time of purchase.</li>
      </ul>
    </div>

    <!-- Section 4 -->
    <div class="space-y-2.5 border-t border-slate-100 pt-4">
      <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">4. Return & Refund Service Level Agreements (SLAs)</h3>
      <p class="text-[13px] text-slate-600 font-light">
        To protect shoppers and maintain trust, all parties must adhere to the following strict timelines:
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase">Client Initiation Window</p>
          <p class="font-bold text-slate-900">48 Hours to 7 Days</p>
        </div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase">Vendor Acknowledgment SLA</p>
          <p class="font-bold text-slate-900">24 Hours</p>
        </div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase">Vendor Decision (Approve/Reject)</p>
          <p class="font-bold text-slate-900">72 Hours</p>
        </div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase">Refund Processing SLA</p>
          <p class="font-bold text-slate-900">3 Days (Wallet) / 7 Days (Card/Bank)</p>
        </div>
      </div>
    </div>

    <!-- Section 5 -->
    <div class="space-y-2.5 border-t border-slate-100 pt-4">
      <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">5. Financial Fee Structures & Logistics</h3>
      <ul class="list-disc pl-5 text-[13px] text-slate-600 font-light space-y-1.5">
        <li><strong>Vendor Fault:</strong> If a return is due to vendor fault (damaged, incorrect, or defective), the Vendor bears the full logistical postage cost.</li>
        <li><strong>Client Choice:</strong> If a return is initiated due to a change-of-mind, the Client bears the return logistics and postal dispatch fee.</li>
        <li><strong>SLA Breach Penalties:</strong> Failure by a Vendor to process return approvals within SLA timelines may attract a penalty of 5% of the order value per delayed day (capped at 20%).</li>
        <li><strong>Fraud Mitigation:</strong> Repeated SLA breaches by a Vendor can result in temporary store suspension. Conversely, fraudulent return claims by Clients may result in account termination and forfeiture of refund rights.</li>
      </ul>
    </div>

    <!-- Contact Support Footer -->
    <div class="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h4 class="text-xs font-bold text-slate-900 uppercase">Need to initiate a return?</h4>
        <p class="text-[11px] text-slate-400 font-medium">Reach out to our centralized ePosta GPO desk for tracking support.</p>
      </div>
      <a 
        href="/account/help" 
        class="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold h-9 px-4 rounded-full flex items-center justify-center transition-colors cursor-pointer"
      >
        Contact Help Center
      </a>
    </div>
  </div>
</div>