import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [uni()],
  define: {},
	css: {
		preprocessorOptions: {
			scss: {
        quietDeps: true,
				logger: {
					warn: (message : string) => {
						// 过滤掉 legacy-js-api 警告
						if (!message.includes('legacy-js-api')) {
							console.warn(message)
						}
					}
				}
			}
		}
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	}
})
