# Universal admin — Client panel

Attach: none required

Covers `/panel`. Available at every tier. This is the screen that keeps support load off you — if
the owner can change their own phone number and add their own project photos, they don't message
you to do it.

Paste `00-universal-system.md` first, then this:

```
Design the CLIENT PANEL — where the studio owner edits their own website content.

THE SCOPE RULE, which the design must make obvious without stating it: content is theirs, structure
is ours. They can change what the site says. They cannot change how it's laid out, what colours it
uses, or which pages exist. There must be no control anywhere on this screen that could break the
site's design.

HEADER: client logo + studio name left, "View my site ↗" link right.

EDITABLE SECTIONS, as a vertical stack of cards — each collapsed to a summary row by default,
expanding when tapped:

1. CONTACT DETAILS
   - Phone number, WhatsApp number, email, address, working hours
   - A note under the WhatsApp field: "This is where enquiries from your site will arrive."

2. HERO IMAGE
   - Current image shown as a thumbnail
   - "Replace photo" button, with visible upload progress and the new image appearing when done

3. PROJECTS
   - A reorderable list of project cards: thumbnail, title, location
   - Each row has edit and delete; drag handle to reorder
   - "Add a project" primary button
   - The add/edit form asks for: title, location, room type, budget range, duration, photos,
     description, and an optional client quote
   - Under the description field, a hint: "Around 300 words works best — what the client wanted,
     what you did, how it turned out."

4. ABOUT TEXT
   - A plain textarea with the current text, character count beneath

5. SERVICES
   - A simple list, each with a title, one-line description, optional "from ₹X" price
   - Add / remove / reorder

6. TESTIMONIALS
   - Quote, name, area. Add / remove / reorder

7. INSTAGRAM POSTS
   - Six slots for post links, with thumbnails once fetched
   - A note: "Update these when you post something new — it shows visitors you're active."

SAVING: a sticky bottom bar on mobile appearing as soon as anything changes — "Save changes"
primary button plus "Discard". After saving, a clear confirmation with the time: "Saved. Your site
updates in about a minute."

EMPTY STATES: for projects, services and testimonials, when the list is empty, show what to do —
e.g. "No projects yet. Add your first one — this is the part visitors look at most."

Show mobile (390px) primarily, desktop secondarily.

ANTI-GOALS: no colour pickers, no font controls, no layout or template switcher, no drag-and-drop
page builder, no HTML/markdown editor, no dense settings table, no icon without a label, no
ambiguous save state, no "advanced" section. Every one of those either breaks the site or scares
this user.
```
