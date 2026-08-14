/**
 * Safely navigates back if stack history exists, otherwise fallback to destination
 */
export function safeBack(router: any, fallbackPath: string = '/') {
  try {
    if (router && typeof router.canGoBack === 'function' && router.canGoBack()) {
      router.back();
    } else if (router && typeof router.replace === 'function') {
      router.replace(fallbackPath as any);
    }
  } catch (err) {
    if (router && typeof router.replace === 'function') {
      router.replace(fallbackPath as any);
    }
  }
}
