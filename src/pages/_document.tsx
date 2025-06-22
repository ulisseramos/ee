import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html style={{ height: '100%', width: '100%', background: '#030712' }}>
      <Head />
      <body style={{
        height: '100%',
        width: '100%',
        margin: 0,
        padding: 0,
        background: '#030712',
        boxShadow: 'none',
        border: 'none',
        outline: 'none',
        overflowX: 'hidden',
      }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 