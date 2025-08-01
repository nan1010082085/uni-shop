/*
 * @Author       : LQ
 * @Description  :
 * @version      : 1.0
 * @Date         : 2021-08-20 16:44:21
 * @LastAuthor   : LQ
 * @lastTime     : 2021-08-20 17:08:25
 * @FilePath     : /u-view2.0/uview-ui/libs/config/props/slider.js
 */

import theme from '../theme.js'

export default {
    // slider组件
    slider: {
        value: 0,
        blockSize: 18,
        min: 0,
        max: 100,
        step: 1,
        activeColor: theme.primary,
        inactiveColor: theme.lightColor,
        blockColor: theme.bgColor,
        showValue: false,
		disabled:false,
        blockStyle: {}
    }
}
