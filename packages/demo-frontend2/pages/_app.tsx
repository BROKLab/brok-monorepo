import type { AppProps } from 'next/app'
import { NextUIProvider } from '@nextui-org/react'
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }: AppProps) {
  return <div>
    <NextUIProvider>
      <Component {...pageProps} />
    </NextUIProvider>
  </div>
}

export default MyApp
