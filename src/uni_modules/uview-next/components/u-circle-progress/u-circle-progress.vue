<template>
	<view class="u-circle-progress" :style="{
			...progressStyle,
			backgroundColor: bgColor
		}">
		<!-- 支付宝小程序不支持canvas-id属性，必须用id属性 -->
		<!-- #ifndef APP-NVUE -->
		<canvas class="u-canvas-bg" :canvas-id="elBgId" :id="elBgId" :style="progressStyle"></canvas>
		<canvas class="u-canvas" :canvas-id="elId" :id="elId" :style="progressStyle"></canvas>
		<!-- #endif -->
		
		<!-- #ifdef APP-NVUE -->
		<gcanvas class="u-canvas-bg" :ref="elBgId" :style="progressStyle"></gcanvas>
		<gcanvas class="u-canvas" :ref="elId" :style="progressStyle"></gcanvas>
		<!-- #endif -->
		<slot></slot>
	</view>
</template>

<script>
import props from './props.js'
import mixin from '../../libs/mixin/mixin'
import mpMixin from '../../libs/mixin/mpMixin'

// #ifdef APP-NVUE
import { enable, WeexBridge } from '../../libs/gcanvas/index.js';
// #endif

/**
 * circleProgress 环形进度条
 * @description 展示操作或任务的当前进度，比如上传文件，是一个圆形的进度条。注意：此组件的percent值只能动态增加，不能动态减少。
 * @tutorial https://uveiw.bdxmz.cn/components/circleProgress.html
 * @property {String Number} percent 圆环进度百分比值，为数值类型，0-100
 * @property {String} inactive-color 圆环的底色，默认为灰色(该值无法动态变更)（默认#ececec）
 * @property {String} active-color 圆环激活部分的颜色(该值无法动态变更)（默认#19be6b）
 * @property {String Number} width 整个圆环组件的宽度，高度默认等于宽度值，单位rpx（默认200）
 * @property {String Number} border-width 圆环的边框宽度，单位rpx（默认14）
 * @property {String Number} duration 整个圆环执行一圈的时间，单位ms（默认呢1500）
 * @property {String} type 如设置，active-color值将会失效
 * @property {String} bg-color 整个组件背景颜色，默认为白色
 * @example <u-circle-progress active-color="#2979ff" :percent="80"></u-circle-progress>
 */
