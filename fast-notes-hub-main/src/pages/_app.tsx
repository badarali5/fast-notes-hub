import type { AppProps } from 'next/app'
import Head from 'next/head'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="google-site-verification"
          content="bvW3jBbi7LGx1bkZTk9oSXD6gcHv8CL_8peyaTEOa5k"
        />
      </Head>
      <Component {...pageProps} />
    </>
  )
}