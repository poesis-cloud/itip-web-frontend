#!/usr/bin/env python3
"""Batch sidebar update: restructure sidebar sections (Deliverables merged into Lenses).

Handles two modes:
  - EXISTING pages: have the full inline sidebar → regex-replace sections
  - PLACEHOLDER pages: have <!-- SIDEBAR_PLACEHOLDER --> → inject full sidebar
"""
import re, os, glob

MOCKUPS = "/home/clem/repositories/poesis/itip-ui/def/mockups"


# ── Active state mapping: filename → (section, item_label) ──
ACTIVE_MAP = {
    # Overview
    "overview/dashboard.html":           ("overview", "Dashboard"),
    "overview/activity-list.html":       ("overview", "Activity"),
    # Definition
    "definition/def-dashboard.html":     ("definition", "Dashboard"),
    "definition/registry.html":          ("definition", "Registry"),
    # Definition detail/create/etc → Registry active
    "definition/ascription-detail.html":    ("definition", "Registry"),
    "definition/ascription-transition.html":("definition", "Registry"),
    "definition/create-ascription.html":    ("definition", "Registry"),
    "definition/create-structure.html":     ("definition", "Registry"),
    # Lenses (old page → redirect, skip)
    "definition/lenses.html":            ("lenses", "Browse"),
    "lenses/browse.html":               ("lenses", "Browse"),
    "lenses/diagram.html":              ("lenses", "Diagram"),
    # Evaluation
    "evaluation/dashboard.html":          ("evaluation", "Dashboard"),
    "evaluation/findings.html":           ("evaluation", "Findings"),
    "evaluation/findings-dd.html":        ("evaluation", "Findings"),
    "evaluation/findings-dn.html":        ("evaluation", "Findings"),
    "evaluation/findings-nn.html":        ("evaluation", "Findings"),
    "evaluation/findings-na.html":        ("evaluation", "Findings"),
    "evaluation/findings-nx.html":        ("evaluation", "Findings"),
    "evaluation/findings-aa.html":        ("evaluation", "Findings"),
    "evaluation/findings-ac.html":        ("evaluation", "Findings"),
    "evaluation/na-meta.html":            ("evaluation", "Dashboard"),
    "evaluation/na-gov.html":             ("evaluation", "Dashboard"),
    "evaluation/nx-meta.html":            ("evaluation", "Dashboard"),
    "evaluation/nx-gov.html":             ("evaluation", "Dashboard"),
    "evaluation/dd-dashboard.html":       ("evaluation", "Dashboard"),
    "evaluation/dn-dashboard.html":       ("evaluation", "Dashboard"),
    "evaluation/nn-dashboard.html":       ("evaluation", "Dashboard"),
    "evaluation/aa-dashboard.html":       ("evaluation", "Dashboard"),
    "evaluation/ac-dashboard.html":       ("evaluation", "Dashboard"),
    # Impact / Simulation
    "impact/cascade.html":               ("simulation", "Impact Analysis"),
    # Review
    "review/review-board.html":          ("review", "Review Board"),
    "review/review-session.html":        ("review", "Sessions"),
    "review/review-history.html":        ("review", "History"),
    # Truth Sourcing
    "truth-sourcing/sources-list.html":  ("truth-sourcing", "Sources"),
    "truth-sourcing/sync-jobs.html":     ("truth-sourcing", "Sync Jobs"),
    # Frameworks
    "frameworks/catalog.html":           ("frameworks", "Catalog"),
    "frameworks/framework-detail.html":  ("frameworks", "Catalog"),
    "frameworks/stack-composer.html":    ("frameworks", "Stack Composer"),
    # Admin
    "admin/users.html":                  ("admin", "Users"),
    "admin/integrations.html":           ("admin", "Integrations"),
    # View (legacy — diagram now in Lenses)
    "view/diagram-view.html":            ("lenses", "Diagram"),
    # Compliance
    "compliance/compliance-dashboard.html": ("evaluation", "Dashboard"),
    # Workflows
    "workflows/workflow-list.html":      ("admin", "Users"),
}


def active_class(filepath, target_section, target_label):
    """Return ' active' if this filepath should be active for the given nav item."""
    rel = os.path.relpath(filepath, MOCKUPS)
    section, label = ACTIVE_MAP.get(rel, ("", ""))
    if section == target_section and label == target_label:
        return " active"
    return ""