export default {
	name: 'u-circle-progress',
	mixins: [mpMixin, mixin, props],
	data() {
		return {
			// #ifdef MP-WEIXIN
			elBgId: 'uCircleProgressBgId', // 微信小程序中不能使用this.$u.guid()形式动态生成id值，否则会报错
			elId: 'uCircleProgressElId',
			// #endif
			// #ifndef MP-WEIXIN
			elBgId: uni.$u.guid(), // 非微信端的时候，需用动态的id，否则一个页面多个圆形进度条组件数据会混乱
			elId: uni.$u.guid(),
			// #endif
			widthPx: this.width, // 转成px后的整个组件的背景宽度
			borderWidthPx:this.borderWidth, // 转成px后的圆环的宽度
			startAngle: -Math.PI / 2, // canvas画圆的起始角度，默认为3点钟方向，定位到12点钟方向
			progressContext: null, // 活动圆的canvas上下文
			newPercent: 0, // 当动态修改进度值的时候，保存进度值的变化前后值，用于比较用
			oldPercent: 0 // 当动态修改进度值的时候，保存进度值的变化前后值，用于比较用
		};
	},
	watch: {
		percent(nVal, oVal = 0) {
			if (nVal > 100) nVal = 100;
			if (nVal < 0) oVal = 0;
			// 此值其实等于this.percent，命名一个新
			this.newPercent = nVal;
			this.oldPercent = oVal;
			setTimeout(() => {
				// 无论是百分比值增加还是减少，需要操作还是原来的旧的百分比值
				// 将此值减少或者新增到新的百分比值
				this.drawCircleByProgress(oVal);
			}, 50);
		}
	},
	created() {
		// 赋值，用于加载后第一个画圆使用
		this.newPercent = this.percent;
		this.oldPercent = 0;
	},
	computed: {
		// 有type主题时，优先起作用
		circleColor() {
			if (['success', 'error', 'info', 'primary', 'warning'].indexOf(this.type) >= 0){
				return this.$u.theme[this.type];
			}else{
				return this.activeColor;
			}
		},
		progressStyle() {
			return {
				width: uni.$u.addUnit(this.widthPx),
				height: uni.$u.addUnit(this.widthPx),
			}
		},
	},
	mounted() {
		this.$nextTick(() => {
			setTimeout(() => {
				this.drawProgressBg();
				this.drawCircleByProgress(this.oldPercent);
			}, 100)
		})
	},
	methods: {
		drawProgressBg() {

			// #ifdef APP-NVUE
			let ganvas = this.$refs[this.elBgId];
			let canvasObj = enable(ganvas, {bridge: WeexBridge});
			let ctx = canvasObj.getContext('2d');
			// #endif

			// #ifndef APP-NVUE
			let ctx = uni.createCanvasContext(this.elBgId, this);
			// #endif

			ctx.setLineWidth(this.borderWidthPx); // 设置圆环宽度
			ctx.setStrokeStyle(this.inactiveColor); // 线条颜色
			ctx.beginPath(); // 开始描绘路径
			// 设置一个原点(110,110)，半径为100的圆的路径到当前路径
			let radius = this.widthPx / 2;
			ctx.arc(radius, radius, radius - this.borderWidthPx, 0, 2 * Math.PI, false);
			ctx.stroke(); // 对路径进行描绘
			ctx.draw()

		},
		drawCircleByProgress(progress) {
			// 第一次操作进度环时将上下文保存到了this.data中，直接使用即可
			let ctx = this.progressContext;
			if (!ctx) {

				// #ifdef APP-NVUE
				let ganvas = this.$refs[this.elId];
				let canvasObj = enable(ganvas, {bridge: WeexBridge});
				ctx = canvasObj.getContext('2d');
				// #endif

				// #ifndef APP-NVUE
				ctx = uni.createCanvasContext(this.elId, this);
				// #endif
				this.progressContext = ctx;
			}

			// 表示进度的两端为圆形
			ctx.setLineCap('round');
			// 设置线条的宽度和颜色
			ctx.setLineWidth(this.borderWidthPx);
			ctx.setStrokeStyle(this.circleColor);
			// 将总过渡时间除以100，得出每修改百分之一进度所需的时间
			let time = Math.floor(this.duration / 100);
			// 结束角的计算依据为：将2π分为100份，乘以当前的进度值，得出终止点的弧度值，加起始角，为整个圆从默认的
			// 3点钟方向开始画图，转为更好理解的12点钟方向开始作图，这需要起始角和终止角同时加上this.startAngle值
			let endAngle = ((2 * Math.PI) / 100) * progress + this.startAngle;
			ctx.beginPath();
			// 半径为整个canvas宽度的一半
			let radius = this.widthPx / 2;
			ctx.arc(radius, radius, radius - this.borderWidthPx, this.startAngle, endAngle, false);
			ctx.stroke();
			ctx.draw();
			// 如果变更后新值大于旧值，意味着增大了百分比
			if (this.newPercent > this.oldPercent) {
				// 每次递增百分之一
				progress++;
				// 如果新增后的值，大于需要设置的值百分比值，停止继续增加
				if (progress > this.newPercent) return;
			} else {
				// 同理于上面
				progress--;
				if (progress < this.newPercent) return;
			}
			setTimeout(() => {
				// 定时器，每次操作间隔为time值，为了让进度条有动画效果
				this.drawCircleByProgress(progress);
			}, time);
		}
	}
};
</script>

<style lang="scss" scoped>
@import "../../libs/css/components.scss";

.u-circle-progress {
	position: relative;
	/* #ifndef APP-NVUE */
	display: inline-flex;		
	/* #endif */
	align-items: center;
	justify-content: center;
}

.u-canvas-bg {
	position: absolute;
}

.u-canvas {
	position: absolute;
}
</style>