import type { AppProps } from 'next/app'
import { NextUIProvider } from '@nextui-org/react'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function MyApp({ Component, pageProps }: AppProps) {
  return <div>
    <NextUIProvider>
      <Component {...pageProps} />
    </NextUIProvider>
  </div>
}

export default MyApp
