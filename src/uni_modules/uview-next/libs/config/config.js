// 此版本发布于2025-07-16
const version = '3.3.0';

// 开发环境才提示，生产环境不会提示
if (process.env.NODE_ENV === 'development') {
	console.log(`\n %c uView V${version} https://uveiw.bdxmz.cn/ \n\n`, 'color: #ffffff; background: #3c9cff; padding:5px 0; border-radius: 5px;');
}

export default {
	version,
	// 主题名称
	type: ['primary', 'success', 'info', 'error', 'warning'],
	// 默认单位，可以通过配置为rpx，那么在用于传入组件大小参数为数值时，就默认为rpx
	unit: 'px'
};
