<template>
	<view
		class="u-safe-bottom"
		:style="[style]"
		:class="[!isNvue && 'u-safe-area-inset-bottom']"
	>
	</view>
</template>

<script>
	import props from "./props.js"
	import mixin from '../../libs/mixin/mixin'
	import mpMixin from '../../libs/mixin/mpMixin'
	/**
	 * SafeBottom 底部安全区
	 * @description 这个适配，主要是针对IPhone X等一些底部带指示条的机型，指示条的操作区域与页面底部存在重合，容易导致用户误操作，因此我们需要针对这些机型进行底部安全区适配。
	 * @tutorial https://uveiw.bdxmz.cn/components/safeAreaInset.html
	 * @property {type}		prop_name
	 * @property {Object}	customStyle	定义需要用到的外部样式
	 *
	 * @event {Function()}
	 * @example <u-status-bar></u-status-bar>
	 */
	export default {
		name: "u-safe-bottom",
		mixins: [mpMixin, mixin, props],
		data() {
			return {
				safeAreaBottomHeight: 0,
				isNvue: false,
			};
		},
		computed: {
			style() {
				const style = {};
				// #ifdef APP-NVUE
				// nvue下，高度使用js计算填充
				style.height = uni.$u.addUnit(uni.$u.window().safeAreaInsets.bottom, 'px');
				// #endif
				return uni.$u.deepMerge(style, uni.$u.addStyle(this.customStyle));
			},
		},
		mounted() {
			// #ifdef APP-NVUE
			// 标识为是否nvue
			this.isNvue = true;
			// #endif
		},
	};
</script>

<style lang="scss" scoped>
	.u-safe-bottom {
		/* #ifndef APP-NVUE */
		width: 100%;
		/* #endif */
	}
</style>
