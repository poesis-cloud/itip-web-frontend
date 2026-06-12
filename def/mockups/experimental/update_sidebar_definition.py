#!/usr/bin/env python3
"""Batch sidebar update: replace Definition nav items + remove View section."""
import re, os, glob

MOCKUPS = "/home/clem/repositories/poesis/itip-ui/def/mockups"

# ── The NEW Definition section (no active state — added per-file) ──
NEW_DEF_SECTION = '''        <div class="nav-section">Definition</div>
        <a class="nav-item{def_dash_active}" href="../definition/def-dashboard.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"/><path d="M14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z"/><path d="M4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z"/><path d="M14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg>
          Dashboard
        </a>
        <a class="nav-item{registry_active}" href="../definition/registry.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/><circle cx="7" cy="6" r="1.5"/><circle cx="7" cy="12" r="1.5"/><circle cx="7" cy="18" r="1.5"/></svg>
          Registry
        </a>
        <a class="nav-item{lenses_active}" href="../definition/lenses.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          Lenses
        </a>'''

# ── Full sidebar nav content for new pages (no active on non-Definition items) ──
FULL_SIDEBAR_NAV = '''        <div class="nav-section">Overview</div>
        <a class="nav-item" href="../overview/dashboard.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Dashboard
        </a>
        <a class="nav-item" href="../overview/activity-list.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Activity
        </a>
{definition_section}
        <div class="nav-section">Evaluation</div>
        <a class="nav-item" href="../evaluation/dashboard.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          Dashboard
        </a>
        <a class="nav-item" href="../evaluation/findings.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          Findings
        </a>
        <div class="nav-section">Impact Analysis</div>
        <a class="nav-item" href="../impact/cascade.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v3m0 4.5V12m0 4.5V18m0 3v-1.5"/><circle cx="12" cy="12" r="2"/><path d="M12 14l5 4M12 14l-5 4M12 10l5-4M12 10l-5-4"/></svg>
          Cascade Simulator
        </a>
        <div class="nav-section">Review</div>
        <a class="nav-item" href="../review/review-board.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          Review Board
        </a>
        <a class="nav-item" href="../review/review-session.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          Sessions
        </a>
        <a class="nav-item" href="../review/review-history.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><path d="M2.05 12A10 10 0 0112 2"/></svg>
          History
        </a>
        <div class="nav-section">Truth Sourcing</div>
        <a class="nav-item" href="../truth-sourcing/sources-list.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          Sources
        </a>
        <a class="nav-item" href="../truth-sourcing/sync-jobs.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          Sync Jobs
        </a>
        <div class="nav-section">Frameworks</div>
        <a class="nav-item" href="../frameworks/catalog.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
          Catalog <span class="nav-badge">5</span>
        </a>
        <a class="nav-item" href="../frameworks/stack-composer.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>
          Stack Composer
        </a>
        <div class="nav-section">Admin</div>
        <a class="nav-item" href="../admin/users.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Users
        </a>
        <a class="nav-item" href="../admin/integrations.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
          Integrations
        </a>'''


def active_for(filepath):
    """Determine which Definition nav item should be active for this file."""
    fname = os.path.basename(filepath)
    if fname == "def-dashboard.html":
        return " active", "", ""
    elif fname == "registry.html":
        return "", " active", ""
    elif fname == "lenses.html":
        return "", "", " active"
    # Old definition detail/create/list pages → Registry active
    if "/definition/" in filepath and fname not in ("def-dashboard.html", "registry.html", "lenses.html"):
        return "", " active", ""
    return "", "", ""


def make_def_section(filepath):
    d, r, l = active_for(filepath)
    return NEW_DEF_SECTION.format(def_dash_active=d, registry_active=r, lenses_active=l)


def process_existing(filepath):
    """Update an existing file (has old sidebar): replace Definition items, remove View section."""
    with open(filepath, "r") as f:
        content = f.read()

    # 1) Replace old Definition section with new one
    #    Match from <div class="nav-section">Definition</div> through the Ascriptions nav item
    pattern_def = (
        r'<div class="nav-section">Definition</div>\s*'
        r'<a class="nav-item[^"]*" href="[^"]*directives-list\.html">\s*'
        r'<svg[^>]*>.*?</svg>\s*'
        r'Directives\s*<span class="nav-badge">42</span>\s*'
        r'</a>\s*'
        r'<a class="nav-item[^"]*" href="[^"]*norms-list\.html">\s*'
        r'<svg[^>]*>.*?</svg>\s*'
        r'Norms\s*<span class="nav-badge">137</span>\s*'
        r'</a>\s*'
        r'<a class="nav-item[^"]*" href="[^"]*ascriptions-list\.html">\s*'
        r'<svg[^>]*>.*?</svg>\s*'
        r'Ascriptions\s*<span class="nav-badge">384</span>\s*'
        r'</a>'
    )
    new_def = make_def_section(filepath)
    content_new, count = re.subn(pattern_def, new_def, content, flags=re.DOTALL)
    if count == 0:
        print(f"  WARN: Definition section NOT found in {filepath}")
        return False

    # 2) Remove View section entirely
    #    Match from <div class="nav-section">View</div> through the Diagram View nav item
    pattern_view = (
        r'\s*<div class="nav-section">View</div>\s*'
        r'<a class="nav-item[^"]*" href="[^"]*diagram-view\.html">\s*'
        r'<svg[^>]*>.*?</svg>\s*'
        r'Diagram View\s*'
        r'</a>'
    )
    content_new, vcount = re.subn(pattern_view, '', content_new, flags=re.DOTALL)
    if vcount == 0:
        print(f"  WARN: View section NOT found in {filepath}")

    with open(filepath, "w") as f:
        f.write(content_new)
    return True


def process_new_page(filepath):
    """Inject full sidebar nav into a new page with placeholder sidebar."""
    with open(filepath, "r") as f:
        content = f.read()

    def_section = make_def_section(filepath)
    full_nav = FULL_SIDEBAR_NAV.format(definition_section=def_section)

    # Replace empty nav with full nav
    content_new = content.replace(
        '<nav class="app-sidebar__nav"></nav>',
        '<nav class="app-sidebar__nav">\n' + full_nav + '\n      </nav>\n      <div class="app-sidebar__footer">\n        <span>IT Intelligence Platform</span>\n        <span>by <strong>Poesis</strong> &middot; &copy; 2024&ndash;2026</span>\n      </div>'
    )

    with open(filepath, "w") as f:
        f.write(content_new)
    return True


# ── Main ──
existing_files = glob.glob(f"{MOCKUPS}/**/*.html", recursive=True)
new_pages = {
    f"{MOCKUPS}/definition/def-dashboard.html",
    f"{MOCKUPS}/definition/registry.html",
    f"{MOCKUPS}/definition/lenses.html",
}

ok = 0
fail = 0
for fp in sorted(existing_files):
    if fp in new_pages:
        print(f"[NEW]  {os.path.relpath(fp, MOCKUPS)}")
        if process_new_page(fp):
            ok += 1
        else:
            fail += 1
    elif "Directives" in open(fp).read() and "nav-badge" in open(fp).read():
        print(f"[UPD]  {os.path.relpath(fp, MOCKUPS)}")
        if process_existing(fp):
            ok += 1
        else:
            fail += 1

print(f"\nDone: {ok} updated, {fail} failed")
