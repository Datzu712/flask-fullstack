import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'node:url';

const isProduction = process.env.NODE_ENV == 'production';
const SOURCE_FOLDER = './src/ts';
// If true, each global file will be included as a separate bundle (They will continue to be included in the entries bundle)
const GLOBAL_FILE_SEPARATE_BUNDLE = true;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Folder structure:
 * ├── components (standard folder for shared components)
 * │   └── modals.ts
 * │
 * ├── private (folder for private pages)
 * │   ├── users (entry folder)
 * │   │   ├── userHelper.ts
 * │   │   └── users.ts
 * │   │
 * │   ├── clients (entry folder)
 * │   │   └── clients.ts
 * │   ├── main.ts
 * │   └── sidebar.ts (main.ts & sidebar.ts will be included in all entries)
 * │
 * └── public (folder for public pages)
 *     ├── login (entry folder)
 *     │   └── login.ts
 *     └── public.ts (global entry)
 *
 * Note: It's not necessary to have two folders named "private" and "public"; you can have any number of folders with any name.
 *
 * Webpack entries result:
 * [
 *   {
 *       clients: [
 *           '/flask-template.git/src/ts/private/clients/clients.ts', // file inside the entry folder
 *           '/flask-template.git/src/ts/private/main.ts', // global file
 *           '/flask-template.git/src/ts/private/sidebar.ts' // global file
 *       ]
 *   },
 *   {
 *       users: [
 *           '/flask-template.git/src/ts/private/users/users.ts', // file inside the entry folder
 *           '/flask-template.git/src/ts/private/users/userHelper.ts', // file inside the entry folder
 *           '/flask-template.git/src/ts/private/main.ts', // global file
 *           '/flask-template.git/src/ts/private/sidebar.ts' // global file
 *       ]
 *   },
 *   {
 *       login: [
 *           '/flask-template.git/src/ts/public/login/login.ts', // file inside the entry folder
 *           '/flask-template.git/src/ts/public/public.ts' // global file
 *       ]
 *   }
 * ]
 *
 * If GLOBAL_FILE_SEPARATE_BUNDLE is true, the result will be:
 * {
 *   clients: [
 *     '/home/juan/Documents/dev/python/For_Life_S.A.git/src/ts/private/clients/clients.ts',
 *     '/home/juan/Documents/dev/python/For_Life_S.A.git/src/ts/private/main.ts',
 *     '/home/juan/Documents/dev/python/For_Life_S.A.git/src/ts/private/sidebar.ts'
 *   ],
 *   users: [
 *     '/home/juan/Documents/dev/python/For_Life_S.A.git/src/ts/private/users/users.ts',
 *     '/flask-template.git/src/ts/private/users/userHelper.ts',
 *     '/home/juan/Documents/dev/python/For_Life_S.A.git/src/ts/private/main.ts',
 *     '/home/juan/Documents/dev/python/For_Life_S.A.git/src/ts/private/sidebar.ts'
 *   ],
 *   login: [
 *     '/home/juan/Documents/dev/python/For_Life_S.A.git/src/ts/public/login/login.ts',
 *     '/home/juan/Documents/dev/python/For_Life_S.A.git/src/ts/public/public.ts'
 *   ],
 *   main: [
 *     '/home/juan/Documents/dev/python/For_Life_S.A.git/src/ts/private/main.ts'
 *   ],
 *   sidebar: [
 *     '/home/juan/Documents/dev/python/For_Life_S.A.git/src/ts/private/sidebar.ts'
 *   ],
 *   public: [
 *     '/home/juan/Documents/dev/python/For_Life_S.A.git/src/ts/public/public.ts'
 *   ]
 * }
 */
const entries = fs
    .readdirSync(SOURCE_FOLDER)
    .filter((folderName) => folderName !== 'components')
    .map((folderName) => {
        const folderContents = fs.readdirSync(path.resolve(SOURCE_FOLDER, folderName));

        const entries = [];
        const globalFiles = [];
        folderContents.forEach((fileOrFolder) => {
            if (fs.lstatSync(path.resolve(SOURCE_FOLDER, folderName, fileOrFolder)).isFile()) {
                globalFiles.push(path.resolve(SOURCE_FOLDER, folderName, fileOrFolder));
            } else {
                entries.push(fileOrFolder);
            }
        });

        const webpackEntries = {};
        for (const entry of entries) {
            const entryFiles = fs.readdirSync(path.resolve(SOURCE_FOLDER, folderName, entry));
            const files = entryFiles.map((file) => path.resolve(SOURCE_FOLDER, folderName, entry, file));
            files.push(...globalFiles);

            webpackEntries[entry] = files;
        }

        if (GLOBAL_FILE_SEPARATE_BUNDLE) {
            for (const globalFile of globalFiles) {
                const globalFileName = path.basename(globalFile, path.extname(globalFile));
                webpackEntries[globalFileName] = [globalFile];
            }
        }
        return webpackEntries;
    })
    .reduce((acc, entry) => {
        return { ...acc, ...entry };
    });

console.debug('Webpack entries:', entries);

const config = {
    entry: entries,
    context: path.resolve(__dirname, SOURCE_FOLDER),
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'app/static/js'),
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: 'ts-loader',
                exclude: ['/node_modules/'],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    watchOptions: {
        ignored: /node_modules/,
    },
    devtool: false,
};

export default () => {
    if (isProduction) {
        config.mode = 'production';
    } else {
        config.mode = 'development';
    }
    return config;
};
