import { AppProps } from "next/app";
import Head from "next/head";
import { FC, useState } from "react";

import { ContextProvider } from "contexts/ContextProvider";

import { AppBar } from "../components/AppBar";
import { Footer } from "../components/Footer";
import Notification from "../components/Notification";

require("@solana/wallet-adapter-react-ui/styles.css");
require("../styles/globals.css");

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const [notification, setNotification] = useState({
    type: "info",
    message: "Welcome to Solana Token Creator",
    description: "This is a notification description",
    txid: "123456",
    onHide: () => setNotification(null),
  });

  return (
    <div className="bg-default-900">
      <Head>
        <title>Solana Token Creator</title>
      </Head>

      <ContextProvider>
        {notification && <Notification {...notification} />}
        <AppBar />
        <Component {...pageProps} />
        <Footer />
      </ContextProvider>

      <script src="assets/libs/preline/preline.js"></script>
      <script src="assets/libs/swiper/swiper-bundle.min.js"></script>
      <script src="assets/libs/gumshoe/gumshoe.polyfills.min.js"></script>
      <script src="assets/libs/lucide/lucide.min.js"></script>
      <script src="assets/libs/aos/aos.js"></script>
      <script src="assets/js/swiper.js"></script>
      <script src="assets/js/theme.js"></script>
    </div>
  );
};

export default App;