/**
 * Application routes
 */
export const Pages = {
  Home: '/home',
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
  Organizations: '/home/organizations',
  CreateOrganizationDashboard: '/home/create-organization',
  Agents: '/home/agents',
  Secrets: '/home/secrets',
  ResetPasswordConfirmInner: 'reset-password/confirm',
};

/**
 * Route paths with parameters
 */
export const RoutePaths = {
  ...Pages,
};