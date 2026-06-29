import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Html({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Afterly</title>
        <meta name="description" content="Your people. Your night." />
        <style>{`
          body { margin: 0; padding: 0; background: #0E0E10; color: #F0EEE8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        `}</style>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}