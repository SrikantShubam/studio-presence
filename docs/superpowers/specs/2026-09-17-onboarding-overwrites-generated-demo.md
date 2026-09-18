# Onboarding Overwrites the Generated Demo

Date: 2026-09-17
Status: Conversation clarification

This is a follow-up to the cold-call gate clarification. Older documents remain
unchanged.

## Confirmed behavior

The cold-call demo is an AI-generated sales snapshot. It may contain only the
facts/assets that were available during generation, such as:

- logo, when publicly available or supplied;
- studio name;
- phone/mobile number;
- basic business details;
- approved images and other verified content.

It is not the completed customer website or the customer's final dashboard
state.

When the prospect logs in and completes onboarding:

1. The onboarding flow becomes the authoritative source for the user's initial
   studio setup.
2. The onboarding data supersedes/overwrites the earlier AI-generated demo
   snapshot rather than requiring the prospect to reconcile two competing
   versions.
3. Onboarding remains intentionally minimal and gives setup guidance about
   what can be completed later.
4. The sales person can then finish the paid setup by collecting the full
   content questionnaire and phone photographs/assets, logging in with the
   customer's authorization, and entering the remaining content.
5. The customer is not expected to perform a full website build merely because
   they paid for the service.

This is a content replacement boundary, not a second onboarding system.

## Remaining questions

The latest clarification answers the generated-content question but does not
fully determine the URL behavior:

1. After onboarding overwrites the generated demo, does the original
   cold-call URL remain the user's preview URL, or is a new hostname generated
   from the onboarding studio name?

2. If an already-authenticated user opens a cold-call URL, should the app show
   the public demo first, or route directly to that user's workspace?

Until these are decided, the implementation should not silently change or
redirect hostnames.
