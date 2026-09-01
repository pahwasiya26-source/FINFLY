'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { StyleRegistry, createStyleRegistry } from 'styled-jsx';

/**
 * Required wrapper for styled-jsx in Next.js App Router.
 * Collects all <style jsx> rules during SSR and injects them
 * into <head> before hydration, preventing a flash of unstyled
 * content (FOUC) and ensuring CSS scoping hashes match.
 *
 * Per: node_modules/next/dist/docs/01-app/02-guides/css-in-js.md
 */
export default function StyledJsxRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [jsxStyleRegistry] = useState(() => createStyleRegistry());

  useServerInsertedHTML(() => {
    const styles = jsxStyleRegistry.styles();
    jsxStyleRegistry.flush();
    return <>{styles}</>;
  });

  return <StyleRegistry registry={jsxStyleRegistry}>{children}</StyleRegistry>;
}
