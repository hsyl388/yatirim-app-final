import Head from "next/head";
import InvestmentApp from "../YatirimWebUygulamasi";

export default function Home() {
  return (
    <>
      <Head>
        <title>Yatırım Simülasyonu</title>
      </Head>
      <InvestmentApp />
    </>
  );
}
