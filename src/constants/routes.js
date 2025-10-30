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
  CreateOrganization: '/create-organization',
  Organizations: '/home/:orgId/organizations',
  CreateOrganizationDashboard: '/home/:orgId/create-organization',
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