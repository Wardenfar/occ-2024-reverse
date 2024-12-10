import { defineConfig } from "vite";
import obfuscatorPlugin from "vite-plugin-javascript-obfuscator";

export default defineConfig({
    plugins: [
        obfuscatorPlugin({
            // little obfuscation to not be very easy
            options: {
                compact: true,
                renameGlobals: false,
                identifierNamesGenerator: 'hexadecimal',
                simplify: true,
                stringArrayEncoding: ["base64"],
                // ...  [See more options](https://github.com/javascript-obfuscator/javascript-obfuscator)
            },
        }),
    ],
});