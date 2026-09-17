export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'missing-code': 'That link looks incomplete. Request a new one below.',
  'link-expired': 'That link has expired or was already used. Request a fresh link below.',
  'auth-pkce': 'This link was opened in a different browser or device. Request a new link and open it in the same browser where you entered your email.',
  'auth-invalid': 'That sign-in link was invalid or incomplete. Request a new link below.',
  'auth-unreachable': 'The sign-in service is temporarily unavailable. Wait a moment and request a new link.',
  'no-email': 'Something went wrong on our side. Request a new link below.',
  'no-tenant': 'This email is not linked to a studio yet. You can still explore the platform demo.',
  'wrong-tenant': 'This email is linked to more than one studio. Contact the team so we can route you safely.',
  'retired-tenant': 'This workspace link is no longer active. Sign in again to continue.',
}
