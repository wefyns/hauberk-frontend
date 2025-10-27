/**
 * Application routes
 */
export const Pages = {
  Home: '/home/:orgId',
  Login: '/login',
  Root: '/',
  ResetPassword: '/reset-password',
  ResetPasswordConfirm: '/reset-password/confirm',
  Onboarding: '/onboarding',
  LicenseAgreement: '/onboarding/license-agreement',
  SetEmailPassword: '/onboarding/set-credentials',
  VerifyCode: '/onboarding/verify-code',
  OnboardingSuccess: '/onboarding/success',
  Organizations: '/organizations',
  CreateOrganization: '/organizations/create',
  Agents: '/home/:orgId/agents',
  Secrets: '/home/:orgId/secrets',
  ResetPasswordConfirmInner: 'reset-password/confirm',
};

/**
 * Route paths with parameters
 */
export const RoutePaths = {
  ...Pages,
};