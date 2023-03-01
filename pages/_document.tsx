import React from 'react';
import Document, {DocumentContext, Html, Head, Main, NextScript} from 'next/document';

type Props = {
    helmet: any;
};

class CustomDocument extends Document<Props> {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx);

        return initialProps;
    }

    render() {
        return (
            <Html className="bg-gray-100 text-gray-800" lang="en">
                <Head>
                    <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
                    <link
                        rel="apple-touch-icon"
                        sizes="120x120"
                        href="/images/apple-touch-icon.png"
                    />
                    <link
                        rel="icon"
                        type="image/png"
                        sizes="32x32"
                        href="/images/favicon-32x32.png"
                    />
                    <link
                        rel="icon"
                        type="image/png"
                        sizes="16x16"
                        href="/images/favicon-16x16.png"
                    />
                    <link rel="manifest" href="/images/site.webmanifest" />
                    <link rel="mask-icon" href="/images/safari-pinned-tab.svg" color="#ffffff" />
                    <meta name="msapplication-TileColor" content="#ffffff" />
                    <meta name="theme-color" content="#ffffff" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                    <div id="portals" />
                </body>
            </Html>
        );
    }
}

export default CustomDocument;