def build_sidebar(filepath):
    """Build the full sidebar nav HTML with correct active state for this file."""
    a = lambda sec, lbl: active_class(filepath, sec, lbl)

    return f'''        <div class="nav-section">Overview</div>
        <a class="nav-item{a('overview','Dashboard')}" href="../overview/dashboard.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Dashboard
        </a>
        <a class="nav-item{a('overview','Activity')}" href="../overview/activity-list.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Activity
        </a>
        <div class="nav-section">Evaluation</div>
        <a class="nav-item{a('evaluation','Dashboard')}" href="../evaluation/dashboard.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          Dashboard
        </a>
        <a class="nav-item{a('evaluation','Findings')}" href="../evaluation/findings.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          Findings
        </a>
        <div class="nav-section">Definition</div>
        <a class="nav-item{a('definition','Dashboard')}" href="../definition/def-dashboard.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Dashboard
        </a>
        <a class="nav-item{a('definition','Registry')}" href="../definition/registry.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/><circle cx="7" cy="6" r="1.5" fill="currentColor"/><circle cx="7" cy="12" r="1.5" fill="currentColor"/><circle cx="7" cy="18" r="1.5" fill="currentColor"/></svg>
          Registry
        </a>
        <div class="nav-section">Frameworks</div>
        <a class="nav-item{a('frameworks','Catalog')}" href="../frameworks/catalog.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
          Catalog <span class="nav-badge">5</span>
        </a>
        <a class="nav-item{a('frameworks','Stack Composer')}" href="../frameworks/stack-composer.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>
          Stack Composer
        </a>
        <div class="nav-section">Lenses</div>
        <a class="nav-item{a('lenses','Browse')}" href="../lenses/browse.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/></svg>
          Browse
        </a>
        <a class="nav-item{a('lenses','Diagram')}" href="../lenses/diagram.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          Diagram
        </a>
        <div class="nav-section">Simulation</div>
        <a class="nav-item{a('simulation','Impact Analysis')}" href="../impact/cascade.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v3m0 4.5V12m0 4.5V18m0 3v-1.5"/><circle cx="12" cy="12" r="2"/><path d="M12 14l5 4M12 14l-5 4M12 10l5-4M12 10l-5-4"/></svg>
          Impact Analysis
        </a>
        <div class="nav-section">Review</div>
        <a class="nav-item{a('review','Review Board')}" href="../review/review-board.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          Review Board
        </a>
        <a class="nav-item{a('review','Sessions')}" href="../review/review-session.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          Sessions
        </a>
        <a class="nav-item{a('review','History')}" href="../review/review-history.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><path d="M2.05 12A10 10 0 0112 2"/></svg>
          History
        </a>
        <div class="nav-section">Truth Sourcing</div>
        <a class="nav-item{a('truth-sourcing','Sources')}" href="../truth-sourcing/sources-list.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          Sources
        </a>
        <a class="nav-item{a('truth-sourcing','Sync Jobs')}" href="../truth-sourcing/sync-jobs.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          Sync Jobs
        </a>
        <div class="nav-section">Admin</div>
        <a class="nav-item{a('admin','Users')}" href="../admin/users.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Users
        </a>
        <a class="nav-item{a('admin','Integrations')}" href="../admin/integrations.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
          Integrations
        </a>'''


def process_placeholder(filepath):
    """Replace <!-- SIDEBAR_PLACEHOLDER --> with full sidebar nav."""
    with open(filepath, "r") as f:
        content = f.read()

    if "<!-- SIDEBAR_PLACEHOLDER -->" not in content:
        return False

    sidebar = build_sidebar(filepath)
    content = content.replace("<!-- SIDEBAR_PLACEHOLDER -->", sidebar)
    with open(filepath, "w") as f:
        f.write(content)
    return True


def process_existing(filepath):
    """Replace the full inline sidebar nav content between <nav> tags."""
    with open(filepath, "r") as f:
        content = f.read()

    if "<!-- SIDEBAR_PLACEHOLDER -->" in content:
        return process_placeholder(filepath)

    # Match everything between <nav class="app-sidebar__nav"> and </nav>
    pattern = r'(<nav class="app-sidebar__nav">)\s*(.*?)\s*(</nav>)'
    sidebar = build_sidebar(filepath)

    def replacer(m):
        return m.group(1) + "\n" + sidebar + "\n      " + m.group(3)

    content_new, count = re.subn(pattern, replacer, content, count=1, flags=re.DOTALL)
    if count == 0:
        print(f"  WARN: sidebar nav NOT found in {filepath}")
        return False

    with open(filepath, "w") as f:
        f.write(content_new)
    return True


# ── Main ──
all_html = sorted(glob.glob(f"{MOCKUPS}/**/*.html", recursive=True))

# Skip design system CSS, Python scripts, and the batch scripts themselves
skip_files = {"itip-design-system.css"}

ok = 0
skip = 0
fail = 0

for fp in all_html:
    rel = os.path.relpath(fp, MOCKUPS)
    fname = os.path.basename(fp)

    if fname in skip_files:
        continue

    print(f"[PROC] {rel}  ", end="")

    with open(fp, "r") as f:
        content = f.read()

    if "<!-- SIDEBAR_PLACEHOLDER -->" in content:
        if process_placeholder(fp):
            print("→ placeholder injected")
            ok += 1
        else:
            print("→ FAILED")
            fail += 1
    elif 'class="app-sidebar__nav"' in content:
        if process_existing(fp):
            print("→ sidebar replaced")
            ok += 1
        else:
            print("→ FAILED")
            fail += 1
    else:
        print("→ skipped (no sidebar)")
        skip += 1

print(f"\nDone: {ok} updated, {skip} skipped, {fail} failed")
