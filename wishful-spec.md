# Wishful — One-Page Spec (V1)

## 1. One-sentence description
A web app that generates personalised greeting messages for common life events, in the user's chosen tone and language.

## 2. The one user
Me, and people like me — anyone who has ever stared at a blank message box not knowing how to phrase a birthday wish, a condolence note, or a housewarming greeting. Especially useful for messages in a language the sender doesn't write fluently.

## 3. The single core flow
1. User opens the page.
2. User selects an **occasion** from a dropdown (7 options).
3. User selects a **tone** (only tones appropriate for that occasion are shown).
4. User selects a **language** (3 options).
5. User optionally adds **personal details** in a text box (recipient's name, relationship, a memory or detail).
6. User clicks **Generate**.
7. A greeting message appears below within a few seconds.
8. User can copy the message with one click, or click Generate again for a different version.

## 4. The LLM's job in one sentence
Take the selected occasion, tone, language, and optional personal details, and return a single ready-to-send greeting message in the chosen language that sounds natural and culturally appropriate.

## 5. Scope details

**Occasions (7):**
- Birthday
- Anniversary
- Housewarming
- Wedding
- New Baby
- Get-Well-Soon
- Condolence

**Tones (5):**
- Warm / Heartfelt
- Funny
- Formal
- Poetic
- Casual

**Tone-to-occasion rules:**
- **Condolence** → Warm/Heartfelt, Formal, Poetic only (no Funny, no Casual)
- **All other occasions** (including Get-Well-Soon) → all 5 tones available

**Languages (3):**
- English
- Hindi
- Marathi

## 6. What is NOT in V1
- No user accounts, login, or saved history
- No favoriting or saving past messages
- No image or e-card generation — text only
- No emoji suggestions or rich formatting
- No sharing/export buttons (copy-to-clipboard only)
- No bulk generation
- No custom tones beyond the preset 5
- No additional languages beyond the 3
- No native mobile app — responsive web only
- No regenerate-with-edit feature (just regenerate fresh)

## 7. Done-ness definition
Wishful V1 is done when:
- It's deployed to a live URL
- Anyone can visit it on phone or laptop
- All 7 occasions × valid tone combinations × 3 languages produce sensible greetings
- The copy-to-clipboard button works
- I'd be comfortable sending the link to a friend with "try this, it's actually useful"
