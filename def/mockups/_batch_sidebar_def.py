#!/usr/bin/env python3
"""Batch sidebar update: Replace old Definition (D/N/A) + remove View section.

New Definition section: Dashboard, Registry, Lenses.
View section removed (diagram is now a view mode inside Registry).
"""
import os, re

BASE = os.path.dirname(os.path.abspath(__file__))

# ── OLD Definition section (3 items, NO active) ──
OLD_DEF_PLAIN = '''        <div class="nav-section">Definition</div>
        <a class="nav-item" href="../definition/directives-list.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2v20"/><path d="M5 6h11l3 3-3 3H5V6z"/></svg>
          Directives <span class="nav-badge">42</span>
        </a>
        <a class="nav-item" href="../definition/norms-list.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><path d="M9 5a2 2 0 012-2h2a2 2 0 012 2"/><path d="M9 14l2 2 4-4"/></svg>
          Norms <span class="nav-badge">137</span>
        </a>
        <a class="nav-item" href="../definition/ascriptions-list.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/></svg>
          Ascriptions <span class="nav-badge">384</span>
        </a>'''

# ── OLD Definition section variants with active on each item ──
OLD_DEF_DIRECTIVES_ACTIVE = OLD_DEF_PLAIN.replace(
    '<a class="nav-item" href="../definition/directives-list.html">',
    '<a class="nav-item active" href="../definition/directives-list.html">')

OLD_DEF_NORMS_ACTIVE = OLD_DEF_PLAIN.replace(
    '<a class="nav-item" href="../definition/norms-list.html">',
    '<a class="nav-item active" href="../definition/norms-list.html">')

OLD_DEF_ASCRIPTIONS_ACTIVE = OLD_DEF_PLAIN.replace(
    '<a class="nav-item" href="../definition/ascriptions-list.html">',
    '<a class="nav-item active" href="../definition/ascriptions-list.html">')

# ── OLD View section ──
OLD_VIEW = '''        <div class="nav-section">View</div>
        <a class="nav-item" href="../view/diagram-view.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="5" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="M8 5h8M5 8v8M19 8v8M8 19h8"/></svg>
          Diagram View
        </a>'''

OLD_VIEW_ACTIVE = OLD_VIEW.replace(
    '<a class="nav-item" href="../view/diagram-view.html">',
    '<a class="nav-item active" href="../view/diagram-view.html">')

# ── NEW Definition section (template with placeholders) ──
NEW_DEF_TEMPLATE = '''        <div class="nav-section">Definition</div>
        <a class="nav-item{def_dashboard_active}" href="../definition/def-dashboard.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Dashboard
        </a>
        <a class="nav-item{def_registry_active}" href="../definition/registry.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/><circle cx="7" cy="6" r="1.5" fill="currentColor"/><circle cx="7" cy="12" r="1.5" fill="currentColor"/><circle cx="7" cy="18" r="1.5" fill="currentColor"/></svg>
          Registry
        </a>
        <a class="nav-item{def_lenses_active}" href="../definition/lenses.html">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/></svg>
          Lenses
        </a>'''

def make_new_def(active_key=None):
    """Build the new Definition section with optional active item."""
    result = NEW_DEF_TEMPLATE
    for key in ['def_dashboard', 'def_registry', 'def_lenses']:
        token = '{' + key + '_active}'
        result = result.replace(token, ' active' if key == active_key else '')
    return result


# ── Active mapping ──
# Files where active should go to a specific new item
ACTIVE_MAP = {}

# New pages get their own active
ACTIVE_MAP['definition/def-dashboard.html'] = 'def_dashboard'
ACTIVE_MAP['definition/lenses.html'] = 'def_lenses'

# Registry and all detail/create sub-pages get Registry active
for fn in [
    'definition/registry.html',
    'definition/directives-list.html',
    'definition/norms-list.html',
    'definition/ascriptions-list.html',
    'definition/directive-detail.html',
    'definition/directive-history.html',
    'definition/directive-impact.html',
    'definition/directive-norms.html',
    'definition/create-directive.html',
    'definition/create-norm.html',
    'definition/create-structure.html',
    'definition/create-mechanism.html',
    'definition/create-interaction.html',
    'definition/create-archetype.html',
    'definition/ascription-create.html',
    'definition/ascription-transition.html',
    'view/diagram-view.html',
]:
    ACTIVE_MAP[fn] = 'def_registry'


# ── Process files ──
FILES = []
for dirpath, dirnames, filenames in os.walk(BASE):
    rel_dir = os.path.relpath(dirpath, BASE)
    if 'workflows' in rel_dir:
        continue
    for fn in filenames:
        if fn.endswith('.html'):
            FILES.append(os.path.join(dirpath, fn))

updated = 0
skipped = 0
errors = []

for fpath in sorted(FILES):
    with open(fpath, 'r') as f:
        content = f.read()

    rel = os.path.relpath(fpath, BASE)
    active_key = ACTIVE_MAP.get(rel)
    new_def = make_new_def(active_key)
    changed = False

    # --- Replace Definition section ---
    # Try each variant (active on different items, or plain)
    for old_def in [OLD_DEF_DIRECTIVES_ACTIVE, OLD_DEF_NORMS_ACTIVE, OLD_DEF_ASCRIPTIONS_ACTIVE, OLD_DEF_PLAIN]:
        if old_def in content:
            content = content.replace(old_def, new_def)
            changed = True
            break

    # --- Remove View section ---
    for old_view in [OLD_VIEW_ACTIVE, OLD_VIEW]:
        if old_view in content:
            content = content.replace(old_view, '')
            changed = True
            break

    if not changed:
        # Check if already updated or is a placeholder sidebar
        if 'def-dashboard.html' in content or 'app-sidebar__nav"></nav>' in content:
            skipped += 1
        else:
            errors.append(f"WARN: No matching blocks in {rel}")
            skipped += 1
        continue

    with open(fpath, 'w') as f:
        f.write(content)
    updated += 1

for e in errors:
    print(e)
print(f"\nDone: {updated} files updated, {skipped} skipped")
