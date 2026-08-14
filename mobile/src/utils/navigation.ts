/**
 * Safely navigates back if stack history exists, otherwise fallback to tabs/home
 */
export function safeBack(router: any, fallbackPath: string = '/(tabs)') {
  if (router && typeof router.canGoBack === 'function' && router.canGoBack()) {
    router.back();
  } else if (router && typeof router.replace === 'function') {
    router.replace(fallbackPath as any);
  }
}
